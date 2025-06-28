import { HistoryType } from '@/utils/dataType';
import { moderateScale } from '@/utils/style';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import CustomText from "./text/CustomText";
import { MediumText } from "./text/MediumText";
interface PrayerRecordProps {
  history: HistoryType[];
}
interface RecordType {
  week: string;
  days: {
    index: number;
    isActive: boolean;
  }[];
}

const DataEnums: { [key: number]: string } = {
  1: "일",
  2: "월",
  3: "화",
  4: "수",
  5: "목",
  6: "금",
  7: "토"
};

export default function PrayerRecord({ history }: PrayerRecordProps) {

  // get monday from date week
  const getStartDateOfThisWeek = () => {
    const today = new Date();

    // Set the time to the start of the day
    const startDate = new Date(today.setDate(today.getDate() - today.getDay()));

    startDate.setHours(0, 0, 0, 0);
    startDate.setMinutes(startDate.getMinutes() + (-1 * startDate.getTimezoneOffset()))
    return startDate;
  };

  const getStartDateOfWeekByDate = (date: Date, weekOffset: number): Date => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - (4 - weekOffset) * 7);

    return startOfWeek
  }

  const RegenerateRecord = (history: HistoryType[]): RecordType[] => {
    const records: RecordType[] = [];

    const startOfCurrentWeek = getStartDateOfThisWeek();
    const startOfWeeks: { date: Date, week: number }[] = []

    // Generate start dates for the last 4 weeks
    for (let week = 4; week >= 1; week--) {
      startOfWeeks.push({
        date: getStartDateOfWeekByDate(startOfCurrentWeek, week),
        week: week
      });
    }

    // 각 주의 시작 날짜(startOfWeek)를 기준으로 7일(일~월) 동안의 날짜 배열을 생성하고,
    // 각 날짜(dateString)에 대해 history에 해당 날짜의 기록이 있는지(isActive) 판별하여 days 배열에 추가한다.
    // days 배열은 { index: 요일(1~7), isActive: 기록 여부 } 형태로 구성된다.
    // 마지막으로 해당 주차의 week 정보와 days 배열을 records에 추가한다.
    startOfWeeks.forEach((date) => {
      const { date: startOfWeek, week } = date;
      const days = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startOfWeek);
        date.setHours(date.getHours() + 9);
        date.setDate(startOfWeek.getDate() + day);
        const dateString = date.toISOString().split('T')[0];

        const isActive = history.find(
          (entry) => {
            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const entryDate = new Date(entry.created_date * 1000).toLocaleDateString('sv-SE', { timeZone: userTimeZone });
            return entryDate === dateString;
          }
        ) !== undefined;

        days.push({ index: day + 1, isActive });
      }

      records.push({ week: `${(5 - week)} W`, days });
    })

    return records;
  };

  const records = RegenerateRecord(history);

  return (
    <View style={styles.record}>
      {records.map((weekData, weekIndex) => (
        <View key={weekIndex}>
          {/* Row */}
          <View style={styles.row}>
            <CustomText
              color="#B3B3B3"
              fontSize={10}
              textBreakStrategy="simple"
              letterSpacingPercent={-1}
              style={Platform.OS === 'ios' ? {} : {
                flex: 1,
              }}
            >
              {weekData.week}
            </CustomText>
            <View style={styles.blockList}>
              {weekData.days.map((day, dayIndex) => (
                <View key={dayIndex} style={[styles.block, day.isActive && styles.blockActive]}>
                  <MediumText
                    color={day.isActive ? "#FFFFFF" : "#CFCFCF"}
                    fontSize={10}
                    lineHeight={12}
                  >
                    {DataEnums[day.index]}
                  </MediumText>
                </View>
              ))}
            </View>
          </View>
        </View>
      ))
      }
    </View >
  );
}

const styles = StyleSheet.create({
  record: {
    gap: moderateScale(8),
    paddingLeft: Platform.OS === 'ios' ? 0 : moderateScale(6)
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  blockList: {
    flexDirection: "row",
    gap: moderateScale(7),
    marginLeft: moderateScale(24),
    alignItems: "center"
  },
  block: {
    backgroundColor: "#51525C",
    width: moderateScale(28, 1),
    height: moderateScale(28, 1),
    borderRadius: moderateScale(4),
    justifyContent: "center",
    alignItems: "center"
  },
  blockActive: {
    backgroundColor: "#4F5FFF",

    // ios
    shadowColor: "#5EA3FE",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    // android
    elevation: 4
  }
});