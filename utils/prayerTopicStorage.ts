import { ASYNC_PRAYER_TOPIC_CHECK_PREFIX, ASYNC_PRAYER_TOPIC_LIST } from '@/storage/asyncStorageKeys';
import { PrayerTopicDailyCheckType, PrayerTopicPriority, PrayerTopicType } from '@/utils/dataType';
import { calculateToday } from '@/utils/date';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CreatePrayerTopicParams = {
  content: string;
  priority: PrayerTopicPriority;
}

type UpdatePrayerTopicParams = {
  prayer_topic_id: string;
  content: string;
  priority: PrayerTopicPriority;
}

type TogglePrayerTopicCheckedParams = {
  prayer_topic_id: string;
  checked: boolean;
  dateKey?: string;
}

type RestorePrayerTopicParams = {
  topic: PrayerTopicType;
  checked?: boolean;
  dateKey?: string;
}

const PRIORITY_WEIGHT: Record<PrayerTopicPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export const PRAYER_TOPIC_PRIORITY_META: Record<PrayerTopicPriority, {
  label: string;
  textColor: string;
  backgroundColor: string;
}> = {
  high: {
    label: '높음',
    textColor: '#FF8D8D',
    backgroundColor: 'rgba(255, 75, 75, 0.16)',
  },
  medium: {
    label: '보통',
    textColor: '#F7EE91',
    backgroundColor: 'rgba(247, 238, 145, 0.16)',
  },
  low: {
    label: '낮음',
    textColor: '#8BC1FF',
    backgroundColor: 'rgba(94, 163, 254, 0.16)',
  },
};

const nowInSeconds = () => Math.floor(Date.now() / 1000);

const parseJSON = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const getPrayerTopicCheckStorageKey = (dateKey: string = calculateToday()) => {
  return `${ASYNC_PRAYER_TOPIC_CHECK_PREFIX}${dateKey}`;
}

export const getPrayerTopicList = async (): Promise<PrayerTopicType[]> => {
  const data = await AsyncStorage.getItem(ASYNC_PRAYER_TOPIC_LIST);
  return parseJSON<PrayerTopicType[]>(data, []);
}

export const setPrayerTopicList = async (topics: PrayerTopicType[]) => {
  await AsyncStorage.setItem(ASYNC_PRAYER_TOPIC_LIST, JSON.stringify(topics));
}

export const createPrayerTopic = async ({
  content,
  priority,
}: CreatePrayerTopicParams): Promise<PrayerTopicType> => {
  const topics = await getPrayerTopicList();
  const nextTime = nowInSeconds();
  const newTopic: PrayerTopicType = {
    prayer_topic_id: `pt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    content,
    priority,
    created_date: nextTime,
    updated_date: nextTime,
  };

  await setPrayerTopicList([newTopic, ...topics]);
  return newTopic;
}

export const updatePrayerTopic = async ({
  prayer_topic_id,
  content,
  priority,
}: UpdatePrayerTopicParams): Promise<PrayerTopicType[]> => {
  const topics = await getPrayerTopicList();
  const nextTime = nowInSeconds();
  const updatedTopics = topics.map((topic) => {
    if (topic.prayer_topic_id !== prayer_topic_id) {
      return topic;
    }

    return {
      ...topic,
      content,
      priority,
      updated_date: nextTime,
    };
  });

  await setPrayerTopicList(updatedTopics);
  return updatedTopics;
}

export const deletePrayerTopic = async (prayer_topic_id: string): Promise<PrayerTopicType[]> => {
  const topics = await getPrayerTopicList();
  const updatedTopics = topics.filter((topic) => topic.prayer_topic_id !== prayer_topic_id);
  await setPrayerTopicList(updatedTopics);

  const todayCheckMap = await getPrayerTopicCheckMap();
  if (todayCheckMap[prayer_topic_id]) {
    delete todayCheckMap[prayer_topic_id];
    await setPrayerTopicCheckMap(todayCheckMap);
  }

  return updatedTopics;
}

export const getPrayerTopicCheckMap = async (dateKey: string = calculateToday()): Promise<PrayerTopicDailyCheckType> => {
  const data = await AsyncStorage.getItem(getPrayerTopicCheckStorageKey(dateKey));
  return parseJSON<PrayerTopicDailyCheckType>(data, {});
}

export const setPrayerTopicCheckMap = async (
  checkMap: PrayerTopicDailyCheckType,
  dateKey: string = calculateToday()
) => {
  await AsyncStorage.setItem(getPrayerTopicCheckStorageKey(dateKey), JSON.stringify(checkMap));
}

export const togglePrayerTopicChecked = async ({
  prayer_topic_id,
  checked,
  dateKey = calculateToday(),
}: TogglePrayerTopicCheckedParams): Promise<PrayerTopicDailyCheckType> => {
  const checkMap = await getPrayerTopicCheckMap(dateKey);

  if (checked) {
    checkMap[prayer_topic_id] = true;
  } else {
    delete checkMap[prayer_topic_id];
  }

  await setPrayerTopicCheckMap(checkMap, dateKey);
  return checkMap;
}

export const restorePrayerTopic = async ({
  topic,
  checked = false,
  dateKey = calculateToday(),
}: RestorePrayerTopicParams): Promise<PrayerTopicType[]> => {
  const topics = await getPrayerTopicList();
  const exists = topics.some((item) => item.prayer_topic_id === topic.prayer_topic_id);
  const restoredTopics = exists ? topics : [topic, ...topics];

  await setPrayerTopicList(restoredTopics);

  if (checked) {
    const checkMap = await getPrayerTopicCheckMap(dateKey);
    checkMap[topic.prayer_topic_id] = true;
    await setPrayerTopicCheckMap(checkMap, dateKey);
  }

  return restoredTopics;
}

export const sortPrayerTopics = (
  topics: PrayerTopicType[],
  _checkedMap: PrayerTopicDailyCheckType = {}
) => {
  return [...topics].sort((a, b) => {
    const priorityDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return b.updated_date - a.updated_date;
  });
}
