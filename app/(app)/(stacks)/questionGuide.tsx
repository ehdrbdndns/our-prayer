import LeftArrow from "@/assets/images/icon/leftArrow.svg";
import Header from "@/components/Header";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import { moderateScale } from "@/utils/style";
import { router } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
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
              상담신청
            </MediumText>
          </View>
        }
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: moderateScale(40),
        }}
      >
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
            1️⃣  반복되는 유혹과 죄의 문제를 해결하고 싶을 때
          </RegularText>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            2️⃣  마음속 음란, 정욕 등을 극복하는 방법을 알고 싶을 때
          </RegularText>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            3️⃣  기도가 막히거나, 하나님과 멀어진 것처럼 느껴질 때
          </RegularText>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            4️⃣  성경 말씀을 들었지만, 실천이 어렵거나 영적 성장이 더디다고 느낄 때
          </RegularText>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            5️⃣  하나님의 뜻을 따라 살고 싶지만, 육신의 길을 따르는 자신을 발견할 때
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
          📌 상담 신청 과정
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
            1️⃣  신앙 문제나 고민을 자유롭게 작성해 주세요.
          </RegularText>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            2️⃣  작성하신 내용은 목사님과의 대면 또는 비대면 상담을 통해 함께 나누게 됩니다.
          </RegularText>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            3️⃣  상담 일정을 조율하기 위해 담당자가 회신 드릴 예정이니, 앱 알림을 꼭 켜 주세요.
          </RegularText>
        </View>
        {/* 상담 신청서 작성 가이드 */}
        <BoldText
          style={{
            marginBottom: moderateScale(12),
          }}
          fontSize={16}
          lineHeight={24}
        >
          📝 상담 신청서 작성 가이드
        </BoldText>
        <View
          style={{
            marginBottom: moderateScale(40),
          }}
        >
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            1️⃣  아래 항목을 작성해 주세요:
          </RegularText>
          <RegularText
            style={{
              marginLeft: moderateScale(8),
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            - 이름 (가명 가능),  성별,  나이,  전화번호
          </RegularText>
          <RegularText
            style={{
              marginLeft: moderateScale(8),
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            - 선호하는 요일과 시간,  상담 방식 (대면/비대면)
          </RegularText>
          <RegularText
            style={{
              marginLeft: moderateScale(8),
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            - 호소 내용 (상담 받고 싶은 구체적인 내용)
          </RegularText>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            2️⃣ 전화번호는 선택사항이며, 비대면 상담을 원하시는 경우 연락을 위해 적어주시면 좋습니다.
          </RegularText>
          <RegularText
            style={{
              marginBottom: moderateScale(4),
            }}
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            3️⃣ 신청서 작성 후 일정을 조율하기 위해 담당자가 개별 회신을 드릴 예정입니다. 알림을 키면 더 빠르게 확인할 수 있습니다.
          </RegularText>
        </View>
      </ScrollView>
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