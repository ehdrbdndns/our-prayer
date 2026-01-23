import LeftArrow from '@/assets/images/icon/leftArrow.svg';
import CustomButton from '@/components/button/CustomButton';
import PrimaryButton from '@/components/button/PrimaryButton';
import Header from "@/components/Header";
import { MediumText } from '@/components/text/MediumText';
import { formatDateToKorean, formatPrayerTime } from '@/utils/date';
import { useDeleteHistoryMutation, useUpdateHistoryMutation } from '@/utils/mutation';
import { useHistoryDetailQuery } from '@/utils/queries';
import { moderateScale } from "@/utils/style";
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryDetailPage() {

  const queryClient = useQueryClient();
  const { history_id } = useLocalSearchParams<{ history_id: string }>();
  const { data: historyDetail, isSuccess: isHistorySuccess } = useHistoryDetailQuery(history_id)

  const [note, setNote] = useState('');
  const textInputRef = useRef<TextInput>(null);

  const { mutate: updateHistoryMutate } = useUpdateHistoryMutation({
    params: {
      history_id: history_id,
      note: note
    },
    onSuccess: async () => {
      // invalid history detail cache
      await queryClient.invalidateQueries({ queryKey: ["history"] });
      await queryClient.invalidateQueries({ queryKey: ["historyDetail", history_id] });
      router.back();
    },
    onError: () => {
      // Todo: error handling
    }
  })

  const { mutate: deleteHistoryMutate } = useDeleteHistoryMutation({
    params: {
      history_id: history_id
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["history"] });
      await queryClient.invalidateQueries({ queryKey: ["plan"] });
      router.back();
    },
    onError: () => {
      // Todo: error handling
    }
  })

  useEffect(() => {
    if (isHistorySuccess) {
      setNote(historyDetail?.note || '');
    }
  }, [isHistorySuccess])

  const onPressBack = () => {
    router.back();
  }

  const onChangeNote = (text: string) => {
    setNote(text);
  }

  const onPressSave = () => {
    Alert.alert(
      '기도 기록을 저장하시겠습니까?',
      '',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '저장하기',
          onPress: () => {
            updateHistoryMutate();
          },
        },
      ],
      { cancelable: false }
    );
  }

  const onPressDelete = () => {
    Alert.alert(
      '기도 기록 내용을 삭제하시겠습니까?',
      '삭제된 내용은 되돌릴 수 없습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제하기',
          onPress: () => {
            deleteHistoryMutate();
          },
        },
      ],
      { cancelable: false }
    );
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (!textInputRef.current) return;

        if (Keyboard.isVisible()) {
          textInputRef.current.blur();
        } else {
          textInputRef.current.focus();
        }
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
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
                  기도 기록 편집
                </MediumText>
              </View>
            }
          />
          <View style={styles.container}>
            <MediumText
              style={{ marginBottom: moderateScale(24) }}
              fontSize={14}
              lineHeight={24}
              color="#B3B3B3"
            >
              {formatDateToKorean(historyDetail?.created_date || 0)},{"\n"}
              {formatPrayerTime(historyDetail?.created_date || 0, historyDetail?.duration || 0)}
            </MediumText>
            <TextInput
              ref={textInputRef}
              value={note}
              multiline
              placeholder='기도 기록을 작성해주세요'
              placeholderTextColor={'#B3B3B3'}
              style={{
                fontFamily: 'NotoSansKR_400Regular',
                fontSize: moderateScale(16),
                lineHeight: moderateScale(28),
                maxHeight: '100%',
                color: '#FFF',
                flex: 1,
                textAlignVertical: 'top',
              }}
              onChange={e => onChangeNote(e.nativeEvent.text)}
            />
          </View>
          <View
            style={{
              paddingHorizontal: moderateScale(24),
              marginBottom: Platform.OS === 'ios' ? 0 : moderateScale(24),
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
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
