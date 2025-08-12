import LeftArrow from '@/assets/images/icon/leftArrow.svg';
import CustomButton from "@/components/button/CustomButton";
import PrimaryButton from "@/components/button/PrimaryButton";
import Header from "@/components/Header";
import { QUESTION_CONTENT_MAX_LENGTH } from '@/components/InputButton';
import { MediumText } from "@/components/text/MediumText";
import { useSession } from '@/contexts/AuthContext';
import { ASYNC_TEMP_DRAFT } from '@/storage/asyncStorageKeys';
import { QuestionType } from '@/utils/dataType';
import { useInsertQuestionMutation } from '@/utils/mutation';
import { moderateScale, normalizeFontSize } from "@/utils/style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper component for labeled inputs
const LabeledInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  onFocus
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  onFocus?: (ref: React.RefObject<View | null>) => void;
}) => {
  const containerRef = useRef<View>(null);

  return (
    <View ref={containerRef} style={styles.inputGroup}>
      <MediumText style={styles.label}>{label}</MediumText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, multiline && styles.multilineInput]}
        placeholder={placeholder}
        placeholderTextColor="#888"
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={() => onFocus?.(containerRef)}
      />
    </View>
  );
};

// Helper component for option selection buttons
const OptionSelector = ({
  label,
  options,
  selectedValue,
  onSelect,
}: {
  label: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) => {
  return (
    <View style={styles.inputGroup}>
      <MediumText style={styles.label}>{label}</MediumText>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedValue === option && styles.selectedOption,
            ]}
            onPress={() => onSelect(option)}
          >
            <MediumText
              style={styles.optionText}
            >
              {option}
            </MediumText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function RequestQuestion() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [form, setForm] = useState({
    name: '',
    gender: '',
    age: '',
    phoneNumber: '',
    church: '',
    counselingMethod: '',
    content: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const isFormValid = useMemo(() => {
    const { name, gender, age, phoneNumber, counselingMethod, content } = form;
    return name.trim() !== '' && gender.trim() !== '' && age.trim() !== '' && phoneNumber.trim() !== '' && counselingMethod.trim() !== '' && content.trim() !== '';
  }, [form]);

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
    async function loadInitialData() {
      let userName = '';
      if (session) {
        const { name } = JSON.parse(session);
        userName = name;
      }

      const draft = await AsyncStorage.getItem(ASYNC_TEMP_DRAFT);
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          setForm(parsedDraft);
        } catch {
          setForm(prev => ({ ...prev, name: userName }));
        }
      } else {
        setForm(prev => ({ ...prev, name: userName }));
      }
    }
    loadInitialData();
  }, [session]);

  // 키보드가 올라오면 스크롤뷰를 해당 위치로 이동
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // 키보드가 올라옴
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // 키보드가 내려감
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleFormChange = (field: keyof typeof form, value: string) => {
    if (field === 'content' && value.length > QUESTION_CONTENT_MAX_LENGTH) {
      Alert.alert('길이를 초과했습니다.', `호소 내용은 최대 ${QUESTION_CONTENT_MAX_LENGTH}자까지 입력 가능합니다.`);
      return;
    }
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleInputFocus = (inputRef: React.RefObject<View | null>) => {
    // A short delay is often needed to allow the keyboard to start its animation
    setTimeout(() => {
      inputRef.current?.measure((_x, y) => {
        scrollViewRef.current?.scrollTo({ y: y, animated: true });
      });
    }, 100);
  };

  const buildNoteString = () => {
    return `이름(가명 가능): ${form.name}\n성별: ${form.gender}\n나이: ${form.age}\n전화 번호: ${form.phoneNumber}\n섬기는 교회(선택사항): ${form.church}\n선호 상담 방식(대면/비대면): ${form.counselingMethod}\n호소 내용(상담 받고 싶은 구체적인 내용): ${form.content}\n`;
  };

  const submitPrayerRecord = async () => {
    if (isSaving || !isFormValid) return;
    setIsSaving(true);

    const note = buildNoteString();
    await AsyncStorage.setItem(ASYNC_TEMP_DRAFT, JSON.stringify(form));

    try {
      insertQuestion(note);
      Alert.alert('상담 신청이 완료되었습니다.', '담당자가 확인 후 연락드리겠습니다.', [
        { text: '확인', onPress: () => router.back() }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('상담신청에 실패했습니다.', '잠시 후 다시 시도해주세요.', [
        { text: '확인', style: 'cancel' }
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const onPressReset = () => {
    Alert.alert('초기화', '상담신청 내용을 초기화하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: () => {
          let name = "";
          if (session) {
            const { name: sessionName } = JSON.parse(session);
            name = sessionName;
          }
          setForm({
            name,
            gender: '',
            age: '',
            phoneNumber: '',
            church: '',
            counselingMethod: '',
            content: '',
          });
        }
      }
    ]);
  };

  const onPressSave = () => {
    if (isSaving) {
      Alert.alert('상담신청 중입니다.');
      return;
    }
    if (!isFormValid) {
      Alert.alert('입력 필요', '섬기는 교회를 제외한 모든 항목을 입력해주세요.');
      return;
    }
    Alert.alert('상담신청', '작성된 내용을 바탕으로 상담신청을 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '확인', onPress: submitPrayerRecord }
    ]);
  };

  const onPressSaveDraft = () => {
    Alert.alert('임시저장', '임시저장하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: async () => {
          await AsyncStorage.setItem(ASYNC_TEMP_DRAFT, JSON.stringify(form));
          Alert.alert('저장되었습니다.');
        }
      }
    ]);
  };

  const onPressBack = () => {
    Alert.alert('잠깐만요!', '페이지를 나가시겠습니까? 임시저장된 내용은 사라집니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '임시저장 후 나가기',
        onPress: async () => {
          await AsyncStorage.setItem(ASYNC_TEMP_DRAFT, JSON.stringify(form));
          router.back();
        }
      },
      {
        text: '저장하지 않고 나가기',
        style: 'destructive',
        onPress: () => {
          router.back();
        }
      },
    ]);
  };

  return (
    <>
      <SafeAreaView style={[styles.safeArea, styles.container]}>
        <KeyboardAvoidingView
          style={{
            flex: 1
          }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Header
            style={styles.header}
            prefix={
              <View style={styles.headerPrefix}>
                <TouchableOpacity onPress={onPressBack}>
                  <LeftArrow width={moderateScale(24)} height={moderateScale(24)} />
                </TouchableOpacity>
                <MediumText color="#FFF" fontSize={16}>상담신청</MediumText>
              </View>
            }
            suffix={
              <TouchableOpacity onPress={onPressReset}>
                <MediumText fontSize={16} color="#959FFF">초기화</MediumText>
              </TouchableOpacity>
            }
          />
          <ScrollView
            ref={scrollViewRef}
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <LabeledInput label="이름" value={form.name} onChangeText={(text) => handleFormChange('name', text)} placeholder="이름을 입력하세요" onFocus={handleInputFocus} />
            <OptionSelector
              label="성별"
              options={['남성', '여성']}
              selectedValue={form.gender}
              onSelect={(value) => handleFormChange('gender', value)}
            />
            <LabeledInput label="나이" value={form.age} onChangeText={(text) => handleFormChange('age', text)} placeholder="예: 30" keyboardType="numeric" onFocus={handleInputFocus} />
            <LabeledInput label="전화 번호" value={form.phoneNumber} onChangeText={(text) => handleFormChange('phoneNumber', text)} placeholder="'-\' 없이 입력" keyboardType="phone-pad" onFocus={handleInputFocus} />
            <LabeledInput label="섬기는 교회(선택사항)" value={form.church} onChangeText={(text) => handleFormChange('church', text)} placeholder="교회 이름을 입력하세요" onFocus={handleInputFocus} />
            <OptionSelector
              label="선호 상담 방식"
              options={['대면', '비대면']}
              selectedValue={form.counselingMethod}
              onSelect={(value) => handleFormChange('counselingMethod', value)}
            />
            <LabeledInput label="호소 내용" value={form.content} onChangeText={(text) => handleFormChange('content', text)} placeholder="상담 받고 싶은 구체적인 내용을 입력하세요." multiline={true} onFocus={handleInputFocus} />
          </ScrollView>

          {/* Enter Button */}
          <View style={[styles.enterButtonLayout,
          {
            display: keyboardVisible ? 'flex' : 'none',
          }
          ]}>
            <TouchableOpacity
              style={styles.enterButton}
              onPress={() => Keyboard.dismiss()}
              hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
            >
              <LeftArrow style={{ transform: [{ rotate: '-90deg' }] }} />
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
        <View style={[
          styles.buttonList
        ]}>
          <CustomButton onPress={onPressSaveDraft} style={[styles.button, styles.secondaryButton]}>
            <MediumText fontSize={14}>임시저장</MediumText>
          </CustomButton>
          <PrimaryButton onPress={onPressSave} style={[styles.button, !isFormValid && styles.disabledButton]}>
            <MediumText fontSize={14}>상담신청</MediumText>
          </PrimaryButton>
        </View>
      </SafeAreaView >
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(15, 20, 26, 0.4)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    marginBottom: moderateScale(20)
  },
  headerPrefix: {
    gap: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: moderateScale(24),
  },
  inputGroup: {
    marginBottom: moderateScale(16),
  },
  label: {
    color: '#FFF',
    fontSize: normalizeFontSize(14),
    marginBottom: moderateScale(8),
    fontFamily: 'NotoSansKR_500Medium',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(12),
    color: '#FFF',
    fontFamily: 'NotoSansKR_400Regular',
    fontSize: normalizeFontSize(14),
    minHeight: moderateScale(48),
  },
  multilineInput: {
    height: moderateScale(150),
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: moderateScale(8),
  },
  optionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: moderateScale(8),
    paddingVertical: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: moderateScale(48),
  },
  selectedOption: {
    backgroundColor: '#4F5FFF',
  },
  optionText: {
    fontSize: normalizeFontSize(14),
    fontFamily: 'NotoSansKR_500Medium',
  },
  buttonList: {
    flexDirection: 'row',
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(8),
    paddingBottom: moderateScale(24),
  },
  button: {
    flex: 1,
    paddingVertical: moderateScale(12),
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  disabledButton: {
    backgroundColor: '#555',
    opacity: 0.7,
  },
  enterButtonLayout: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: moderateScale(20),

    ...Platform.select({
      android: {
        marginBottom: moderateScale(40)
      }
    })
  },
  enterButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: 100,
    backgroundColor: '#4F5FFF',
    justifyContent: 'center',
    alignItems: 'center',

    marginLeft: 'auto',
    marginRight: moderateScale(20)
  },
})