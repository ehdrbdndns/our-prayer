import LeftArrow from '@/assets/images/icon/leftArrow.svg';
import PrimaryButton from '@/components/button/PrimaryButton';
import Header from "@/components/Header";
import { BoldText } from '@/components/text/BoldText';
import { MediumText } from "@/components/text/MediumText";
import { useSession } from '@/ctx';
import { useUserMutation } from '@/utils/mutation';
import { moderateScale, normalizeFontSize } from "@/utils/style";
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditNickname() {

  const queryClient = useQueryClient();
  const { session, setSession } = useSession();
  const [name, setName] = useState(session || '');

  const { mutate } = useUserMutation();
  const onPressSave = () => {
    mutate({ name });
    setSession(name);
    router.back();
  }

  const onPressBack = () => {
    router.back();
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
              닉네임 변경하기
            </MediumText>
          </View>
        }
        suffix={
          <TouchableOpacity
            onPress={onPressSave}
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
        <BoldText
          fontSize={24}
          lineHeight={36}
        >
          변경할 닉네임을 입력하세요
        </BoldText>
        <View>
          <TextInput
            style={{
              fontFamily: 'NotoSansKR_400Regular',
              fontSize: normalizeFontSize(16),
              lineHeight: normalizeFontSize(26),
              color: '#FFF',
              width: '100%',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255, 255, 255, 0.1)',
              paddingBottom: moderateScale(8),
            }}
            placeholder={session || '닉네임을 입력하세요'}
            placeholderTextColor={'#B3B3B3'}
            onChangeText={(v) => setName(v)}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{
          paddingHorizontal: moderateScale(24),
          marginBottom: moderateScale(24),
        }}
      >
        <PrimaryButton onPress={onPressSave}>
          <MediumText fontSize={14}>
            저장하기
          </MediumText>
        </PrimaryButton>
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
    gap: moderateScale(44),
    paddingHorizontal: moderateScale(24),
    flex: 1,
  }
})