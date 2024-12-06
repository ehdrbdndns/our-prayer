import Delete from '@/assets/images/icon/delete.svg';
import Send from "@/assets/images/icon/send.svg";
import { moderateScale, normalizeFontSize, scaleHeight } from "@/utils/style";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import PrimaryButton from "./button/PrimaryButton";
import { MediumText } from "./text/MediumText";
import { RegularText } from './text/RegularText';

export default function InputButton() {
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
    <>
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