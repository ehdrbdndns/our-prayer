import Play from "@/assets/images/icon/audio-play.svg";
import Pause from "@/assets/images/icon/pause.svg";
import { ASYNC_TIMER_KEY } from "@/storage/asyncStorageKeys";
import { moderateScale } from "@/utils/style";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef } from "react";
import { AppStateStatus, StyleSheet, TouchableOpacity, View } from "react-native";
import { useCountdown } from "react-native-countdown-circle-timer";
import PrimaryButton from "../button/PrimaryButton";
import { BoldText } from "../text/BoldText";
import CustomText from "../text/CustomText";
import { MediumText } from "../text/MediumText";
import { RegularText } from "../text/RegularText";
import CircleProgress from "./CircleProgress";

type TimerProps = {
  planTitle: string;
  lectureTitle: string;
  duration: number;
  initialRemainingTime: number;
  isPlaying: boolean;
  repeatCount: number;
  appState: AppStateStatus;
  onAdjustElapedTime: (elapsedTime: number) => Promise<void>;
  onPressPlay: () => void;
  onComplete: () => void;
  onPressCompleteBtn: (elapsedTime: number) => void;
  setElapsedTime: React.Dispatch<React.SetStateAction<number>>;
}

export default function Timer(props: TimerProps) {
  const {
    planTitle,
    lectureTitle,
    duration,
    initialRemainingTime,
    isPlaying,
    repeatCount,
    appState,
    onAdjustElapedTime,
    onPressPlay,
    onComplete,
    onPressCompleteBtn,
    setElapsedTime
  } = props as TimerProps;

  const prevAppState = useRef<AppStateStatus>(appState);

  let countdown = useCountdown({
    duration,
    initialRemainingTime,
    isPlaying: isPlaying,
    colors: 'url(#gradientColor)',
    size: moderateScale(212),
    strokeWidth: moderateScale(3),
    rotation: 'counterclockwise',
    updateInterval: 1,
    onComplete,
  });

  useEffect(() => {
    setElapsedTime(countdown.elapsedTime);
  }, [countdown.elapsedTime]);

  useEffect(() => {
    async function saveCurTime() {
      // get cur time of UTC
      const curTime = new Date().getTime() / 1000;

      // store cur time to async storage by timer key
      await AsyncStorage.setItem(ASYNC_TIMER_KEY, JSON.stringify(curTime));
    }

    async function updateTimerByStoredTime() {
      const storedTime = await AsyncStorage.getItem(ASYNC_TIMER_KEY);

      if (storedTime === null) return;

      const curTime = new Date().getTime() / 1000;
      const diffTime = curTime - Number(storedTime);

      await onAdjustElapedTime((countdown.elapsedTime + (repeatCount * duration)) + diffTime);
    }

    if (prevAppState.current === 'background' && appState === 'active') {
      updateTimerByStoredTime();
    } else if (appState === 'background') {
      saveCurTime();
    }

    prevAppState.current = appState;
  }, [appState]);

  const showRemainingTime = (remainingTime: number) => {
    const time = repeatCount > 0
      ? (Math.floor(duration * (repeatCount - 1) + (countdown.elapsedTime ? countdown.elapsedTime : 1))) // elapsedTime이 0일 때 화면이 깜빡이는 현상 방지
      : remainingTime;

    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${repeatCount > 0 ? '+' : ''}${minutes}:${formattedSeconds}`;
  };

  const handlePressPlay = async () => {
    onPressPlay();
  };

  return (
    <View style={styles.timer}>
      {/* Circle Progress */}
      <CircleProgress {...countdown} repeatCount={repeatCount} />

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
        {showRemainingTime(countdown.remainingTime)}
      </CustomText>

      {/* Plan Title */}
      <BoldText
        fontSize={14}
        color="rgba(255, 255, 255, 0.8)"
      >
        {planTitle}
      </BoldText>

      {/* Lecture Title */}
      <RegularText
        fontSize={16}
        lineHeight={26}
        color="rgba(255, 255, 255, 0.8)"
      >
        {lectureTitle}
      </RegularText>

      {/* Controller */}
      {
        repeatCount > 0
          ? (
            <View style={[styles.controller, { width: moderateScale(320) }]}>
              <PrimaryButton
                onPress={() => onPressCompleteBtn(countdown.elapsedTime)}
                style={styles.completeButton}
              >
                <MediumText
                  fontSize={14}
                >
                  기도 기록 남기기
                </MediumText>
              </PrimaryButton>
            </View>
          )
          : (
            <View style={styles.controller}>
              <TouchableOpacity
                style={styles.controllerButton}
                onPress={handlePressPlay}
                hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
              >
                {
                  isPlaying
                    ? <Pause
                      width={moderateScale(36)}
                      height={moderateScale(36)}
                    />
                    : <Play
                      width={moderateScale(36)}
                      height={moderateScale(36)}
                    />
                }
              </TouchableOpacity>
            </View>
          )
      }
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
    justifyContent: 'center',
    alignItems: 'center',
    width: moderateScale(280),
    marginTop: moderateScale(64),
    paddingHorizontal: moderateScale(30),
  },
  controllerButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    paddingVertical: moderateScale(12)
  }
})