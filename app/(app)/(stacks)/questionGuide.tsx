import LeftArrow from "@/assets/images/icon/leftArrow.svg";
import Header from "@/components/Header";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import { moderateScale } from "@/utils/style";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QuestionGuide() {

  const onPressBack = () => {
    router.back();
  }

  return (
    <SafeAreaView>
      {/* Header */}
      <Header
        style={styles.header}
        prefix={
          <View style={styles.headerPrefix}>
            <TouchableOpacity
              onPress={onPressBack}
            >
              <LeftArrow
                width={moderateScale(24)}
                height={moderateScale(24)}
              />
            </TouchableOpacity>
            <MediumText
              color="#FFF"
              fontSize={16}
            >
              질문하기 메뉴 사용법
            </MediumText>
          </View>
        }
      />

      <View style={styles.container}>
        {/* 유의 사항 */}
        <BoldText
          style={{
            marginBottom: moderateScale(12),
          }}
          fontSize={16}
          lineHeight={24}
        >
          질문 시 유의사항
        </BoldText>
        <RegularText
          style={{
            marginBottom: moderateScale(40),
          }}
          color="rgba(255, 255, 255, 0.8)"
          fontSize={14}
        >
          질문 시 유의사항에 대한 상세 내용
        </RegularText>

        {/* 답변자 프로필 */}
        <BoldText
          style={{
            marginBottom: moderateScale(12),
          }}
          fontSize={16}
          lineHeight={24}
        >
          답변자 프로필
        </BoldText>
        <RegularText
          style={{
            marginBottom: moderateScale(40),
          }}
          color="rgba(255, 255, 255, 0.8)"
          fontSize={14}
        >
          답변자 프로필에 대한 상세 내용
        </RegularText>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    marginBottom: moderateScale(24),
  },
  headerPrefix: {
    gap: moderateScale(16),
    flexDirection: 'row',
  },
  container: {
    paddingHorizontal: moderateScale(24),
  }
})