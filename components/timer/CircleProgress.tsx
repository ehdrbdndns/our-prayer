import { moderateScale } from "@/utils/style";
import { ImageBackground } from "expo-image";
import { StyleSheet, View } from "react-native";
import { ColorFormat } from "react-native-countdown-circle-timer";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

const CircleProgressBackground = require('@/assets/images/circle-progress-background.png');

type CircleProgressProps = {
  elapsedTime: number
  path: string
  pathLength: number
  remainingTime: number
  rotation: 'clockwise' | 'counterclockwise'
  size: number
  stroke: ColorFormat
  strokeDashoffset: number
  strokeWidth: number,
  repeatCount: number
}

export default function CircleProgress(props: CircleProgressProps) {

  const {
    path,
    pathLength,
    size,
    stroke,
    strokeDashoffset,
    repeatCount,
    strokeWidth,
  } = props;

  return (
    <ImageBackground
      source={CircleProgressBackground}
      style={styles.container}
    >
      <View style={{ width: size, height: size, position: 'relative' }}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="gradientColor" x1="1" y1="0" x2="0" y2="0">
              <Stop offset="0%" stopColor="#7781A0" />
              <Stop offset="100%" stopColor="#4F5FFF" />
            </LinearGradient>
          </Defs>
          <Path
            d={path}
            stroke={stroke}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={pathLength}
            strokeDashoffset={
              repeatCount > 0
                ? 0
                : pathLength - strokeDashoffset
            }
          />
        </Svg>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    width: moderateScale(212),
    height: moderateScale(212),
    justifyContent: 'center',
    alignItems: 'center',
  }
});