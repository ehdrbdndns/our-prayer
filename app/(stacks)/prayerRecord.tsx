import CustomButton from "@/components/button/CustomButton";
import PrimaryButton from "@/components/button/PrimaryButton";
import Header from "@/components/Header";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { moderateScale } from "@/utils/style";
import { router } from "expo-router";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function PrayerRecord() {

  const insets = useSafeAreaInsets();

  const onPressSave = () => {
    // Todo save data
    router.push('/(tabs)');
  }

  const onPressCancel = () => {
    router.push('/(tabs)');
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
        <TextInput
          style={styles.text}
          placeholder="여기를 탭하여 입력하세요"
          placeholderTextColor={"#B3B3B3"}
          multiline={true}
          scrollEnabled={true}
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
    fontFamily: 'NotoSansKR-Regular',
    fontSize: moderateScale(16),
    lineHeight: moderateScale(28),
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