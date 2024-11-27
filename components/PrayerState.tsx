import { moderateScale } from '@/utils/style';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BoldText } from './text/BoldText';
import CustomText from './text/CustomText';

type PrayerStateProps = {
  title: string;
  icon: React.ReactNode;
  data: string | number;
  unit: string;
  style?: StyleProp<ViewStyle>;
};

export default function PrayerState({ title, icon, data, unit, style }: PrayerStateProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Title */}
      <BoldText
        color="#B3B3B3"
        fontSize={14}
        lineHeight={22}
        letterSpacingPercent={-1}
        style={styles.title}
      >
        {title}
      </BoldText>
      <View style={styles.dataContainer}>
        {/* Icon (24 * 24) */}
        <View style={styles.icon}>
          {icon}
        </View>
        {/* Data */}
        <CustomText
          color="#FFFFFF"
          fontFamily="Inter_600SemiBold"
          lineHeight={24}
          fontSize={24}
          letterSpacingPercent={2}
        >
          {data}
        </CustomText>
        {/* Unit */}
        <BoldText
          fontSize={14}
          lineHeight={22}
          letterSpacingPercent={-1}
        >
          {unit}
        </BoldText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(10),
  },
  title: {
    marginBottom: moderateScale(12),
  },
  icon: {
    width: moderateScale(24),
    height: moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
  },
});