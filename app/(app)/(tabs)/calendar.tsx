import Fire from '@/assets/images/icon/fire.svg';
import LeftArrow from '@/assets/images/icon/leftArrow.svg';
import OneStar from '@/assets/images/icon/one-start.svg';
import Stars from '@/assets/images/icon/star.svg';
import Header from "@/components/Header";
import PrayerState from '@/components/PrayerState';
import { MediumText } from '@/components/text/MediumText';
import { RegularText } from '@/components/text/RegularText';
import { moderateScale, normalizeFontSize } from "@/utils/style";
import { router } from "expo-router";
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from "react-native-safe-area-context";

LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  dayNames: ['일', '월', '화', '수', '목', '금', '토'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토']
}

LocaleConfig.defaultLocale = 'kr';

const Today = new Date().toISOString().split('T')[0];

export default function CalendarPage() {

  const [selectedDay, setSelectedDay] = useState(Today);

  const onPressBack = () => {
    router.back();
  }

  return (
    <SafeAreaView>
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
              나의 기도 기록
            </MediumText>
          </View>
        }
      />

      {/* Calendar */}
      <View style={styles.container}>
        <Calendar
          onDayPress={(day) => setSelectedDay(day.dateString)}
          renderHeader={(date?: XDate) => (
            date ? (
              <MediumText>
                {date.toString('yyyy년 MM월')}
              </MediumText>
            ) : null
          )}
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

            // Selected Day
            selectedDayTextColor: '#FFF'
          }}
          markedDates={{
            '2024-12-08': {
              marked: true,
              dotColor: '#959FFF',
            },
            [selectedDay]: {
              selected: true,
              disableTouchEvent: true,
              selectedColor: '#4F5FFF',
              textColor: '#FFF',
              dotColor: '#FFF',

              // Todo: check if this is marked
              // marked: true,
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
          data={134}
          unit={"일"}
        />
        <PrayerState
          // style={styles.prayerState}
          title={"연속 기도일 수"}
          icon={<OneStar width={moderateScale(24)} height={moderateScale(24)} />}
          data={14}
          unit={"분"}
        />
        <PrayerState
          // style={styles.prayerState}
          title={"연속 기도일 수"}
          icon={<Stars width={moderateScale(24)} height={moderateScale(24)} />}
          data={1}
          unit={"백 시간"}
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

        <View style={styles.emptyQuestion}>
          <Stars opacity={0.8} />
          <RegularText
            color="#B3B3B3"
            fontSize={14}
            lineHeight={24}
          >
            기도 기록이 없습니다.
          </RegularText>
        </View>
      </View>
    </SafeAreaView>
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
  },
})