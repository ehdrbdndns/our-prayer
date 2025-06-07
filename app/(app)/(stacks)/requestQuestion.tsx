import LeftArrow from '@/assets/images/icon/leftArrow.svg';
import CustomButton from "@/components/button/CustomButton";
import PrimaryButton from "@/components/button/PrimaryButton";
import Header from "@/components/Header";
import { QUESTION_CONTENT_MAX_LENGTH } from '@/components/InputButton';
import { MediumText } from "@/components/text/MediumText";
import { useSession } from '@/ctx';
import { ASYNC_TEMP_DRAFT } from '@/storage/asyncStorageKeys';
import { QuestionType } from '@/utils/dataType';
import { useInsertQuestionMutation } from '@/utils/mutation';
import { moderateScale, normalizeFontSize } from "@/utils/style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const QUESTION_TEMPLATE = (name: string) => `이름(가명 가능): ${name}

성별: 

나이: 

전화 번호(선택사항): 

섬기는 교회(선택사항): 

선호 상담 방식(대면/비대면): 

호소 내용(상담 받고 싶은 구체적인 내용): 

`

export default function RequestQuestion() {

  const insets = useSafeAreaInsets();
  const { session } = useSession();

  const queryClient = useQueryClient();

  const [note, setNote] = useState(QUESTION_TEMPLATE(''));
  const [isSaving, setIsSaving] = useState(false);
  const [boldTextOpacity, setBoldTextOpacity] = useState(1); // BoldText의 opacity 상태
  const textInputRef = useRef<TextInput>(null); // TextInput의 참조 생성

  const { mutate: insertQuestion } = useInsertQuestionMutation({
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["question"] });
      await AsyncStorage.removeItem(ASYNC_TEMP_DRAFT);
    },
    onError: async (context) => {
      queryClient.setQueryData<QuestionType[]>(["question"], context.previousValue);
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
    }
  });

  useEffect(() => {
    async function setNoteByDraft(name: string) {
      const draft = await AsyncStorage.getItem(ASYNC_TEMP_DRAFT);

      if (!!draft) {
        setNote(draft);
      } else {
        setNote(QUESTION_TEMPLATE(name));
      }
    }

    if (!!session) {
      const { name } = JSON.parse(session);
      setNoteByDraft(name);
    }
  }, [session])

  const submitPrayerRecord = async () => {
    if (isSaving) return;

    setIsSaving(true);

    // 만약 상담 신청에 실패했을 시 원본 유지하기 위해 미리 저장하는 것이 필요.
    await AsyncStorage.setItem(ASYNC_TEMP_DRAFT, note);

    try {
      insertQuestion(note);
    } catch (e) {
      console.error(e);
      Alert.alert('상담신청에 실패했습니다.', '잠시 후 다시 시도해주세요.', [
        {
          text: '확인',
          style: 'cancel',
          onPress: () => {
            router.back();
          }
        }
      ]);
    } finally {
      setIsSaving(false);
    }

    Alert.alert('상담 신청이 완료되었습니다.', '담당자가 확인 후 연락드리겠습니다.', [
      {
        text: '확인',
        onPress: () => {
          router.back();
        }
      }
    ])
  }

  const onPressReset = () => {
    Alert.alert('초기화', '상담신청 내용을 초기화하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel'
      },
      {
        text: '확인',
        onPress: () => {
          let name = "";
          if (!!session) {
            const { name: sessionName } = JSON.parse(session);
            name = sessionName;
          }
          setNote(QUESTION_TEMPLATE(name));
        }
      }
    ])
  }

  const onPressSave = async () => {
    if (isSaving) {
      Alert.alert('상담신청 중입니다.', '잠시만 기다려주세요.', [
        {
          text: '확인',
          style: 'cancel'
        }
      ])

      return;
    }

    Alert.alert('상담신청', '작성된 내용을 바탕으로 상담신청을 하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel'
      },
      {
        text: '확인',
        onPress: async () => {
          await submitPrayerRecord();
        }
      }
    ])
  }

  const onPressSaveDraft = async () => {
    Alert.alert('임시저장', '임시저장하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel'
      },
      {
        text: '확인',
        onPress: async () => {
          await AsyncStorage.setItem(ASYNC_TEMP_DRAFT, note);
          Alert.alert('저장되었습니다.', "", [
            {
              text: '확인'
            }
          ]);
        }
      }
    ]
    )
  }

  const onComplete = () => {
    if (textInputRef.current) {
      textInputRef.current.blur(); // TextInput에 포커스 잃게 하기
    }
  }

  const onChangeNote = (text: string) => {
    if (text.length > QUESTION_CONTENT_MAX_LENGTH) {
      Alert.alert('길이를 초과했습니다.', `최대 ${QUESTION_CONTENT_MAX_LENGTH}자까지 입력 가능합니다.`, [
        {
          text: '확인',
          style: 'cancel'
        }
      ])
    } else {
      setNote(text)
    }
  }

  const onPressBack = () => {
    Alert.alert('잠깐만요!', '저장하지 않은 내용이 있습니다. 저장하시겠습니까?', [
      {
        text: '아니요',
        style: 'destructive',
        onPress: () => {
          router.back();
        }
      },
      {
        text: '네',
        onPress: async () => {
          await AsyncStorage.setItem(ASYNC_TEMP_DRAFT, note);
          router.back();
        }
      }
    ])
  }

  return (
    <>
      <View
        style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 20, 26, 0.4)' }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={{ flex: 1 }}>
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
                  상담하기
                </MediumText>
              </View>
            }
            suffix={
              <TouchableOpacity
                onPress={onPressReset}
              >
                <MediumText
                  fontSize={16}
                  color="#959FFF"
                >
                  초기화
                </MediumText>
              </TouchableOpacity>
            }
          />
          <View style={styles.textInput}>
            <TextInput
              ref={textInputRef}
              value={note}
              multiline={true}
              style={styles.text}
              scrollEnabled={true}
              onChangeText={onChangeNote}
              placeholderTextColor={"#B3B3B3"}
              placeholder="여기를 탭하여 입력하세요(최대 1500자)"
              onFocus={() => setBoldTextOpacity(0.5)} // TextInput이 포커스될 때 opacity 변경
              onBlur={() => setBoldTextOpacity(1)} // TextInput이 포커스를 잃을 때 opacity 복원
            />
          </View>
          <View style={[styles.buttonList, { bottom: insets.bottom, opacity: boldTextOpacity !== 1 ? 0 : 1 }]}>
            <CustomButton onPress={onPressSaveDraft} style={[styles.button, styles.secondaryButton]}>
              <MediumText
                fontSize={14}
              >
                임시저장
              </MediumText>
            </CustomButton>
            <PrimaryButton onPress={onPressSave} style={styles.button}>
              <MediumText
                fontSize={14}
              >
                상담신청
              </MediumText>
            </PrimaryButton>
          </View>
        </SafeAreaView>
        <View style={styles.inputCompleteButtonLayout}>
          <TouchableOpacity
            style={[styles.inputCompleteButton, {
              opacity: boldTextOpacity === 1 ? 0 : 1,
              height: boldTextOpacity === 1 ? 0 : moderateScale(40),
            }]}
            onPress={onComplete}
            hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
          >
            <LeftArrow style={{ transform: [{ rotate: '90deg' }] }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
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
    fontFamily: 'NotoSansKR_400Regular',
    fontSize: normalizeFontSize(16),
    lineHeight: normalizeFontSize(28),
    color: "#FFFFFF",
    height: '80%',
    textAlignVertical: 'top'
  },
  buttonList: {
    position: 'absolute',
    flexDirection: 'row',
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(8),
    marginBottom: Platform.OS === 'ios' ? 0 : moderateScale(24),
  },
  button: {
    flex: 1,
    paddingVertical: moderateScale(12),
  },
  secondaryButton: {
    backgroundColor: 'rgba(15, 20, 26, 0.4)',
  },
  inputCompleteButtonLayout: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: moderateScale(20)
  },
  inputCompleteButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: 100,
    marginBottom: moderateScale(12),
    backgroundColor: '#4F5FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPrefix: {
    gap: moderateScale(16),
    flexDirection: 'row',
  },
})