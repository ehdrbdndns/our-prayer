import Edit from '@/assets/images/icon/edit.svg';
import Star from '@/assets/images/icon/star.svg';
import CustomButton from '@/components/button/CustomButton';
import PrayerRecord from '@/components/PrayerRecord';
import { BoldText } from "@/components/text/BoldText";
import CustomText from '@/components/text/CustomText';
import { MediumText } from '@/components/text/MediumText';
import { RegularText } from '@/components/text/RegularText';
import { moderateScale, scaleHeight } from "@/utils/style";
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyPage() {

  const insets = useSafeAreaInsets();

  const [enableAlarm, setEnableAlarm] = useState(true);

  const onChangeAlarm = () => {
    setEnableAlarm(!enableAlarm);
  }

  const onPressEditName = () => {
    router.push('/editNickname');
  }

  const onPressPrayerTime = () => {
    router.push('/prayerTime');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scaleHeight(20) }}
      >
        <View style={{
          marginTop: scaleHeight(60),
          marginBottom: scaleHeight(40),
        }}>
          {/* Name */}
          <TouchableOpacity
            onPress={onPressEditName}
            style={{ height: moderateScale(44) }}
          >
            <View style={{ flexDirection: 'row', gap: moderateScale(8), alignItems: 'center' }}>
              <BoldText
                fontSize={24}
                lineHeight={36}
              >
                동규우운
              </BoldText>
              <Edit
                width={moderateScale(20)}
                height={moderateScale(20)}
              />
            </View>
          </TouchableOpacity>

          {/* Sub Description */}
          <BoldText
            fontSize={14}
            lineHeight={16}
            color='#B3B3B3'
          >
            Our Pray와 함께한지 34일이 되었어요
          </BoldText>
        </View>

        {/* Data */}
        <View
          style={{
            backgroundColor: 'rgba(31, 31, 31, 0.5)',
            borderRadius: moderateScale(10),
            gap: scaleHeight(12),
            padding: moderateScale(12),
            marginBottom: scaleHeight(12),
          }}
        >
          {/* Title */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{
              flexDirection: 'row',
              gap: moderateScale(8)
            }}>
              <Star
                width={moderateScale(22)}
                height={moderateScale(24)}
              />
              <BoldText fontSize={14}>
                나의 기도 데이터
              </BoldText>
            </View>
            <TouchableOpacity>
              <MediumText
                fontSize={12}
                color="#B3B3B3"
              >
                기도 기록 보기
              </MediumText>
            </TouchableOpacity>
          </View>

          {/* CardList */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {/* 연속 기도 일수 */}
            <View style={styles.card}>
              <MediumText
                fontSize={12}
                color='#B3B3B3'>
                연속 기도 일수
              </MediumText>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(2) }}
              >
                <CustomText
                  fontFamily='Inter_600SemiBold'
                  fontSize={20}
                >
                  36
                </CustomText>
                <RegularText fontSize={12}>
                  일
                </RegularText>
              </View>
            </View>

            {/* 오늘 기도 시간 */}
            <View style={styles.card}>
              <MediumText
                fontSize={12}
                color='#B3B3B3'>
                오늘 기도 시간
              </MediumText>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(2) }}
              >
                <CustomText
                  fontFamily='Inter_600SemiBold'
                  fontSize={20}
                >
                  14
                </CustomText>
                <RegularText fontSize={12}>
                  분
                </RegularText>
              </View>
            </View>

            {/* 전체 기도 시간 */}
            <View style={styles.card}>
              <MediumText
                fontSize={12}
                color='#B3B3B3'>
                전체 기도 시간
              </MediumText>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(2) }}
              >
                <CustomText
                  fontFamily='Inter_600SemiBold'
                  fontSize={20}
                >
                  2.4
                </CustomText>
                <RegularText fontSize={12}>
                  시간
                </RegularText>
              </View>
            </View>
          </View>
        </View>

        {/* mini calendar */}
        <View
          style={{
            padding: moderateScale(10),
            backgroundColor: 'rgba(31, 31, 31, 0.5)',
            borderRadius: moderateScale(10),
          }}
        >
          <PrayerRecord />
        </View>

        {/* 알림 */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: moderateScale(10),
            paddingHorizontal: moderateScale(12),
            marginVertical: moderateScale(24),
          }}
        >
          <BoldText
            fontSize={14}
            lineHeight={22}
          >
            알림 설정
          </BoldText>
          <Switch
            onValueChange={onChangeAlarm}
            trackColor={{ false: '#363E55', true: '#4F5FFF' }}
            thumbColor={enableAlarm ? '#E4E6FC' : '#7781A0'}
            value={enableAlarm}
          />
        </View>

        {/* 버튼 리스트 */}
        <View style={{
          marginBottom: moderateScale(24),
          gap: moderateScale(12),
        }}>
          <CustomButton onPress={onPressPrayerTime} style={styles.button}>
            <BoldText
              color="#FFFFFF"
              fontSize={14}
              lineHeight={22}
              letterSpacingPercent={-1}
            >
              기도 시간 설정하기
            </BoldText>
          </CustomButton>
          <CustomButton style={styles.button}>
            <BoldText
              color="#FFFFFF"
              fontSize={14}
              lineHeight={22}
              letterSpacingPercent={-1}
            >
              카카오 계정 연동하기
            </BoldText>
          </CustomButton>
          <CustomButton style={styles.button}>
            <BoldText
              color="#FFFFFF"
              fontSize={14}
              lineHeight={22}
              letterSpacingPercent={-1}
            >
              Our Pray에 문의하기
            </BoldText>
          </CustomButton>
          <CustomButton style={styles.button}>
            <BoldText
              color="#FFFFFF"
              fontSize={14}
              lineHeight={22}
              letterSpacingPercent={-1}
            >
              서비스 이용 약관
            </BoldText>
          </CustomButton>
        </View>

        {/* 개인 정보 처리 방침 */}
        <TouchableOpacity style={styles.textButton}>
          <MediumText
            fontSize={12}
            color="#B3B3B3"
          >
            개인 정보 처리 방침
          </MediumText>
        </TouchableOpacity>

        {/* 회원 탈퇴 */}
        <TouchableOpacity style={styles.textButton}>
          <MediumText
            fontSize={12}
            color="#B3B3B3"
          >
            회원 탈퇴
          </MediumText>
        </TouchableOpacity>

      </ScrollView >
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: moderateScale(24),
  },
  card: {
    borderRadius: moderateScale(6),
    padding: moderateScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  button: {
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(24),
  },
  textButton: {
    height: moderateScale(44),
  }
});