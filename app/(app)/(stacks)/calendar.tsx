import Fire from '@/assets/images/icon/fire.svg';
import LeftArrow from '@/assets/images/icon/leftArrow.svg';
import OneStar from '@/assets/images/icon/one-start.svg';
import Stars from '@/assets/images/icon/star.svg';
import Header from "@/components/Header";
import HistoryNote from '@/components/HistoryNote';
import PrayerState from '@/components/PrayerState';
import { MediumText } from '@/components/text/MediumText';
import { RegularText } from '@/components/text/RegularText';
import { calculateContinuousPrayerDays, calculateToday, calculateTodayPrayerTime, calculateTotalPrayerTime } from '@/utils/date';
import { useHistoryDetailMutation } from '@/utils/mutation';
import { useHistoryQuery } from '@/utils/queries';
import { moderateScale, normalizeFontSize } from "@/utils/style";
import { useQueryClient } from '@tanstack/react-query';
import { Href, router, useLocalSearchParams } from "expo-router";
import React, { JSX, useEffect, useRef, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from "react-native-safe-area-context";

LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  dayNames: ['일', '월', '화', '수', '목', '금', '토'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토']
}

LocaleConfig.defaultLocale = 'kr';

const EmptyNote = () => (
  <View key="emptyNote" style={styles.emptyQuestion}>
    <Stars opacity={0.8} />
    <RegularText
      color="#B3B3B3"
      fontSize={14}
      lineHeight={24}
    >
      기도 기록이 없습니다.
    </RegularText>
  </View>
)

export default function CalendarPage() {

  const queryClient = useQueryClient();

  const {
    backToLink
  } = useLocalSearchParams<{
    backToLink?: string,
  }>();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() => calculateToday());
  const [selectedNoteList, setSelectedNoteList] = useState<JSX.Element[]>([<EmptyNote key="empty" />]);
  const [markedDates, setMarkedDates] = useState<{ [key: string]: { marked: boolean, dotColor: string, prayer_history_id_list: string[] } }>({});

  const selectedDayRef = useRef(selectedDay)

  const { data: history, isSuccess: isHistorySuccess, isFetching: isHistoryFetching } = useHistoryQuery();
  const { mutate: retrieveHistoryNote } = useHistoryDetailMutation({
    onSuccess: (data) => {
      if (data.length === 0) {
        setSelectedNoteList([<EmptyNote key="empty" />])
      } else {
        const sortedData = [...data].sort((a, b) => b.created_date - a.created_date);
        setSelectedNoteList(
          sortedData.map(
            (row, index) => <HistoryNote
              key={row.prayer_history_id}
              testID={index === 0 ? "calendar-note-latest" : `calendar-note-${index}`}
              note={row.note}
              created_date={row.created_date}
              duration={row.duration}
              onPressNote={() => {
                router.navigate(`/historyDetail/${row.prayer_history_id}`)
              }}
            />
          )
        )
      }
    },
    onError: () => {
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
      router.dismissTo(backToLink as Href);
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
              <TouchableOpacity
                testID="calendar-header-back"
                onPress={onPressBack}
                hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
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
                홈
              </MediumText>
            </View>
          }
        />

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

        {/* User Memo */}
        <View style={styles.memoContainer}>
          <MediumText
            fontSize={14}
            lineHeight={24}
          >
            {`${selectedDay.split('-')[0]}년 ${selectedDay.split('-')[1]}월 ${selectedDay.split('-')[2]}일`}
          </MediumText>
          <View testID="calendar-note-list" style={styles.noteListContainer}>
            {selectedNoteList.map((note) => note)}
          </View>
        </View>
        {
          Platform.OS === 'ios' ? null : (
            <View style={{ height: 40 }} />
          )
        }
        <View>

        </View>
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
  memoContainer: {
    paddingHorizontal: moderateScale(24),
    flexGrow: 1,
  },
  noteListContainer: {
    position: 'relative',
    minHeight: moderateScale(220),
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
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    marginTop: moderateScale(12),
    paddingVertical: moderateScale(18),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(10),
    backgroundColor: 'rgba(31, 31, 31, 0.5)'
  }
})
