import Chat from '@/assets/images/icon/chat.svg';
import Edit from '@/assets/images/icon/edit.svg';
import Star from '@/assets/images/icon/star.svg';
import Trash from '@/assets/images/icon/trash.svg';
import InputButton from '@/components/InputButton';
import { BoldText } from "@/components/text/BoldText";
import CustomText from '@/components/text/CustomText';
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import api from '@/utils/axios';
import { QuestionType } from '@/utils/dataType';
import { formatDateToKorean } from '@/utils/date';
import { useDeleteQuestionMutation } from '@/utils/mutation';
import { moderateScale } from "@/utils/style";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QuestionPage() {

  const queryClient = useQueryClient();

  const { data: questionList } = useQuery<QuestionType[]>({
    queryKey: ["question"],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.get<QuestionType[]>(`/question`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        }
      });
      return res.data;
    },
    placeholderData: [],
    staleTime: 12 * 60 * 60 * 1000, // 12시간
    gcTime: 12 * 60 * 60 * 1000, // 12시간
  });

  const { mutate: insertQuestion } = useMutation({
    mutationFn: async (content: string) => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.post<{ message: string }>(`/question`, {
        content,
      }, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        }
      });
      return res.data;
    },
    onMutate: async (content: string) => {
      await queryClient.cancelQueries({ queryKey: ["question"] });

      const previousValue = queryClient.getQueryData<QuestionType[]>(["question"]);
      if (previousValue) {
        queryClient.setQueryData<QuestionType[]>(["question"], [{
          question_id: '',
          user_id: '',
          content,
          category: '',
          is_answered: false,
          is_active: true,
          reply_count: 0,
          created_date: Math.floor(new Date().getTime() / 1000),
          updated_date: Math.floor(new Date().getTime() / 1000),
        }, ...previousValue]);
      }

      return { previousValue };
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["question"] });
    },
    onError: (error, newUser, context) => {
      console.error('onError', error, newUser, context);

      if (context) {
        queryClient.setQueryData<QuestionType[]>(["question"], context.previousValue);
      }
    },
  })

  const { mutate: deleteQuestion } = useDeleteQuestionMutation();

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
    router.push('/questionGuide')
  }

  const onPressQuestionCard = (question_id: string) => {
    if (!question_id) return;

    router.push({
      pathname: `/questionDetail/[question_id]`,
      params: {
        question_id,
      }
    });
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
          (questionList ?? []).length === 0 ? (
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
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollView}>
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
                          <Edit width={moderateScale(24)} height={moderateScale(24)} />

                          {/* Trash */}
                          <TouchableOpacity onPress={() => onPressDelete(question.question_id)}>
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

      <InputButton onSubmit={insertQuestion} />
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
    flex: 1,
    paddingHorizontal: moderateScale(24),
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
    paddingBottom: moderateScale(100),
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