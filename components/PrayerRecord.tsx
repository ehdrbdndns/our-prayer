import { HistoryType } from '@/utils/dataType';
import { moderateScale } from '@/utils/style';
import React from 'react';
import { StyleSheet, View } from 'react-native';
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
  1: "월",
  2: "화",
  3: "수",
  4: "목",
  5: "금",
  6: "토",
  7: "일"
};

export default function PrayerRecord({ history }: PrayerRecordProps) {
  const generateRecord = (history: HistoryType[]): RecordType[] => {
    const records: RecordType[] = [];
    const today = new Date();
    today.setHours(today.getHours() + 9);

    const getMonday = (date: Date) => {
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      return new Date(date.setDate(diff));
    };

    const startOfCurrentWeek = getMonday(today);

    for (let week = 1; week <= 3; week++) {
      const startOfWeek = new Date(startOfCurrentWeek);
      startOfWeek.setDate(startOfCurrentWeek.getDate() - (3 - week) * 7);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const days = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startOfWeek);
        date.setHours(date.getHours() + 9);
        date.setDate(startOfWeek.getDate() + day);
        const dateString = date.toISOString().split('T')[0];

        const isActive = history.find(
          (entry) => new Date(entry.created_date * 1000).toISOString().split('T')[0] === dateString
        ) !== undefined;

        days.push({ index: day + 1, isActive });
      }

      records.push({ week: `${week} Week`, days });
    }

    return records;
  };

  const records = generateRecord(history);

  return (
    <View style={styles.record}>
      {records.map((weekData, weekIndex) => (
        <View key={weekIndex}>
          {/* Row */}
          <View style={styles.row}>
            <CustomText
              color="#B3B3B3"
              fontSize={10}
              lineHeight={10}
              letterSpacingPercent={-1}
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
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  record: {
    gap: moderateScale(8),
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
    width: moderateScale(28),
    height: moderateScale(28),
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