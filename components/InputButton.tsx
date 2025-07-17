import Delete from '@/assets/images/icon/delete.svg';
import Send from "@/assets/images/icon/send.svg";
import { moderateScale, normalizeFontSize, scaleHeight } from "@/utils/style";
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import PrimaryButton from "./button/PrimaryButton";
import { MediumText } from "./text/MediumText";
import { RegularText } from './text/RegularText';

type inputButtonProps = {
  onSubmit: (content: string) => void;
  placeholder?: string;
}

export const QUESTION_CONTENT_MAX_LENGTH = 20000;

export default function InputButton({ onSubmit, placeholder }: inputButtonProps) {

  const textInputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);

  useEffect(() => {
    if (isInputVisible && textInputRef.current) {
      setTimeout(() => {
        textInputRef?.current?.focus();
      }, 100)
    }
  }, [isInputVisible])

  const onChangeNote = (text: string) => {
    if (text.length > QUESTION_CONTENT_MAX_LENGTH) {
      Alert.alert('길이를 초과했습니다.', `최대 ${QUESTION_CONTENT_MAX_LENGTH}자까지 입력 가능합니다.`, [
        {
          text: '확인',
          style: 'cancel'
        }
      ])
    } else {
      setText(text);
    }

  }

  const onPressOpenInput = () => {
    setIsInputVisible(true);
  }

  const onPressCloseInputTrigger = () => {
    setIsInputVisible(false);
  }

  const onPressSubmitButton = () => {
    onSubmit(text);
    setIsInputVisible(false);
    setText('');
  }

  return (
    <>
      {/* InputTriggerButton */}
      <View style={styles.inputTriggerContainer}>
        <TouchableOpacity
          onPress={onPressOpenInput}
          style={styles.inputTriggerButton}
        >
          <RegularText
            color="#B3B3B3"
            fontSize={16}
            lineHeight={24}
          >
            {
              placeholder ? placeholder : "질문 내용을 입력해주세요."
            }
          </RegularText>

          <Send />
        </TouchableOpacity>
      </View>

      {/* Input */}
      {isInputVisible && (
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
                  onPress={onPressCloseInputTrigger}
                >
                  <Delete
                    width={moderateScale(24)}
                    height={moderateScale(24)}
                    opacity={0.8}
                  />
                </TouchableOpacity>
              </View>
              <TextInput
                value={text}
                ref={textInputRef}
                style={styles.input}
                onChangeText={onChangeNote}
                placeholder="질문 내용을 입력해주세요."
                placeholderTextColor={'#B3B3B3'}
                multiline
              />
              <PrimaryButton onPress={onPressSubmitButton} style={styles.submitButton} >
                <MediumText fontSize={14}>
                  질문하기
                </MediumText>
              </PrimaryButton>
            </View>
          </KeyboardAvoidingView>
        </>)}
    </>
  )
}

const styles = StyleSheet.create({
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
    fontSize: normalizeFontSize(16),

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
})