import LeftArrow from '@/assets/images/icon/leftArrow.svg';
import CustomButton from '@/components/button/CustomButton';
import PrimaryButton from '@/components/button/PrimaryButton';
import Header from "@/components/Header";
import { MediumText } from '@/components/text/MediumText';
import { moderateScale } from "@/utils/style";
import { router, useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryDetailPage() {

  const { history_id } = useLocalSearchParams<{ history_id: string }>();
  console.log(history_id);

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
              기도 기록 편집
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
          {"2024년 10월 19일, \n오후 12시 30분에 30분 기도 기록을 편집합니다."}
        </MediumText>
        <TextInput
          multiline
          style={{
            fontFamily: 'NotoSansKR_400Regular',
            fontSize: moderateScale(16),
            lineHeight: moderateScale(28),
            maxHeight: '100%',
            color: '#FFF',
            flex: 1
          }}
          value={`기도하는 시간이 제게 큰 힘이 됩니다. 매일 이렇게 주님 앞에 나아갈 수 있다는 것에 감사함을 느낍니다. 
기도를 통해 제 마음의 부담이 덜어지고, 삶의 방향을 찾는 데 큰 도움을 받고 있습니다.
앞으로도 이 기도 시간을 소중히 여기고, 하나님과의 교제를 지속적으로 이어가고 싶습니다. 하나님과의 관계를 더욱 깊게 만들어 가며, 제 삶의 모든 부분에서 하나님의 뜻을 따르기를 소망합니다. 매일매일 기도를 통해 얻는 힘과 지혜로, 하나님이 제게 주신 사명을 다할 수 있도록 이끌어 주시기를 기도합니다.

감사해요, 하나님. 저의 기도를 들어주시고, 언제나 함께하시는 하나님께 영광을 돌립니다. 아멘. 🌿기도하는 시간이 제게 큰 힘이 됩니다. 매일 이렇게 주님 앞에 나아갈 수 있다는 것에 감사함을 느낍니다. 
기도를 통해 제 마음의 부담이 덜어지고, 삶의 방향을 찾는 데 큰 도움을 받고 있습니다.
앞으로도 이 기도 시간을 소중히 여기고, 하나님과의 교제를 지속적으로 이어가고 싶습니다. 하나님과의 관계를 더욱 깊게 만들어 가며, 제 삶의 모든 부분에서 하나님의 뜻을 따르기를 소망합니다. 매일매일 기도를 통해 얻는 힘과 지혜로, 하나님이 제게 주신 사명을 다할 수 있도록 이끌어 주시기를 기도합니다.

감사해요, 하나님. 저의 기도를 들어주시고, 언제나 함께하시는 하나님께 영광을 돌립니다. 아멘. 🌿`}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{
          paddingHorizontal: moderateScale(24),
        }}
      >
        <View style={[styles.buttonList]}>
          <CustomButton onPress={() => { }} style={[styles.button, styles.secondaryButton]}>
            <MediumText
              fontSize={14}
            >
              삭제하기
            </MediumText>
          </CustomButton>
          <PrimaryButton style={styles.button} onPress={() => { }}>
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