import Music from "@/assets/images/icon/music.svg";
import Mute from "@/assets/images/icon/mute.svg";
import Amp from "@/classes/Amp";
import CustomButton from "@/components/button/CustomButton";
import Header from "@/components/Header";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import Timer from "@/components/timer/Timer";
import { ASYNC_IS_PRAYING } from "@/storage/asyncStorageKeys";
import { getE2EDurationSeconds } from "@/utils/e2e";
import { useScreenTransition } from "@/utils/hooks/useScreenTransition";
import { moderateScale, scaleHeight } from "@/utils/style";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useKeepAwake } from "expo-keep-awake";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, AppState, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FreePrayerPage() {
  useKeepAwake();

  const insets = useSafeAreaInsets();
  const { lecture_id, plan_title, prayer_minutes } = useLocalSearchParams<{
    lecture_id: string;
    plan_title: string;
    prayer_minutes: string;
  }>();

  const selectedMinutes = useMemo(() => {
    const parsed = Number(prayer_minutes);
    if (!Number.isFinite(parsed)) {
      return 1;
    }

    return Math.max(1, Math.min(300, Math.round(parsed)));
  }, [prayer_minutes]);

  const { isIntroVisible, isContentVisible, introOpacity, contentOpacity } = useScreenTransition({
    isDataLoaded: true,
  });

  const [timerKey, setTimerKey] = useState(0);
  const [repeatCount, setRepeatCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [initialRemainingTime, setInitialRemainingTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBgmMute, setIsBgmMute] = useState(false);

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const hasPlayedEndingRef = useRef(false);
  const isEndingTriggeringRef = useRef(false);
  const ampRef = useRef<Amp | null>(null);

  useEffect(() => {
    let mounted = true;
    const amp = new Amp("free", [], {
      isPlaying: true,
      bgmSource: {
        kind: "module",
        module: require("../../../assets/audio/free/bgm.mp3"),
      },
      effectSources: {
        ending: {
          kind: "module",
          module: require("../../../assets/audio/free/ending.mp3"),
        },
      },
    });
    ampRef.current = amp;

    const turnOnAmp = async () => {
      const isAmpTurnedOn = await amp.turnOn();
      if (!mounted) {
        await amp.turnOff();
        return;
      }

      if (!isAmpTurnedOn) {
        Alert.alert("오디오 오류", "자유기도 음원을 불러오지 못했습니다.", [
          {
            text: "확인",
            onPress: () => router.dismissTo("/plan"),
          },
        ]);
      }
    };
    void turnOnAmp();

    return () => {
      mounted = false;
      const turnOffAmp = async () => {
        await amp.turnOff();
        if (ampRef.current === amp) {
          ampRef.current = null;
        }
      };
      void turnOffAmp();
    };
  }, []);

  useEffect(() => {
    if (!isContentVisible) {
      return;
    }

    const prayerDurationSeconds = getE2EDurationSeconds(selectedMinutes * 60);

    setIsPlaying(true);
    setDuration(prayerDurationSeconds);
    setInitialRemainingTime(prayerDurationSeconds);
    setRepeatCount(0);
    hasPlayedEndingRef.current = false;
    isEndingTriggeringRef.current = false;
    void ampRef.current?.stopEffect("ending");
  }, [isContentVisible, selectedMinutes]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      appState.current = nextAppState;
      setAppStateVisible(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const syncBgmPlayback = async () => {
      const amp = ampRef.current;
      if (!amp) {
        return;
      }

      const shouldPlay = isContentVisible && isPlaying && !isBgmMute && appStateVisible === "active";

      if (shouldPlay) {
        await amp.playBgm();
      } else {
        await amp.pauseBgm();
      }
    };

    void syncBgmPlayback();
  }, [isContentVisible, isPlaying, isBgmMute, appStateVisible]);

  useEffect(() => {
    if (!isContentVisible || !isPlaying) {
      return;
    }

    if (duration === 0 || repeatCount > 0 || hasPlayedEndingRef.current || isEndingTriggeringRef.current) {
      return;
    }

    const remainingSeconds = duration - elapsedTime;
    if (remainingSeconds > 20 || remainingSeconds <= 0) {
      return;
    }

    const playEndingSound = async () => {
      const amp = ampRef.current;
      if (!amp) {
        return;
      }

      isEndingTriggeringRef.current = true;
      try {
        hasPlayedEndingRef.current = await amp.playEffect("ending", { restart: false });
      } catch (error) {
        hasPlayedEndingRef.current = false;
        console.error(error);
      } finally {
        isEndingTriggeringRef.current = false;
      }
    };

    void playEndingSound();
  }, [isContentVisible, isPlaying, duration, elapsedTime, repeatCount]);

  const handleAdjustElapsedTime = async (nextElapsedTime: number, newDuration?: number) => {
    const currentDuration = newDuration ?? duration;

    if (currentDuration === 0) {
      return;
    }

    const nextRepeatCount = Math.floor(nextElapsedTime / currentDuration);
    const remainElapsedTime = Math.floor(nextElapsedTime % currentDuration);

    setRepeatCount(nextRepeatCount);
    setElapsedTime(remainElapsedTime);
    setInitialRemainingTime(currentDuration - remainElapsedTime);
    setTimerKey(prev => prev + 1);
  };

  const handlePressPlay = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      setPausedTime(new Date().getTime());
      return;
    }

    setIsPlaying(true);

    const pauseDuration = new Date().getTime() - pausedTime;
    if (pauseDuration > 0) {
      // Timer component handles elapsed time sync using ASYNC_TIMER_KEY when app state changes.
    }
  };

  const calculateTotalElapsedSeconds = (currentElapsedTime: number) => {
    return Math.max(1, repeatCount * duration + Math.ceil(currentElapsedTime || 1));
  };

  const navigateToPrayerRecord = async (currentElapsedTime: number) => {
    if (!lecture_id) {
      Alert.alert("알림", "자유기도 강의 정보를 찾을 수 없습니다.", [
        {
          text: "확인",
          onPress: () => router.dismissTo("/plan"),
        },
      ]);
      return;
    }

    await AsyncStorage.removeItem(ASYNC_IS_PRAYING);

    if (ampRef.current) {
      await ampRef.current.pause();
      await ampRef.current.stopEffect("ending");
    }

    router.replace({
      pathname: "/prayerRecord",
      params: {
        lecture_id,
        duration: String(calculateTotalElapsedSeconds(currentElapsedTime)),
      },
    });
  };

  const handlePressLeftArrow = () => {
    Alert.alert("그만두시겠습니까?", "기도 기록 페이지로 넘어갑니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "그만두기",
        onPress: async () => {
          await navigateToPrayerRecord(elapsedTime);
        },
      },
    ]);
  };

  const handlePressMusic = () => {
    Alert.alert(isBgmMute ? "배경음악을 키겠습니까?" : "배경음악을 끄겠습니까?", "", [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        onPress: () => {
          setIsBgmMute(prev => !prev);
        },
      },
    ]);
  };

  const handleCompleteTimer = () => {
    setRepeatCount(prev => prev + 1);
    return { shouldRepeat: true };
  };

  const handlePressCompleteBtn = async (currentElapsedTime: number) => {
    await navigateToPrayerRecord(currentElapsedTime);
  };

  return (
    <View style={{ paddingTop: insets.top }}>
      {isIntroVisible && (
        <Animated.View style={[styles.intro, { opacity: introOpacity }]}>
          <RegularText style={styles.introText} fontSize={16} lineHeight={24}>
            그러므로 내가 너희에게 말하노니 무엇이든지 기도하고 구하는 것은 받은 줄로 믿으라 그리하면 너희에게 그대로 되리라
          </RegularText>
          <MediumText style={styles.introText} fontSize={12} lineHeight={22} textAlign="right" color="#B3B3B3">
            마가복음 11:24
          </MediumText>
        </Animated.View>
      )}

      {isContentVisible && (
        <Animated.View style={{ opacity: contentOpacity }}>
          <Header
            style={styles.header}
            prefix={
              <CustomButton
                testID="free-prayer-quit"
                style={{ width: "auto" }}
                onPress={handlePressLeftArrow}
              >
                <MediumText style={{ color: "#959FFF" }} fontSize={14}>
                  그만두기
                </MediumText>
              </CustomButton>
            }
            suffix={
              <Pressable hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }} onPress={handlePressMusic}>
                {isBgmMute ? <Mute /> : <Music />}
              </Pressable>
            }
          />

          {/* 텍스트 모드 탭이 있던 영역의 레이아웃 간격을 유지합니다. */}
          <View pointerEvents="none" style={styles.modeRemovedSpacer} />

          <View style={styles.timer}>
            <Timer
              key={timerKey}
              planTitle={plan_title || "자유 기도"}
              lectureTitle="자유 기도"
              repeatCount={repeatCount}
              duration={duration}
              initialRemainingTime={initialRemainingTime}
              isPlaying={isPlaying}
              appState={appStateVisible}
              onAdjustElapedTime={handleAdjustElapsedTime}
              setElapsedTime={setElapsedTime}
              onPressPlay={handlePressPlay}
              onComplete={handleCompleteTimer}
              onPressCompleteBtn={handlePressCompleteBtn}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(4),
  },
  introText: {
    width: moderateScale(295),
  },
  header: {
    marginBottom: moderateScale(8),
  },
  modeRemovedSpacer: {
    height: moderateScale(69),
  },
  timer: {
    marginTop: scaleHeight(48),
    alignItems: "center",
  },
});
