import LeftArrow from '@/assets/images/icon/leftArrow.svg';
import CustomButton from '@/components/button/CustomButton';
import PrimaryButton from '@/components/button/PrimaryButton';
import Header from "@/components/Header";
import { MediumText } from '@/components/text/MediumText';
import api from '@/utils/axios';
import { HistoryType } from '@/utils/dataType';
import { formatDateToKorean } from '@/utils/date';
import { useDeleteQuestionMutation } from '@/utils/mutation';
import { useQuestionQuery } from '@/utils/queries';
import { moderateScale } from "@/utils/style";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditQuestion() {

  const queryClient = useQueryClient();
  const { question_id } = useLocalSearchParams<{ question_id: string }>();
  const { data: question, isSuccess: isQuestionSuccess } = useQuestionQuery(question_id);

  const { mutate: updateQuestionMutate } = useMutation({
    mutationFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api<HistoryType[]>({
        method: "PUT",
        url: "/question",
        data: {
          question_id,
          content: note,
        },
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        },
      });

      return res.data;
    },
    onSuccess: async () => {
      // invalid history detail cache
      await queryClient.invalidateQueries({ queryKey: ["question"] });
      await queryClient.invalidateQueries({ queryKey: ["question", question_id] });
      router.back();
    },
    onError: (error, newUser, context) => {
      console.error('onError', error, newUser, context);
    },
  })

  const { mutate: deleteQuestionMutate } = useDeleteQuestionMutation();

  const [note, setNote] = useState('');

  useEffect(() => {
    if (isQuestionSuccess) {
      setNote(question?.content || '');
    }
  }, [isQuestionSuccess])

  const onPressBack = () => {
    router.back();
  }

  const onChangeNote = (text: string) => {
    setNote(text);
  }

  const onPressSave = () => {
    Alert.alert(
      '질문 내용을 저장하시겠습니까?',
      '',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '저장하기',
          onPress: () => {
            updateQuestionMutate();
          },
        },
      ],
      { cancelable: false }
    );
  }

  const onPressDelete = () => {
    Alert.alert(
      '삭제',
      '삭제된 질문 내용은 되돌릴 수 없습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제하기',
          onPress: () => {
            deleteQuestionMutate(question_id);
          },
        },
      ],
      { cancelable: false }
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
              나의 질문 편집
            </MediumText>
          </View>
        }
        suffix={
          <TouchableOpacity
            onPress={() => { }}
          >
            <MediumText
              fontSize={16}
              color="#959FFF"
            >
              저장하기
            </MediumText>
          </TouchableOpacity>
        }
      />
      <View style={styles.container}>
        <MediumText
          style={{ marginBottom: moderateScale(24) }}
          fontSize={14}
          lineHeight={24}
          color="#B3B3B3"
        >
          {formatDateToKorean(question?.created_date || 0)}
        </MediumText>
        <TextInput
          value={note}
          multiline
          placeholder='질문 내용을 작성해주세요'
          placeholderTextColor={'#B3B3B3'}
          style={{
            fontFamily: 'NotoSansKR_400Regular',
            fontSize: moderateScale(16),
            lineHeight: moderateScale(28),
            maxHeight: '100%',
            color: '#FFF',
            flex: 1
          }}
          onChangeText={onChangeNote}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{
          paddingHorizontal: moderateScale(24),
        }}
      >
        <View style={[styles.buttonList]}>
          <CustomButton onPress={onPressDelete} style={[styles.button, styles.secondaryButton]}>
            <MediumText
              fontSize={14}
            >
              삭제하기
            </MediumText>
          </CustomButton>
          <PrimaryButton style={styles.button} onPress={onPressSave}>
            <MediumText fontSize={14}>
              저장하기
            </MediumText>
          </PrimaryButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    marginBottom: moderateScale(20),
  },
  headerPrefix: {
    gap: moderateScale(16),
    flexDirection: 'row',
  },
  container: {
    paddingHorizontal: moderateScale(24),
    flex: 1,
    marginBottom: moderateScale(24),
  },
  button: {
    flex: 1,
    paddingVertical: moderateScale(12),
  },
  secondaryButton: {
    backgroundColor: 'rgba(15, 20, 26, 0.4)',
  },
  buttonList: {
    flexDirection: 'row',
    gap: moderateScale(8),
  },
});