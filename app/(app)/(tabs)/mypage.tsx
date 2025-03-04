import Edit from '@/assets/images/icon/edit.svg';
import Star from '@/assets/images/icon/star.svg';
import CustomButton from '@/components/button/CustomButton';
import PrayerRecord from '@/components/PrayerRecord';
import { BoldText } from "@/components/text/BoldText";
import CustomText from '@/components/text/CustomText';
import { MediumText } from '@/components/text/MediumText';
import { RegularText } from '@/components/text/RegularText';
import { useSession } from '@/ctx';
import { calculateContinuousPrayerDays, calculateDaysSinceSignup, calculateTodayPrayerTime, calculateTotalPrayerTime } from '@/utils/date';
import { useDeleteUserMutation, useUserMutation } from '@/utils/mutation';
import { useHistoryQuery, useUserQuery } from '@/utils/queries';
import { moderateScale, scaleHeight } from "@/utils/style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, RefreshControl, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyPage() {

  const insets = useSafeAreaInsets();

  const queryClient = useQueryClient();

  const { session, signOut, isLoading, setSession } = useSession();

  const [refreshing, setRefreshing] = useState(false);
  const [enableAlarm, setEnableAlarm] = useState(false);
  const [name, setName] = useState('');

  const { data: history, isSuccess: isHistorySuccess } = useHistoryQuery();
  const { data: user, isSuccess: isUserSuccess } = useUserQuery({
    onSuccess: (isAlarm) => setEnableAlarm(isAlarm)
  });

  const { mutate: userMutate } = useUserMutation();
  const { mutate: deleteUserMutate } = useDeleteUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries();
      signOut();
    },
    onError: () => {
      // Todo: error handling
    },
  });

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

  const onRefetch = async () => {
    setRefreshing(true);

    await queryClient.refetchQueries({ queryKey: ["history"] });
    await queryClient.refetchQueries({ queryKey: ["user"] });

    setRefreshing(false);
  }

  const onChangeAlarm = async () => {
    const newEnableAlarm = !enableAlarm;

    // 알람 비활성화
    if (!newEnableAlarm) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } else {
      // 알람 활성화
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        if (Platform.OS === 'ios') {
          Linking.openURL('app-settings:')
        } else {
          Linking.openSettings();
        }
        return;
      }

      // schedule notifications from notificationIds
      const notificationIds = await AsyncStorage.getItem('notificationIds');
      if (notificationIds) {
        const ids = JSON.parse(notificationIds);
        Object.keys(ids).forEach(async (hour) => {
          const notificationIds = [];

          // 10분 전 알림
          const id1 = await Notifications.scheduleNotificationAsync({
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
          notificationIds.push(id1);

          // 본 시간 알림
          const id2 = await Notifications.scheduleNotificationAsync({
            content: {
              title: "기도 시간입니다.",
              body: "기도 시간입니다.",
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour: Number(hour),
              minute: 0
            },
          });
          notificationIds.push(id2);

          ids[hour] = notificationIds;
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

  // 서비스 이용 약관
  const onPressServicePolicy = async () => {
    await WebBrowser.openBrowserAsync('https://sunny-book-517.notion.site/our-prayer-182748b531d08033a65af055af5659de?pvs=4')
  }

  // 개인정보처리방침
  const onPressPrivacyPolicy = async () => {
    await WebBrowser.openBrowserAsync('https://sunny-book-517.notion.site/our-prayer-182748b531d080049a59e5a00cc3980f');
  }

  // 문의하기
  const onPressContact = async () => {
    await WebBrowser.openBrowserAsync('https://docs.google.com/forms/d/e/1FAIpQLSeOyd4YtHlkRXYJtXDzgcLoLh6659zRi-mqiyrHjbwpQJAgRQ/viewform?usp=dialog');
  }

  // 도움 주신 분들
  const onPressSupporterList = () => {
    router.push('/supportersList');
  }

  if (isLoading) {
    return null; // TODO : Add skeleton
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scaleHeight(20) }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefetch}
            colors={[Platform.OS === "ios" ? "#FFFFFF" : "#000000"]}
            tintColor={'#FFFFFF'}
          />
        }
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
            '우리의 기도'와 함께한지 {daysSinceSignup}일이 되었어요
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
              hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
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
          <CustomButton
            onPress={onPressContact}
            style={styles.button}
          >
            <BoldText
              color="#FFFFFF"
              fontSize={14}
              lineHeight={22}
              letterSpacingPercent={-1}
            >
              '우리의 기도'에 문의하기
            </BoldText>
          </CustomButton>
          <CustomButton
            onPress={onPressSupporterList}
            style={styles.button}
          >
            <BoldText
              color="#FFFFFF"
              fontSize={14}
              lineHeight={22}
              letterSpacingPercent={-1}
            >
              도움 주신 분들
            </BoldText>
          </CustomButton>
          <CustomButton
            onPress={onPressServicePolicy}
            style={styles.button}
          >
            <BoldText
              color="#FFFFFF"
              fontSize={14}
              lineHeight={22}
              letterSpacingPercent={-1}
            >
              서비스 이용 약관
            </BoldText>
          </CustomButton>
          <CustomButton
            onPress={onPressPrivacyPolicy}
            style={styles.button}
          >
            <BoldText
              color="#FFFFFF"
              fontSize={14}
              lineHeight={22}
              letterSpacingPercent={-1}
            >
              개인 정보 처리 방침
            </BoldText>
          </CustomButton>
        </View>

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