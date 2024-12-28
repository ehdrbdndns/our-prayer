import CustomButton from "@/components/button/CustomButton";
import PrimaryButton from "@/components/button/PrimaryButton";
import Header from "@/components/Header";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { useHistoryMutation } from "@/utils/mutation";
import { moderateScale, normalizeFontSize } from "@/utils/style";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
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

  const { mutate } = useHistoryMutation()

  const onPressSave = async () => {
    // Todo save data
    mutate({ lecture_id, duration, note });
    router.push('/calendar');
  }

  const onPressCancel = () => {
    mutate({ lecture_id, duration, note: '' });
    router.push('/calendar');
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        style={styles.header}
        prefix={<View></View>}
        suffix={
          <TouchableOpacity onPress={onPressSave}>
            <MediumText
              fontSize={16}
              color="#959FFF"
            >
              저장하기
            </MediumText>
          </TouchableOpacity>
        }
      />
      <BoldText
        style={styles.title}
        fontSize={24}
        lineHeight={36}
      >
        {"떠오르는 생각들을 기록하며\n기도를 마무리해보세요"}
      </BoldText>

      <View style={styles.textInput}>
        {/* TODO 1500자 제한 */}
        <TextInput
          value={note}
          multiline={true}
          maxLength={1500}
          style={styles.text}
          scrollEnabled={true}
          onChangeText={(v) => setNote(v)}
          placeholderTextColor={"#B3B3B3"}
          placeholder="여기를 탭하여 입력하세요(최대 1500자)"
        />
      </View>

      <View style={[styles.buttonList, { bottom: insets.bottom }]}>
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
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 20, 26, 0.4)',
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
    height: '80%'
  },
  buttonList: {
    position: 'absolute',
    flexDirection: 'row',
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(8),
  },
  button: {
    flex: 1,
    paddingVertical: moderateScale(12),
  },
  secondaryButton: {
    backgroundColor: 'rgba(15, 20, 26, 0.4)',
  }
})