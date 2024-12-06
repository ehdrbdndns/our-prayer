import LeftArrow from '@/assets/images/icon/leftArrow.svg';
import PrimaryButton from '@/components/button/PrimaryButton';
import Header from "@/components/Header";
import { BoldText } from '@/components/text/BoldText';
import { MediumText } from "@/components/text/MediumText";
import { moderateScale, normalizeFontSize } from "@/utils/style";
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditNickname() {

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
          <TouchableOpacity>
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
            placeholder='동규우운'
            placeholderTextColor={'#B3B3B3'}
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
        <PrimaryButton
          style={{

          }}
        >
          <MediumText
            fontSize={14}
          >
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