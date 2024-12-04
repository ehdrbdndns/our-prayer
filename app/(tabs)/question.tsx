import Chat from '@/assets/images/icon/chat.svg';
import Edit from '@/assets/images/icon/edit.svg';
import Star from '@/assets/images/icon/star.svg';
import Trash from '@/assets/images/icon/trash.svg';
import InputButton from '@/components/InputButton';
import { BoldText } from "@/components/text/BoldText";
import CustomText from '@/components/text/CustomText';
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import { moderateScale } from "@/utils/style";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QuestionPage() {

  const [questionList, setQuestionList] = useState([1, 2, 3]);

  const onPressDelete = () => {
    setQuestionList(questionList.filter((_, index) => index !== 0));
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Title */}
      <BoldText
        style={styles.title}
        fontSize={24}
        lineHeight={36}
      >
        궁금한 점이 있으신가요?
      </BoldText>

      {/* Desc */}
      <RegularText
        style={styles.desc}
        color="#B3B3B3"
        fontSize={14}
        lineHeight={24}
      >
        기도 방법, 삶의 고민 등 어떤 질문이든지 환영합니다
      </RegularText>

      {/* Link */}
      <TouchableOpacity style={styles.textButton}>
        <MediumText
          style={{ textDecorationLine: 'underline' }}
          fontSize={14}
          lineHeight={28}
          color="#959FFF"
        >
          질문방법 및 답변자 프로필 보기
        </MediumText>
      </TouchableOpacity>

      {/* Question List */}
      <View style={styles.questionList}>
        <BoldText
          fontSize={16}
          lineHeight={24}
        >
          질문 내역
        </BoldText>

        {
          questionList.length === 0 ? (
            <View style={styles.emptyQuestion}>
              <Star opacity={0.8} />
              <RegularText
                color="#B3B3B3"
                fontSize={14}
                lineHeight={24}
              >
                아직 질문 내역이 없습니다!
              </RegularText>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollView}>
              {
                questionList.map((question, index) => {
                  return (
                    <View style={styles.card}>
                      {/* date */}
                      <MediumText
                        style={{ marginBottom: moderateScale(4) }}
                        color='#B3B3B3'
                        fontSize={14}
                        lineHeight={26}
                      >
                        2024년 10월 19일
                      </MediumText>

                      {/* Text */}
                      <RegularText
                        style={{ marginBottom: moderateScale(16) }}
                        fontSize={16}
                        lineHeight={28}
                      >
                        {"안녕하세요, 목사님\n저는 현재 삶의 방향을 찾고 싶어서 기도하고 있습니다. 여러 가지 선택지가 있어..."}
                      </RegularText>

                      <View style={styles.cardIconList}>
                        {/* Chat */}
                        <View style={{ flexDirection: 'row', gap: moderateScale(4), alignItems: 'center' }}>
                          <Chat width={moderateScale(24)} height={moderateScale(24)} />
                          <CustomText
                            style={{ fontFamily: 'Inter_600SemiBold' }}
                            fontSize={16}
                            lineHeight={28}
                            color='#959FFF'
                          >
                            1
                          </CustomText>
                        </View>

                        <View style={{ flexDirection: 'row', gap: moderateScale(24) }}>
                          {/* Edit */}
                          <Edit width={moderateScale(24)} height={moderateScale(24)} />

                          {/* Trash */}
                          <TouchableOpacity onPress={onPressDelete}>
                            <Trash width={moderateScale(24)} height={moderateScale(24)} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )
                })
              }
            </ScrollView>
          )
        }
      </View>

      <InputButton />
    </SafeAreaView >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%'
  },
  hidden: {
    display: 'none'
  },
  title: {
    marginTop: moderateScale(40),
    marginBottom: moderateScale(12),
    paddingHorizontal: moderateScale(24)
  },
  desc: {
    marginBottom: moderateScale(4),
    paddingHorizontal: moderateScale(24)
  },
  textButton: {
    paddingHorizontal: moderateScale(24),
    marginBottom: moderateScale(40),
  },
  questionList: {
    paddingHorizontal: moderateScale(24),
    flexGrow: 1,
    gap: moderateScale(12)
  },
  emptyQuestion: {
    alignItems: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }]
  },
  scrollView: {
    gap: moderateScale(12),
    paddingBottom: moderateScale(190),
  },
  card: {
    borderRadius: moderateScale(10),
    padding: moderateScale(16),
    backgroundColor: 'rgba(31, 31, 31, 0.5)'
  },
  cardIconList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
})