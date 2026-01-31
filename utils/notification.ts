import { ASYNC_PERSONAL_PRAYER_ALARM_TIME, ASYNC_STREAK_REMINDER_NOTIFICATION_ID } from '@/storage/asyncStorageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from "expo-device";
import {
  AndroidImportance,
  cancelScheduledNotificationAsync,
  getExpoPushTokenAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
  setNotificationChannelAsync
} from "expo-notifications";
import { Platform } from "react-native";

const STREAK_REMINDER_TITLE = '오늘 기도하셨나요?';
const STREAK_REMINDER_BODY = '오늘 기도를 하지 않으면 연속 기도 기록이 초기화될 수 있어요.';

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    setNotificationChannelAsync('default', {
      name: 'default',
      importance: AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return '';
    }

    // need to test this
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    if (!projectId) {
      throw new Error('No project ID found');
    }

    try {
      const pushTokenString = (
        await getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      return pushTokenString;
    } catch (e: unknown) {
      throw new Error(e as string);
    }
  } else {
    return ""
    // throw new Error('Must use physical device for push notifications');
  }
}

export async function cancelStreakReminderNotification() {
  const notificationId = await AsyncStorage.getItem(ASYNC_STREAK_REMINDER_NOTIFICATION_ID);
  if (!notificationId) {
    return;
  }

  await cancelScheduledNotificationAsync(notificationId);
  await AsyncStorage.removeItem(ASYNC_STREAK_REMINDER_NOTIFICATION_ID);
}

export async function scheduleStreakReminderForTomorrow() {
  const { status } = await getPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  await cancelStreakReminderNotification();

  const triggerDate = new Date();
  triggerDate.setDate(triggerDate.getDate() + 1);
  triggerDate.setHours(22, 0, 0, 0);

  const notificationId = await scheduleNotificationAsync({
    content: {
      title: STREAK_REMINDER_TITLE,
      body: STREAK_REMINDER_BODY,
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });

  await AsyncStorage.setItem(ASYNC_STREAK_REMINDER_NOTIFICATION_ID, notificationId);
}

export async function cancelPersonalPrayerNotificationsFromStorage() {
  const notificationIdsJson = await AsyncStorage.getItem(ASYNC_PERSONAL_PRAYER_ALARM_TIME);
  if (!notificationIdsJson) {
    return;
  }

  let idsByHour: Record<string, string[]> = {};
  try {
    idsByHour = JSON.parse(notificationIdsJson);
  } catch {
    return;
  }

  const ids = Object.values(idsByHour).flat();
  for (const id of ids) {
    await cancelScheduledNotificationAsync(id);
  }
}
