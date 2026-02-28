import Chat from '@/assets/images/icon/chat.svg';
import Edit from '@/assets/images/icon/edit.svg';
import LeftArrow from '@/assets/images/icon/leftArrow.svg';
import Send from "@/assets/images/icon/send.svg";
import Star from '@/assets/images/icon/star.svg';
import Trash from '@/assets/images/icon/trash.svg';
import Header from '@/components/Header';
import ScreenLayout from '@/components/ScreenLayout';
import { BoldText } from "@/components/text/BoldText";
import CustomText from '@/components/text/CustomText';
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import { formatDateToKorean } from '@/utils/date';
import { useDeleteQuestionMutation } from '@/utils/mutation';
import { useQuestionQuery } from '@/utils/queries';
import { moderateScale } from "@/utils/style";
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QuestionPage() {

  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);

  const { data: questionList } = useQuestionQuery();

  const { mutate: deleteQuestion } = useDeleteQuestionMutation();

  const onRefresh = async () => {
    setRefreshing(true);

    await queryClient.refetchQueries({ queryKey: ["question"] });

    setRefreshing(false);
  }

  const onPressDelete = (question_id: string) => {
    Alert.alert('삭제', '삭제된 질문 내용은 되돌릴 수 없습니다.', [
      {
        text: '취소',
        style: 'cancel'
      },
      {
        text: '삭제',
        onPress: () => {
          deleteQuestion(question_id);
        }
      }
    ])
  }

  const onPressQuestionGuid = () => {
    router.navigate('/questionGuide')
  }

  const onPressPastor = () => {
    router.navigate('/introducePastor')
  }

  const onPressQuestionCard = (question_id: string) => {
    if (!question_id) return;

    router.navigate({
      pathname: `/questionDetail/[question_id]`,
      params: {
        question_id,
      }
    });
  }

  const onPressEdit = (question_id: string) => {
    router.navigate({
      pathname: `/editQuestion/[question_id]`,
      params: {
        question_id,
      }
    });
  }

  const onPressRequestQuestion = () => {
    router.navigate('/requestQuestion');
  }

  const onPressBack = () => {
    router.back();
  }

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.container}>
        <Header
          style={styles.header}
          prefix={(
            <View style={styles.headerPrefix}>
              <TouchableOpacity
                hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
                onPress={onPressBack}
              >
                <LeftArrow width={moderateScale(24)} height={moderateScale(24)} />
              </TouchableOpacity>
              <MediumText color="#FFF" fontSize={16}>
                신앙 상담
              </MediumText>
            </View>
          )}
        />

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
          신앙생활을 하며 겪는 죄의 문제가 있으신가요? {'\n'}목사님과 상담하고 답을 찾아가세요.
        </RegularText>

        {/* Link */}
        <TouchableOpacity
          onPress={onPressPastor}
          style={[styles.textButton, { marginBottom: moderateScale(0) }]}
        >
          <MediumText
            style={{ textDecorationLine: 'underline' }}
            fontSize={14}
            lineHeight={28}
            color="#959FFF"
          >
            목사님 소개
          </MediumText>
        </TouchableOpacity>

        {/* Link */}
        <TouchableOpacity
          onPress={onPressQuestionGuid}
          style={styles.textButton}
        >
          <MediumText
            style={{ textDecorationLine: 'underline' }}
            fontSize={14}
            lineHeight={28}
            color="#959FFF"
          >
            상담하는 방법 자세히 알아보기
          </MediumText>
        </TouchableOpacity>

        {/* Question List */}
        <View style={styles.questionList}>
          <View style={styles.sectionHeader}>
            <BoldText
              fontSize={16}
              lineHeight={24}
            >
              상담 신청 내역
            </BoldText>
            <TouchableOpacity
              onPress={onPressRequestQuestion}
              style={styles.inlineCtaButton}
            >
              <RegularText
                fontSize={14}
                lineHeight={20}
                color="#FFFFFF"
              >
                상담 신청하기
              </RegularText>
              <Send width={moderateScale(18)} height={moderateScale(18)} />
            </TouchableOpacity>
          </View>

          {
            (questionList ?? []).length === 0 ? (
              <View style={styles.emptyQuestion}>
                <Star opacity={0.8} />
                <RegularText
                  color="#B3B3B3"
                  fontSize={14}
                  lineHeight={24}
                >
                  아직 신청 내역이 없습니다!
                </RegularText>
              </View>
            ) : (
              <ScrollView
                style={{ paddingHorizontal: moderateScale(24) }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollView}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[Platform.OS === "ios" ? "#FFFFFF" : "#000000"]}
                    tintColor={"#FFFFFF"}
                  />
                }
              >
                {
                  (questionList ?? []).map((question) => {
                    return (
                      <TouchableOpacity
                        key={question.question_id}
                        style={styles.card}
                        onPress={() => onPressQuestionCard(question.question_id)}
                      >
                        {/* date */}
                        <MediumText
                          style={{ marginBottom: moderateScale(4) }}
                          color='#B3B3B3'
                          fontSize={14}
                          lineHeight={26}
                        >
                          {formatDateToKorean(question.created_date)}
                        </MediumText>

                        {/* Text */}
                        <RegularText
                          style={{ marginBottom: moderateScale(16) }}
                          fontSize={16}
                          lineHeight={28}
                          numberOfLines={5}
                        >
                          {question.content}
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
                              {question.reply_count}
                            </CustomText>
                          </View>

                          <View style={{ flexDirection: 'row', gap: moderateScale(24) }}>
                            {/* Edit */}
                            <TouchableOpacity
                              onPress={() => onPressEdit(question.question_id)}
                              hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
                            >
                              <Edit width={moderateScale(24)} height={moderateScale(24)} />
                            </TouchableOpacity>

                            {/* Trash */}
                            <TouchableOpacity
                              onPress={() => onPressDelete(question.question_id)}
                              hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
                            >
                              <Trash width={moderateScale(24)} height={moderateScale(24)} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    )
                  })
                }
              </ScrollView>
            )
          }
        </View>

        {/* <InputButton onSubmit={insertQuestion} /> */}
      </SafeAreaView>

      <View style={{ height: moderateScale(60) }} />
    </ScreenLayout>
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
  header: {
    marginBottom: moderateScale(8),
  },
  headerPrefix: {
    gap: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginTop: moderateScale(16),
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
    flex: 1,
    gap: moderateScale(12)
  },
  emptyQuestion: {
    alignItems: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }]
  },
  scrollView: {
    gap: moderateScale(12),
    paddingBottom: moderateScale(24),
  },
  card: {
    borderRadius: moderateScale(10),
    padding: moderateScale(16),
    backgroundColor: 'rgba(31, 31, 31, 0.5)'
  },
  cardIconList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    paddingHorizontal: moderateScale(24),
    marginBottom: moderateScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  inlineCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(8),
    backgroundColor: '#4F5FFF',
    borderRadius: moderateScale(12),
  },
})
