import CustomButton from "@/components/button/CustomButton";
import PrimaryButton from "@/components/button/PrimaryButton";
import Header from "@/components/Header";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { useHistoryMutation } from "@/utils/mutation";
import { moderateScale, normalizeFontSize } from "@/utils/style";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function PrayerRecord() {

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const {
    lecture_id, duration
  } = useLocalSearchParams<{
    lecture_id: string,
    duration: string
  }>();

  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [boldTextOpacity, setBoldTextOpacity] = useState(1); // BoldText의 opacity 상태
  const textInputRef = useRef<TextInput>(null); // TextInput의 참조 생성

  const { mutateAsync: insertPrayerHistory } = useHistoryMutation(() => {
    setIsSaving(false);
  })

  const submitPrayerRecord = async (noteContent: string) => {
    if (isSaving) return;

    setIsSaving(true);

    // save lecture history in AsyncStorage
    const lectureHistory = await AsyncStorage.getItem('lecture-history');
    const lectureHistoryData = lectureHistory ? JSON.parse(lectureHistory) : {};
    lectureHistoryData[lecture_id] = lectureHistoryData[lecture_id] ? lectureHistoryData[lecture_id] + 1 : 1;
    await AsyncStorage.setItem('lecture-history', JSON.stringify(lectureHistoryData));

    try {
      await insertPrayerHistory({ lecture_id, duration, note: noteContent });
      setIsSaving(false);
      await queryClient.invalidateQueries({ queryKey: ["history"] });
      await queryClient.invalidateQueries({ queryKey: ["plan"] });
      router.dismissTo({
        pathname: `/calendar`,
        params: {
          backToLink: '/',
        }
      });
    } catch (e) {
      console.error(e);
      Alert.alert('오류', '기록 저장에 실패했습니다.');

      setIsSaving(false);

      router.dismissTo('/');
    }
  }

  const onPressSave = async () => {
    await submitPrayerRecord(note);
  }

  const onPressCancel = async () => {
    await submitPrayerRecord("");
  }

  const onComplete = () => {
    if (textInputRef.current) {
      textInputRef.current.blur(); // TextInput에 포커스 잃게 하기
    }
  }

  return (
    <>
      <View
        style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 20, 26, 0.4)' }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.bottom : 0}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={styles.container}>
          <Header
            style={styles.header}
            prefix={<View></View>}
            suffix={
              <TouchableOpacity
                style={{ opacity: boldTextOpacity === 1 ? 0 : 1 }}
                onPress={onComplete}
                hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
              >
                <MediumText
                  fontSize={16}
                  color="#959FFF"
                >
                  완료하기
                </MediumText>
              </TouchableOpacity>
            }
          />
          <BoldText
            style={[styles.title, { opacity: boldTextOpacity }]} // opacity 상태 적용
            fontSize={24}
            lineHeight={36}
          >
            {"떠오르는 생각들을 기록하며\n기도를 마무리해보세요"}
          </BoldText>

          <View style={styles.textInput}>
            <TextInput
              ref={textInputRef}
              value={note}
              multiline={true}
              maxLength={1500}
              style={styles.text}
              scrollEnabled={true}
              onChangeText={(v) => setNote(v)}
              placeholderTextColor={"#B3B3B3"}
              placeholder="여기를 탭하여 입력하세요(최대 1500자)"
              onFocus={() => setBoldTextOpacity(0.5)} // TextInput이 포커스될 때 opacity 변경
              onBlur={() => setBoldTextOpacity(1)} // TextInput이 포커스를 잃을 때 opacity 복원
            />
          </View>

          <View style={[styles.buttonList, { bottom: insets.bottom, opacity: boldTextOpacity !== 1 ? 0 : 1 }]}>
            <CustomButton onPress={onPressCancel} style={[styles.button, styles.secondaryButton]}>
              <MediumText
                fontSize={14}
              >
                괜찮습니다
              </MediumText>
            </CustomButton>
            <PrimaryButton onPress={onPressSave} style={styles.button}>
              <MediumText
                fontSize={14}
              >
                저장하기
              </MediumText>
            </PrimaryButton>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    marginBottom: moderateScale(20)
  },
  title: {
    paddingHorizontal: moderateScale(24),
    marginBottom: moderateScale(44)
  },
  textInput: {
    paddingHorizontal: moderateScale(24),
  },
  text: {
    fontFamily: 'NotoSansKR_400Regular',
    fontSize: normalizeFontSize(16),
    lineHeight: normalizeFontSize(28),
    color: "#FFFFFF",
    height: '80%',
    textAlignVertical: 'top'
  },
  buttonList: {
    position: 'absolute',
    flexDirection: 'row',
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(8),
    marginBottom: Platform.OS === 'ios' ? 0 : moderateScale(24),
  },
  button: {
    flex: 1,
    paddingVertical: moderateScale(12),
  },
  secondaryButton: {
    backgroundColor: 'rgba(15, 20, 26, 0.4)',
  }
})