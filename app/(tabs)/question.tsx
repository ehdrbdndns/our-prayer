import Delete from '@/assets/images/icon/delete.svg';
import Send from "@/assets/images/icon/send.svg";
import Star from '@/assets/images/icon/star.svg';
import PrimaryButton from '@/components/button/PrimaryButton';
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import { moderateScale, scaleHeight } from "@/utils/style";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QuestionPage() {

  const [questionList, setQuestionList] = useState([]);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  const onPressInputTrigger = () => {
    setIsInputVisible(true);
  }

  const onPressDeleteInputTrigger = () => {
    setIsInputVisible(false);
  }

  const onSubmitEditing = () => {
    setIsInputVisible(false);
  }

  const onPressSubmitButton = () => {
    console.log("hello")
    setIsInputVisible(false);
  }

  useEffect(() => {
    if (isInputVisible && textInputRef.current) {
      setTimeout(() => {
        textInputRef?.current?.focus();
      }, 100)
    }
  }, [isInputVisible])

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
            <ScrollView>
              {
                questionList.map((question, index) => {
                  return (
                    <View key={index}>
                      <RegularText
                        color="#B3B3B3"
                        fontSize={14}
                        lineHeight={24}
                      >
                        {question}
                      </RegularText>
                    </View>
                  )
                })
              }
            </ScrollView>
          )
        }
      </View>

      {/* InputTriggerButton */}
      <View style={styles.inputTriggerContainer}>
        <TouchableOpacity
          onPress={onPressInputTrigger}
          style={styles.inputTriggerButton}
        >
          <RegularText
            color="#B3B3B3"
            fontSize={16}
            lineHeight={24}
          >
            질문 내용을 입력해주세요.
          </RegularText>

          <Send />
        </TouchableOpacity>
      </View>

      {/* Input */}
      {
        isInputVisible && (
          <>
            <View style={styles.backgroundFilter} />
            <KeyboardAvoidingView
              style={styles.keyboardAvoidingView}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View style={[styles.inputContainer]}>
                <View style={{ alignItems: 'flex-end' }}>
                  <TouchableOpacity
                    style={styles.deleteTriggerButton}
                    onPress={onPressDeleteInputTrigger}
                  >
                    <Delete
                      width={moderateScale(24)}
                      height={moderateScale(24)}
                      opacity={0.8}
                    />
                  </TouchableOpacity>
                </View>
                <TextInput
                  ref={textInputRef}
                  style={styles.input}
                  placeholder="질문 내용을 입력해주세요."
                  placeholderTextColor={'#B3B3B3'}
                  onSubmitEditing={onSubmitEditing}
                  multiline
                />
                <PrimaryButton onPress={onPressSubmitButton} style={styles.submitButton} >
                  <MediumText fontSize={14}>
                    질문하기
                  </MediumText>
                </PrimaryButton>
              </View>
            </KeyboardAvoidingView>
          </>
        )
      }
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
  },
  inputTriggerContainer: {
    width: '100%',
    position: 'absolute',
    bottom: moderateScale(28),

    paddingHorizontal: moderateScale(20),
  },
  inputTriggerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(10),

    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: moderateScale(12),
  },
  emptyQuestion: {
    alignItems: 'center',
    marginTop: moderateScale(158)
  },
  keyboardAvoidingView: {
    width: '100%',
    position: 'absolute',
    bottom: 0
  },
  inputContainer: {
    width: '100%',
    height: scaleHeight(326),

    paddingTop: moderateScale(10),
    paddingHorizontal: moderateScale(24),
    paddingBottom: moderateScale(24),

    backgroundColor: '#2D2D2D',

    borderTopRightRadius: moderateScale(24),
    borderTopLeftRadius: moderateScale(24),
  },
  input: {
    fontFamily: 'NotoSansKR_400Regular',
    fontSize: moderateScale(16),

    height: scaleHeight(200),
    textAlignVertical: 'top',

    color: "#FFF",
    marginBottom: scaleHeight(12),
  },
  deleteTriggerButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    paddingVertical: moderateScale(12),
  },
  backgroundFilter: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 30, 30, 0.8)'
  }
})