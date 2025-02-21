import LeftArrow from '@/assets/images/icon/leftArrow.svg';
import CustomButton from "@/components/button/CustomButton";
import PrimaryButton from "@/components/button/PrimaryButton";
import Header from "@/components/Header";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { useHistoryMutation } from "@/utils/mutation";
import { moderateScale, normalizeFontSize } from "@/utils/style";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function PrayerRecord() {

  const insets = useSafeAreaInsets();

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

  const { mutateAsync: insertPrayerHistory } = useHistoryMutation()

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
      router.dismissTo({
        pathname: `/calendar`,
        params: {
          backToLink: '/',
        }
      });
    } catch (e) {
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
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Header
            style={styles.header}
            prefix={<View></View>}
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
        <View style={styles.inputCompleteButtonLayout}>
          <TouchableOpacity
            style={[styles.inputCompleteButton, {
              opacity: boldTextOpacity === 1 ? 0 : 1,
              height: boldTextOpacity === 1 ? 0 : moderateScale(40),
            }]}
            onPress={onComplete}
            hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
          >
            <LeftArrow style={{ transform: [{ rotate: '90deg' }] }} />
          </TouchableOpacity>
        </View>
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
  },
  inputCompleteButtonLayout: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: moderateScale(20)
  },
  inputCompleteButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: 100,
    marginBottom: moderateScale(12),
    backgroundColor: '#4F5FFF',
    justifyContent: 'center',
    alignItems: 'center',
  }
})