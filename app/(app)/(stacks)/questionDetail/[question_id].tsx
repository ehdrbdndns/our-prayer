import Chat from '@/assets/images/icon/chat.svg';
import Edit from '@/assets/images/icon/edit.svg';
import Left from '@/assets/images/icon/leftArrow.svg';
import Star from '@/assets/images/icon/star.svg';
import Trash from '@/assets/images/icon/trash.svg';
import Header from "@/components/Header";
import InputButton from '@/components/InputButton';
import CustomText from '@/components/text/CustomText';
import { MediumText } from '@/components/text/MediumText';
import { RegularText } from '@/components/text/RegularText';
import { useSession } from '@/ctx';
import api from '@/utils/axios';
import { QuestionReplyType } from '@/utils/dataType';
import { formatDateToKorean } from '@/utils/date';
import { useDeleteQuestionMutation } from '@/utils/mutation';
import { useQuestionDetailQuery, useReplyQuery } from '@/utils/queries';
import { moderateScale } from '@/utils/style';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DefaultAuthor = require('@/assets/images/icon.png');
const deviceHeight = Dimensions.get('window').height;

export default function QuestionDetail() {

  const queryClient = useQueryClient();

  const { session, isLoading } = useSession();
  const { question_id } = useLocalSearchParams<{ question_id: string }>();

  const [name, setName] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: question } = useQuestionDetailQuery(question_id);
  const { data: replys } = useReplyQuery(question_id);

  const { mutate: deleteQuestion } = useDeleteQuestionMutation();

  const { mutate: insertReply } = useMutation({
    mutationFn: async (content: string) => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.post<{ message: string }>(`/question/reply`, {
        question_id,
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
      await queryClient.cancelQueries({ queryKey: ["reply", question_id] });

      const previousValue = queryClient.getQueryData<QuestionReplyType[]>(["reply", question_id]);
      if (previousValue) {
        queryClient.setQueryData<QuestionReplyType[]>(["reply", question_id], [
          ...previousValue,
          {
            question_reply_id: '',
            user_id: session || '',
            question_id,
            content,
            is_active: true,
            is_replier: true,
            created_date: Date.now() * 1000,
            updated_date: Date.now() * 1000
          }
        ]);
      }

      return { previousValue };
    },
    onSuccess: async () => {
      queryClient.refetchQueries({ queryKey: ["reply", question_id] });
      queryClient.refetchQueries({ queryKey: ["question"] });
    },
    onError: (error, newReply, context) => {
      console.error('onError', error, newReply, context);

      if (context) {
        queryClient.setQueryData<QuestionReplyType[]>(["reply", question_id], context.previousValue);
      }
    },
  });

  useEffect(() => {
    if (!!session && !isLoading) {
      const { name } = JSON.parse(session);
      setName(name)
    }
  }, [session, isLoading])

  useFocusEffect(useCallback(() => {
    queryClient.refetchQueries({ queryKey: ["reply", question_id] });
  }, []))

  const onPressDelete = () => {
    Alert.alert('삭제', '삭제된 질문 내용은 되돌릴 수 없습니다.', [
      {
        text: '취소',
        style: 'cancel'
      },
      {
        text: '삭제',
        onPress: () => {
          deleteQuestion(question_id);
          router.back();
        }
      }
    ])
  }

  const onPressEdit = () => {
    router.push({
      pathname: `/editQuestion/[question_id]`,
      params: {
        question_id,
      }
    });
  }

  const onPressBack = () => {
    router.back();
  }

  const onRefresh = async () => {
    setRefreshing(true);

    await queryClient.refetchQueries({ queryKey: ["question", question_id] });
    await queryClient.refetchQueries({ queryKey: ["reply", question_id] });

    setRefreshing(false);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Platform.OS === "ios" ? "#FFFFFF" : "#000000"]}
            tintColor={'#FFFFFF'}
            progressViewOffset={moderateScale(50)}
          />
        }
        style={{ flex: 1 }}
      >
        {/* Header */}
        <Header
          style={styles.header}
          prefix={
            <View style={styles.headerPrefix}>
              <TouchableOpacity
                onPress={onPressBack}
                hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
              >
                <Left
                  width={moderateScale(24)}
                  height={moderateScale(24)}
                />
              </TouchableOpacity>
              <MediumText
                color='#FFF'
                fontSize={16}
              >
                나의 질문
              </MediumText>
            </View>
          }
        />

        {/* Content */}
        <View style={styles.container}>
          {/* 날짜 */}
          <MediumText
            fontSize={14}
            lineHeight={26}
            color='#B3B3B3'
            style={{ marginBottom: moderateScale(4) }}
          >
            {formatDateToKorean(question?.created_date || 0)}
          </MediumText>
          {/* 질문 내용 */}
          <RegularText
            fontSize={16}
            lineHeight={28}
            style={{ marginBottom: moderateScale(16) }}
          >
            {question?.content}
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
                {question?.reply_count}
              </CustomText>
            </View>

            <View style={{ flexDirection: 'row', gap: moderateScale(24) }}>
              {/* Edit */}
              <TouchableOpacity
                onPress={onPressEdit}
                hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
              >
                <Edit width={moderateScale(24)} height={moderateScale(24)} />
              </TouchableOpacity>

              {/* Trash */}
              <TouchableOpacity
                onPress={onPressDelete}
                hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
              >
                <Trash width={moderateScale(24)} height={moderateScale(24)} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.replyContainer, { minHeight: deviceHeight / 2 }]}>
          {(replys ?? []).length === 0 ? (
            <View style={styles.emptyQuestion}>
              <Star opacity={0.8} />
              <RegularText
                color="#B3B3B3"
                fontSize={14}
                lineHeight={24}
              >
                아직 답변 내역이 없습니다!
              </RegularText>
            </View>
          ) : (
            <View style={{ paddingHorizontal: moderateScale(24), gap: moderateScale(12), paddingBottom: moderateScale(100) }}>
              {(replys ?? []).map((reply) => (
                <View style={styles.card} key={reply.question_reply_id}>
                  {/* Team */}
                  {
                    reply.user_id === 'admin' ? (
                      <View style={{
                        flexDirection: 'row',
                        gap: moderateScale(10),
                        alignItems: 'center',
                        marginBottom: moderateScale(10)
                      }}>
                        <Image
                          style={{
                            width: moderateScale(28),
                            height: moderateScale(28),
                            borderRadius: moderateScale(14),
                          }}
                          source={DefaultAuthor}
                        />
                        <MediumText
                          fontSize={14}
                          color='#B3B3B3'
                        >
                          {'우리의 기도'}
                        </MediumText>
                      </View>
                    ) : (
                      <View style={{
                        flexDirection: 'row',
                        gap: moderateScale(10),
                        alignItems: 'center',
                        marginBottom: moderateScale(10)
                      }}>
                        <MediumText
                          fontSize={14}
                          color='#B3B3B3'
                        >
                          {`나 (${name})`}
                        </MediumText>
                      </View>
                    )
                  }

                  {/* Content */}
                  <RegularText
                    style={{
                      marginBottom: moderateScale(10),
                    }}
                    fontSize={16}
                    lineHeight={28}
                  >
                    {reply.content}
                  </RegularText>

                  {/* date */}
                  <View
                    style={{
                      flexDirection: 'row',
                    }}
                  >
                    <MediumText
                      fontSize={12}
                      lineHeight={26}
                      color='#B3B3B3'
                    >
                      {formatDateToKorean(reply.created_date)}
                    </MediumText>
                  </View>
                </View>
              ))}
            </View>)}
        </View>
      </ScrollView>
      <InputButton placeholder='질문을 추가로 입력해주세요.' onSubmit={insertReply} />
    </SafeAreaView >
  )
}

const styles = StyleSheet.create({
  header: {
    marginBottom: moderateScale(24)
  },
  headerPrefix: {
    flexDirection: 'row',
    gap: moderateScale(16)
  },
  container: {
    flex: 1,
    paddingHorizontal: moderateScale(24),
    marginBottom: moderateScale(40)
  },
  replyContainer: {
    flex: 1,
    position: 'relative'
  },
  cardIconList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    padding: moderateScale(16),
    borderRadius: moderateScale(10),
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  emptyQuestion: {
    alignItems: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-100%' }]
  },
})