import { getLetterSpacing, normalizeFontSize } from "@/utils/style";
import { PropsWithChildren } from "react";
import { StyleSheet, Text } from "react-native";

export type CustomTextProps = PropsWithChildren<{
  fontSize?: number;
  lineHeight?: number;
  letterSpacingPercent?: number;
  color?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  style?: any;
}>

export default function CustomText({
  children,
  fontSize = 16,
  lineHeight,
  letterSpacingPercent = -1,
  color = '#FFFFFF',
  fontFamily = 'NotoSansKR_500Medium',
  textAlign = "left",
  style,
  ...props
}: CustomTextProps) {
  const normalizedFontSize = normalizeFontSize(fontSize);

  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: normalizedFontSize,
          lineHeight: normalizeFontSize(lineHeight || fontSize * 1.5),
          letterSpacing: getLetterSpacing(normalizedFontSize, letterSpacingPercent),
          textAlign,
          color,
          fontFamily,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    includeFontPadding: false, // 안드로이드 패딩 제거
    textAlignVertical: 'center', // 텍스트 정렬
  },
});