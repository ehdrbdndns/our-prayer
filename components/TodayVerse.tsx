import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import { moderateScale } from "@/utils/style";
import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomButton from "./button/CustomButton";

interface TodayVerseProps {
  subTitle: string;
  content: string;
  onPress?: () => void;
}

export default function TodayVerse({ subTitle, content, onPress }: TodayVerseProps) {
  return (
    <View>
      {/* Title */}
      <BoldText
        style={styles.title}
        color="#FFFFFF"
        fontSize={16}
        lineHeight={24}
        letterSpacingPercent={-1}
      >
        오늘의 말씀
      </BoldText>

      {/* Card */}
      <View style={styles.card}>
        {/* subTitle */}
        <MediumText
          style={styles.subTitle}
          color="#B3B3B3"
          fontSize={12}
          lineHeight={22}
          letterSpacingPercent={-1}
        >
          {subTitle}
        </MediumText>

        {/* content */}
        <RegularText
          style={styles.content}
          color="#FFFFFF"
          fontSize={16}
          lineHeight={24}
          letterSpacingPercent={-1}
        >
          {content}
        </RegularText>
        {/* button */}
        <CustomButton
          style={styles.button}
          onPress={onPress}
        >
          <MediumText
            color="#FFFFFF"
            fontSize={14}
            lineHeight={21}
            letterSpacingPercent={-1}
          >
            기도 시작하기
          </MediumText>
        </CustomButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: moderateScale(12),
  },
  card: {
    paddingVertical: moderateScale(18),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(10),
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  subTitle: {
    marginBottom: moderateScale(4),
  },
  content: {
    marginBottom: moderateScale(20),
  },
  button: {
    width: 'auto',
    alignSelf: 'flex-start',
    backgroundColor: '#0F141A',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(24),
  },
});