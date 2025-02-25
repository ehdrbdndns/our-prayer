import CheckedCircle from '@/assets/images/icon/checkedCircle.svg';
import LeftArrow from '@/assets/images/icon/leftArrow.svg';
import UnCheckedCircle from '@/assets/images/icon/unCheckedCircle.svg';
import CustomButton from '@/components/button/CustomButton';
import Header from "@/components/Header";
import { BoldText } from '@/components/text/BoldText';
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from '@/components/text/RegularText';
import { moderateScale, scaleHeight } from "@/utils/style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router } from "expo-router";
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TimeHashTable: { [key: number]: string } = {
  1: '오전 1시', 2: '오전 2시', 3: '오전 3시', 4: '오전 4시', 5: '오전 5시', 6: '오전 6시',
  7: '오전 7시', 8: '오전 8시', 9: '오전 9시', 10: '오전 10시', 11: '오전 11시', 12: '오전 12시',
  13: '오후 1시', 14: '오후 2시', 15: '오후 3시', 16: '오후 4시', 17: '오후 5시', 18: '오후 6시',
  19: '오후 7시', 20: '오후 8시', 21: '오후 9시', 22: '오후 10시', 23: '오후 11시', 24: '오후 12시'
};

// 1 ~ 24시간대 배열 생성
const times = Array.from({ length: 24 }, (_, i) => i + 1);

const saveNotificationIds = async (ids: { [hour: number]: string[] }) => {
  try {
    await AsyncStorage.setItem('notificationIds', JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save notification IDs', e);
  }
};

const getNotificationIds = async () => {
  try {
    const ids = await AsyncStorage.getItem('notificationIds');
    return ids ? JSON.parse(ids) : {};
  } catch (e) {
    console.error('Failed to fetch notification IDs', e);
    return {};
  }
};

export default function PrayerTime() {
  const insets = useSafeAreaInsets();

  const [selectedTimes, setSelectedTimes] = useState<boolean[]>(Array.from({ length: 24 }, () => false));
  const [notificationIds, setNotificationIds] = useState<{ [hour: number]: string[] }>({});

  // 기존에 설정된 알림 ID 불러오기
  useEffect(() => {
    const fetchNotificationIds = async () => {
      const ids = await getNotificationIds();
      setNotificationIds(ids);
      Object.keys(ids).forEach((hour) => {
        setSelectedTimes((prev) => {
          const newTimes = [...prev];
          newTimes[Number(hour)] = true;
          return newTimes;
        });
      });
    };

    fetchNotificationIds();
  }, []);

  const scheduleNotification = async (hour: number) => {
    const ids: string[] = [];

    // 10분 전 알림
    const id1 = await Notifications.scheduleNotificationAsync({
      content: {
        title: "곧 기도 시간입니다.",
        body: "기도 시간 10분 전입니다.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hour - 1,
        minute: 50
      },
    });
    ids.push(id1);

    // 본 시간 알림
    const id2 = await Notifications.scheduleNotificationAsync({
      content: {
        title: "기도 시간입니다.",
        body: "기도를 시작하세요.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hour,
        minute: 0
      },
    });
    ids.push(id2);

    setNotificationIds((prev) => {
      const newIds = { ...prev, [hour]: ids };
      saveNotificationIds(newIds);
      return newIds;
    });
  };

  const cancelNotification = async (hour: number) => {
    const ids = notificationIds[hour];
    if (ids) {
      for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      setNotificationIds((prev) => {
        const newIds = { ...prev };
        delete newIds[hour];
        saveNotificationIds(newIds);
        return newIds;
      });
    }
  }

  const onTimeSelect = (hour: number) => {
    setSelectedTimes((prev) => {
      const newTimes = [...prev];
      newTimes[hour] = !prev[hour];
      return newTimes;
    });
  }

  const onPressSave = async () => {
    // 기존에 설정된 알림 취소
    await Notifications.cancelAllScheduledNotificationsAsync();

    selectedTimes.forEach(async (selected, hour) => {
      if (selected) {
        await scheduleNotification(hour);
      } else {
        await cancelNotification(hour);
      }
    });

    Alert.alert('저장되었습니다.', '기도 시간이 저장되었습니다.',
      [
        {
          text: '확인',
          onPress: () => router.back(),
        },
      ],
      { cancelable: false }
    );
  }

  const onPressBack = () => {
    const hasChanges = selectedTimes.some((selected, hour) => selected !== selectedTimes[hour]);

    if (!hasChanges) {
      router.back();
    } else {
      Alert.alert(
        '변경사항이 저장되지 않았습니다.',
        '정말 나가시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '나가기',
            onPress: () => router.back(),
          },
        ],
        { cancelable: false }
      );
    }
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
          <TouchableOpacity
            onPress={() => onPressSave()}
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
            <CustomButton
              key={time}
              style={styles.button}
              onPress={() => onTimeSelect(time)}
            >
              <View style={styles.buttonContent}>
                {selectedTimes[time] ? <CheckedCircle /> : <UnCheckedCircle />}
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