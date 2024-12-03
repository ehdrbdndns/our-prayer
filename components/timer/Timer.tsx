import Play from "@/assets/images/icon/audio-play.svg";
import Next from "@/assets/images/icon/next.svg";
import Pause from "@/assets/images/icon/pause.svg";
import Prev from "@/assets/images/icon/prev.svg";
import { moderateScale } from "@/utils/style";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useCountdown } from "react-native-countdown-circle-timer";
import { BoldText } from "../text/BoldText";
import CustomText from "../text/CustomText";
import { RegularText } from "../text/RegularText";
import CircleProgress from "./CircleProgress";

type TimerProps = {
  duration: number;
  initialRemainingTime: number;
  isPlaying: boolean;
  onPressNext: (remainingTime: number) => void;
  onPressPrev: (remainingTime: number) => void;
  onPressPlay: () => void;
  onComplete: () => void;
}

export default function Timer(props: TimerProps) {
  const {
    duration,
    initialRemainingTime,
    isPlaying,
    onPressNext,
    onPressPrev,
    onPressPlay,
    onComplete
  } = props as TimerProps;

  const [repeatCount, setRepeatCount] = useState(0);

  let countdown = useCountdown({
    duration,
    initialRemainingTime,
    isPlaying: isPlaying,
    colors: 'url(#gradientColor)',
    size: moderateScale(212),
    strokeWidth: moderateScale(3),
    rotation: 'counterclockwise',
    onComplete,
  });

  const formatRemainingTime = (remainingTime: number) => {
    const minutes = Math.floor(remainingTime / 60)
    const seconds = remainingTime % 60

    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;


    return `${minutes}:${formattedSeconds}`;
  };

  return (
    <View style={styles.timer}>
      {/* Circle Progress */}
      <CircleProgress {...countdown} duration={duration} />

      {/* Remaining Time */}
      <CustomText
        accessibilityRole="timer"
        accessibilityLiveRegion="assertive"
        importantForAccessibility="yes"
        style={styles.reminaingTime}
        fontSize={40}
        lineHeight={48}
        color="white"
      >
        {formatRemainingTime(countdown.remainingTime)}
      </CustomText>

      {/* Plan Title */}
      <BoldText
        fontSize={14}
        color="rgba(255, 255, 255, 0.8)"
      >
        30분 기도
      </BoldText>

      {/* Lecture Title */}
      <RegularText
        fontSize={16}
        lineHeight={26}
        color="rgba(255, 255, 255, 0.8)"
      >
        2. 하나님이 원하시는 기도
      </RegularText>

      {/* Controller */}
      <View style={styles.controller}>
        <Pressable
          style={styles.button}
          onPress={() => onPressPrev(countdown.remainingTime)}
        >
          <Prev />
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={onPressPlay}
        >
          {
            isPlaying
              ? <Pause />
              : <Play />
          }
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => onPressNext(countdown.remainingTime)}
        >
          <Next />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  timer: {
    alignItems: 'center'
  },
  reminaingTime: {
    marginVertical: moderateScale(40),
    fontFamily: 'Inter_400Regular'
  },
  controller: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: moderateScale(280),
    marginTop: moderateScale(64),
    paddingHorizontal: moderateScale(30),
  },
  button: {
    width: moderateScale(48),
    height: moderateScale(48),
    alignItems: 'center',
    justifyContent: 'center',
  }
})