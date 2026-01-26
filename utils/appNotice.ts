import AsyncStorage from '@react-native-async-storage/async-storage';

import { ASYNC_APP_NOTICE_DISMISSED_PREFIX } from '@/storage/asyncStorageKeys';
import type { AppNoticeType } from '@/utils/dataType';

const pad2 = (value: number) => String(value).padStart(2, '0');

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};

const buildDismissedKey = (dateString: string) =>
  `${ASYNC_APP_NOTICE_DISMISSED_PREFIX}${dateString}`;

export const isValidAppNotice = (notice: AppNoticeType | null | undefined): notice is AppNoticeType => {
  if (!notice) return false;
  if (notice.type !== 1 && notice.type !== 2) return false;
  if (typeof notice.title !== 'string' || typeof notice.body !== 'string') return false;
  return true;
};

export const hasDismissedToday = async () => {
  const dateString = getLocalDateString();
  const key = buildDismissedKey(dateString);
  const value = await AsyncStorage.getItem(key);
  return Boolean(value);
};

export const dismissForToday = async () => {
  const dateString = getLocalDateString();
  const key = buildDismissedKey(dateString);
  await AsyncStorage.setItem(key, 'true');
};
