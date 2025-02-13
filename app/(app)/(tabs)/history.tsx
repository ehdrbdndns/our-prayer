import Fire from '@/assets/images/icon/fire.svg';
import OneStar from '@/assets/images/icon/one-start.svg';
import Stars from '@/assets/images/icon/star.svg';
import Header from "@/components/Header";
import HistoryNote from '@/components/HistoryNote';
import PrayerState from '@/components/PrayerState';
import { MediumText } from '@/components/text/MediumText';
import { RegularText } from '@/components/text/RegularText';
import api from '@/utils/axios';
import { HistoryType } from '@/utils/dataType';
import { calculateContinuousPrayerDays, calculateTodayPrayerTime, calculateTotalPrayerTime } from '@/utils/date';
import { useHistoryQuery } from '@/utils/queries';
import { moderateScale, normalizeFontSize } from "@/utils/style";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Href, router, useLocalSearchParams } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from "react-native-safe-area-context";

LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  dayNames: ['일', '월', '화', '수', '목', '금', '토'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토']
}

LocaleConfig.defaultLocale = 'kr';

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const Today = new Date().toLocaleDateString('sv-SE', { timeZone: userTimeZone });

const EmptyNote = () => (
  <View key="emptyNote" style={styles.emptyQuestion}>
    <Stars opacity={0.8} />
    <RegularText
      color="#B3B3B3"
      fontSize={14}
      lineHeight={24}
    >
      기도 기록이 없습니다
    </RegularText>
  </View>
)

export default function HistoryPage() {

  const queryClient = useQueryClient();

  const {
    backToLink
  } = useLocalSearchParams<{
    backToLink?: string,
  }>();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(Today);
  const [selectedNoteList, setSelectedNoteList] = useState<JSX.Element[]>([<EmptyNote key="empty" />]);
  const [markedDates, setMarkedDates] = useState<{ [key: string]: { marked: boolean, dotColor: string, prayer_history_id_list: string[] } }>({});

  const selectedDayRef = useRef(selectedDay)

  const { data: history, isSuccess: isHistorySuccess, isFetching: isHistoryFetching } = useHistoryQuery();

  const { mutate: retrieveHistoryNote } = useMutation({
    mutationFn: async (prayer_history_id_list: string[]) => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api<HistoryType[]>({
        method: "POST",
        url: "/history/detail",
        data: {
          prayer_history_id_list
        },
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        },
      });

      return res.data.sort((a, b) => b.created_date - a.created_date);
    },
    onSuccess: (data) => {
      if (data.length === 0) {
        setSelectedNoteList([<EmptyNote key="empty" />])
      } else {
        setSelectedNoteList(
          data.map(
            (row) => <HistoryNote
              key={row.prayer_history_id}
              note={row.note}
              created_date={row.created_date}
              duration={row.duration}
              onPressNote={() => {
                router.push(`/historyDetail/${row.prayer_history_id}`)
              }}
            />
          )
        )
      }
    },
    onError: (error, newUser, context) => {
      console.error('onError', error, newUser, context);
      setSelectedNoteList([<EmptyNote key={'empty'} />]);
    },
  })

  useEffect(() => {
    if (!isHistoryFetching && isHistorySuccess) {
      const _markedDates = {
        ...history?.reduce((acc, cur) => {
          const date = new Date(cur.created_date * 1000);
          const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

          if (!acc[formattedDate]) {
            acc[formattedDate] = {
              prayer_history_id_list: [cur.prayer_history_id],
              marked: true,
              dotColor: '#959FFF',
            };
          } else {
            acc[formattedDate].prayer_history_id_list.push(cur.prayer_history_id);
          }

          return acc;
        }, {} as { [key: string]: { prayer_history_id_list: string[], marked: boolean; dotColor: string } })
      }

      setMarkedDates(_markedDates);

      if (!!_markedDates[selectedDay]) {
        retrieveHistoryNote(_markedDates[selectedDay].prayer_history_id_list);
      } else {
        setSelectedNoteList([<EmptyNote key={'empty'} />]);
      }
    }
  }, [isHistoryFetching, isHistorySuccess])

  // 연속 기도 일수
  const continuousPrayerDays = calculateContinuousPrayerDays(history || []);

  // 오늘 기도 시간
  const todayPrayerTime = calculateTodayPrayerTime(history || []);

  // 전체 기도 시간
  const totalPrayerTime = calculateTotalPrayerTime(history || []);

  const onRefresh = async () => {
    setRefreshing(true);

    await queryClient.refetchQueries({ queryKey: ["history"] });

    setRefreshing(false);
  }

  const onPressDay = async (day: DateData) => {
    setSelectedDay(day.dateString);
    selectedDayRef.current = day.dateString;
    if (!markedDates[day.dateString]) {
      setSelectedNoteList([<EmptyNote key={'empty'} />]);
    } else {
      retrieveHistoryNote(markedDates[day.dateString].prayer_history_id_list);
    }
  }

  const onPressBack = () => {
    if (backToLink !== undefined) {
      router.replace(backToLink as Href);
    } else {
      router.back();
    }
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Platform.OS === "ios" ? "#FFFFFF" : "#000000"]}
          tintColor={'#FFFFFF'}
          progressViewOffset={moderateScale(50)}
        />
      }
    >
      <SafeAreaView>
        {/* Header */}
        <Header
          style={styles.header}
          prefix={
            <View style={styles.headerPrefix}>
              <MediumText
                color="#FFF"
                fontSize={16}
              >
                나의 기도 기록
              </MediumText>
            </View>
          }
        />

        {/* Calendar */}
        <View style={styles.container}>
          <Calendar
            onDayPress={onPressDay}
            renderHeader={(date?: XDate) => (
              date ? (
                <MediumText>
                  {date.toString('yyyy년 MM월')}
                </MediumText>
              ) : null
            )}
            hideExtraDays={true}
            theme={{
              // Container
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              calendarBackground: 'transparent',

              // Header
              textDayHeaderFontFamily: "NotoSansKR_500Medium",
              textDayHeaderFontSize: normalizeFontSize(10),
              arrowColor: '#B5BEC6',

              // Day
              textDayFontFamily: 'Inter_500Medium',
              textDayFontSize: normalizeFontSize(14),
              dayTextColor: '#FFF',
              todayTextColor: '#F7EE91',

              // Selected Day
              selectedDayTextColor: '#FFF',
            }}
            markedDates={{
              ...markedDates,
              [selectedDay]: {
                ...markedDates[selectedDay],
                dotColor: '#FFF',
                selected: true,
                selectedColor: '#4F5FFF',
              },
            }}
            style={styles.calendar}
          />
        </View>

        {/* Prayer Data */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: moderateScale(24),
            gap: moderateScale(10),
            marginBottom: moderateScale(24)
          }}
        >
          <PrayerState
            // style={styles.prayerState}
            title={"연속 기도일 수"}
            icon={<Fire width={moderateScale(24)} height={moderateScale(24)} />}
            data={continuousPrayerDays}
            unit={"일"}
          />
          <PrayerState
            // style={styles.prayerState}
            title={"오늘 기도 시간"}
            icon={<OneStar width={moderateScale(24)} height={moderateScale(24)} />}
            data={todayPrayerTime}
            unit={"분"}
          />
          <PrayerState
            // style={styles.prayerState}
            title={"전체 기도 시간"}
            icon={<Stars width={moderateScale(24)} height={moderateScale(24)} />}
            data={totalPrayerTime.time}
            unit={totalPrayerTime.unit}
          />
        </View>

        {/* User Memo */}
        <View style={{ paddingHorizontal: moderateScale(24), flexGrow: 1 }}>
          <MediumText
            fontSize={14}
            lineHeight={24}
          >
            {`${selectedDay.split('-')[0]}년 ${selectedDay.split('-')[1]}월 ${selectedDay.split('-')[2]}일`}
          </MediumText>
          {selectedNoteList.map((note) => note)}
        </View>

        {
          Platform.OS === 'ios' ? null : (
            <View style={{ height: 40 }} />
          )
        }
      </SafeAreaView>
    </ScrollView>
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
    paddingHorizontal: moderateScale(24)
  },
  calendar: {
    borderRadius: moderateScale(10),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: moderateScale(16)
  },
  prayerData: {
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(10),
  },
  emptyQuestion: {
    alignItems: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: 50 }]
  }
})