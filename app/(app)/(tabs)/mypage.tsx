import Edit from '@/assets/images/icon/edit.svg';
import Star from '@/assets/images/icon/star.svg';
import CustomButton from '@/components/button/CustomButton';
import PrayerRecord from '@/components/PrayerRecord';
import { BoldText } from "@/components/text/BoldText";
import CustomText from '@/components/text/CustomText';
import { MediumText } from '@/components/text/MediumText';
import { RegularText } from '@/components/text/RegularText';
import { useSession } from '@/ctx';
import api from '@/utils/axios';
import { UserType } from '@/utils/dataType';
import { calculateContinuousPrayerDays, calculateDaysSinceSignup, calculateTodayPrayerTime, calculateTotalPrayerTime } from '@/utils/date';
import { useUserMutation } from '@/utils/mutation';
import { useHistoryQuery } from '@/utils/queries';
import { moderateScale, scaleHeight } from "@/utils/style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyPage() {

  const insets = useSafeAreaInsets();

  const queryClient = useQueryClient();
  const { session, signOut, isLoading, setSession } = useSession();
  const [enableAlarm, setEnableAlarm] = useState(false);
  const [name, setName] = useState('');

  const { data: history, isSuccess: isHistorySuccess } = useHistoryQuery();
  const { data: user, isSuccess: isUserSuccess } = useQuery<UserType>({
    queryKey: ["user"],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.get<UserType>(`/user`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        }
      });

      setEnableAlarm(Boolean(res.data.alarm));

      return res.data;
    },
    staleTime: 12 * 60 * 60 * 1000, // 12시간
    gcTime: 12 * 60 * 60 * 1000, // 12시간
  });
  const { mutate: userMutate } = useUserMutation();
  const { mutate: deleteUserMutate } = useMutation({
    mutationFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api<{ message: string }>({
        method: "DELETE",
        url: "/user",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        },
      });

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      signOut();
    },
    onError: (error, newUser, context) => {
      console.error('onError', error, newUser, context);
    },
  })

  useEffect(() => {
    if (!!session && !isLoading) {
      const { name, alarm } = JSON.parse(session);
      setName(name);
      setEnableAlarm(alarm);
    }
  }, [session, isLoading]);

  // 연속 기도 일수
  const continuousPrayerDays = calculateContinuousPrayerDays(history || []);

  // 오늘 기도 시간
  const todayPrayerTime = calculateTodayPrayerTime(history || []);

  // 전체 기도 시간
  const totalPrayerTime = calculateTotalPrayerTime(history || []);

  // 가입한 날로부터 경과한 일수
  const daysSinceSignup = user?.created_date ? calculateDaysSinceSignup(user.created_date) : 0;

  const onChangeAlarm = async () => {
    const newEnableAlarm = !enableAlarm;

    // 알람 비활성화
    if (!newEnableAlarm) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } else {
      // 알람 활성화
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('알림 권한이 필요합니다.');
        return;
      }

      // schedule notifications from notificationIds
      const notificationIds = await AsyncStorage.getItem('notificationIds');
      if (notificationIds) {
        const ids = JSON.parse(notificationIds);
        Object.keys(ids).forEach(async (hour) => {
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: "곧 기도 시간입니다.",
              body: "기도 시간 10분 전입니다.",
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour: Number(hour) - 1,
              minute: 50
            },
          });

          ids[hour] = notificationId;
        });

        await AsyncStorage.setItem('notificationIds', JSON.stringify(ids));
      }
    }

    userMutate({ alarm: !enableAlarm });
    setEnableAlarm(!enableAlarm);

    if (!!session) {
      setSession(JSON.stringify({ ...JSON.parse(session), alarm: !enableAlarm }));
    }
  }

  const onPressEditName = () => {
    router.push('/editNickname');
  }

  const onPressPrayerTime = () => {
    if (enableAlarm) {
      router.push('/prayerTime');
    } else {
      Alert.alert('알림을 활성화해주세요.');
    }
  }

  const onPressHistory = () => {
    router.push('/calendar');
  }

  const onPressDeleteAccount = () => {
    Alert.alert(
      '계정을 삭제하시겠습니까?', // title
      '삭제된 계정은 되돌릴 수 없습니다.', // message
      [                     // buttons
        { text: '취소', style: 'cancel' },
        {
          text: '삭제하기', onPress: () => deleteUserMutate()
        }
      ]
    )
  }

  if (isLoading) {
    return null; // TODO : Add skeleton
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
                {name}
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
            Our Pray와 함께한지 {daysSinceSignup}일이 되었어요
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
            <TouchableOpacity
              onPress={onPressHistory}
            >
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
                  {continuousPrayerDays}
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
                  {todayPrayerTime}
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
                  {totalPrayerTime.time}
                </CustomText>
                <RegularText fontSize={12}>
                  {totalPrayerTime.unit}
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
          <PrayerRecord history={history || []} />
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
          {/* <CustomButton style={styles.button}>
            <BoldText
              color="#FFFFFF"
              fontSize={14}
              lineHeight={22}
              letterSpacingPercent={-1}
            >
              카카오 계정 연동하기
            </BoldText>
          </CustomButton> */}
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
        <TouchableOpacity onPress={onPressDeleteAccount} style={styles.textButton}>
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