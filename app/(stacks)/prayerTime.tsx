
import CheckedCircle from '@/assets/images/icon/checkedCircle.svg';
import LeftArrow from '@/assets/images/icon/leftArrow.svg';
import UnCheckedCircle from '@/assets/images/icon/unCheckedCircle.svg';
import CustomButton from '@/components/button/CustomButton';
import Header from "@/components/Header";
import { BoldText } from '@/components/text/BoldText';
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from '@/components/text/RegularText';
import { moderateScale, scaleHeight } from "@/utils/style";
import { router } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TimeHashTable: { [key: number]: string } = {
  1: '오전 1시', 2: '오전 2시', 3: '오전 3시', 4: '오전 4시', 5: '오전 5시', 6: '오전 6시',
  7: '오전 7시', 8: '오전 8시', 9: '오전 9시', 10: '오전 10시', 11: '오전 11시', 12: '오전 12시',
  13: '오후 1시', 14: '오후 2시', 15: '오후 3시', 16: '오후 4시', 17: '오후 5시', 18: '오후 6시',
  19: '오후 7시', 20: '오후 8시', 21: '오후 9시', 22: '오후 10시', 23: '오후 11시', 24: '오후 12시'
};

const times = Array.from({ length: 24 }, (_, i) => i + 1);

export default function PrayerTime() {
  const insets = useSafeAreaInsets();

  const onPressBack = () => {
    router.back();
  }

  return (
    <View style={[{ paddingTop: insets.top }]}>
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
              기도 시간 설정하기
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
        <View style={{ gap: moderateScale(12) }}>
          <BoldText
            fontSize={24}
            lineHeight={36}
          >
            기도 시간을 설정합니다
          </BoldText>
          <RegularText
            fontSize={14}
            lineHeight={24}
            color='#B3B3B3'
          >
            편안하게 기도할 수 있는 시간을 선택하세요. 여러 시간대를
            설정해서 알람을 받을 수도 있습니다.
          </RegularText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: moderateScale(12) }}
        >
          {times.map((time: number) => (
            <CustomButton key={time} style={styles.button}>
              <View style={styles.buttonContent}>
                {time === 1 ? <CheckedCircle /> : <UnCheckedCircle />}
                <BoldText fontSize={12} lineHeight={22}>
                  {TimeHashTable[time]}
                </BoldText>
              </View>
            </CustomButton>
          ))}
          <View style={{ height: scaleHeight(500) }} />
        </ScrollView>
      </View>
    </View>
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
    flexGrow: 1,
    paddingHorizontal: moderateScale(24),
    gap: moderateScale(44),
  },
  button: {
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  buttonContent: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: moderateScale(12),
  },
});