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
              hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
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
              질문하는 방법 알아보기
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
          ✨ 이런 분들께 필요합니다
        </BoldText>
        <View style={{
          marginBottom: moderateScale(40),
        }}>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            •	반복되는 유혹과 죄의 문제를 해결하고 싶을 때
          </RegularText>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            •	마음속 음란, 정욕 등의 죄와 싸우는 방법을 알고 싶을 때
          </RegularText>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            •	기도가 막히거나, 하나님과 멀어진 것처럼 느껴질 때
          </RegularText>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            •	성경 말씀을 듣고도 실천이 어렵거나 영적 성장이 더디다고 느낄 때
          </RegularText>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            •	하나님의 뜻을 따라 살고 싶지만, 육신의 길을 따르는 자신을 발견할 때
          </RegularText>
        </View>

        {/* 질문을 남기는 방법 */}
        <BoldText
          style={{
            marginBottom: moderateScale(12),
          }}
          fontSize={16}
          lineHeight={24}
        >
          📌 질문을 남기는 방법
        </BoldText>
        <View style={{
          marginBottom: moderateScale(40),
        }}>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            1️⃣ 신앙 문제에 대한 고민을 자유롭게 작성해 주세요.
          </RegularText>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            2️⃣ 질문이 구체적일수록 더 깊이 있는 답변을 받을 수 있습니다.
          </RegularText>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            3️⃣ 답변이 등록되면 알림을 통해 알려드립니다.
          </RegularText>
        </View>
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