import { moderateScale } from '@/utils/style';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomText from "./text/CustomText";
import { MediumText } from "./text/MediumText";

export default function PrayerRecord() {
  const testDatas = [
    {
      week: '1 Week',
      days: [
        { index: 1, isActive: true },
        { index: 2, isActive: false },
        { index: 3, isActive: false },
        { index: 4, isActive: true },
        { index: 5, isActive: false },
        { index: 6, isActive: false },
        { index: 7, isActive: false }
      ]
    },
    {
      week: '2 Week',
      days: [
        { index: 1, isActive: true },
        { index: 2, isActive: false },
        { index: 3, isActive: true },
        { index: 4, isActive: true },
        { index: 5, isActive: false },
        { index: 6, isActive: false },
        { index: 7, isActive: false }
      ]
    },
    {
      week: '3 Week',
      days: [
        { index: 1, isActive: true },
        { index: 2, isActive: false },
        { index: 3, isActive: false },
        { index: 4, isActive: false },
        { index: 5, isActive: false },
        { index: 6, isActive: true },
        { index: 7, isActive: false }
      ]
    }
  ];

  const dataEnums: { [key: number]: string } = {
    1: "월",
    2: "화",
    3: "수",
    4: "목",
    5: "금",
    6: "토",
    7: "일"
  };

  return (
    <View style={styles.record}>
      {testDatas.map((weekData, weekIndex) => (
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
                    {dataEnums[day.index]}
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