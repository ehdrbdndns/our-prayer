import Music from "@/assets/images/icon/music.svg";
import Mute from "@/assets/images/icon/mute.svg";
import Amp from "@/classes/Amp";
import CustomButton from "@/components/button/CustomButton";
import Header from "@/components/Header";
import PrayerTopicChecklist from "@/components/prayer/PrayerTopicChecklist";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import Timer from "@/components/timer/Timer";
import { ASYNC_IS_PRAYING, AsyncIsPrayingType } from "@/storage/asyncStorageKeys";
import { getE2EDurationSeconds } from "@/utils/e2e";
import { useScreenTransition } from "@/utils/hooks/useScreenTransition";
import { moderateScale, scaleHeight } from "@/utils/style";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useKeepAwake } from "expo-keep-awake";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, AppState, AppStateStatus, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FREE_PRAYER_LECTURE_TITLE = "자유 기도";
const FREE_PRAYER_ENTRY_PATH = "/freePrayer" as const;

const isFiniteNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

const isAsyncIsPrayingType = (value: unknown): value is AsyncIsPrayingType => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.plan_id === "string" &&
    typeof row.plan_title === "string" &&
    typeof row.lecture_id === "string" &&
    typeof row.lecture_title === "string" &&
    isFiniteNumber(row.repeatCount) &&
    isFiniteNumber(row.endTime) &&
    (row.entryPath === undefined || row.entryPath === "/lectureDetail/[lecture_id]" || row.entryPath === "/freePrayer") &&
    (row.prayer_minutes === undefined || isFiniteNumber(row.prayer_minutes))
  );
};

const calculateElapsedTimeFromSavedState = (
  savedRepeatCount: number,
  savedEndTime: number,
  prayerDurationSeconds: number
) => {
  const currentTime = Date.now();
  const timeOffsetFromEnd = currentTime - savedEndTime;
  const prayerDurationMillis = prayerDurationSeconds * 1000;

  return timeOffsetFromEnd + (savedRepeatCount + 1) * prayerDurationMillis;
};

export default function FreePrayerPage() {
  useKeepAwake();

  const insets = useSafeAreaInsets();
  const {
    plan_id,
    lecture_id,
    plan_title,
    prayer_minutes,
    isReconnect,
  } = useLocalSearchParams<{
    plan_id?: string;
    lecture_id?: string;
    plan_title?: string;
    prayer_minutes?: string;
    isReconnect?: string;
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
  const [mode, setMode] = useState<"timer" | "topic">("timer");

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const repeatCountRef = useRef(0);
  const elapsedTimeRef = useRef(0);
  const durationRef = useRef(0);
  const isPlayingRef = useRef(false);
  const endTimeRef = useRef(0);
  const wasPlayingBeforeBackgroundRef = useRef(false);

  const hasPlayedEndingRef = useRef(false);
  const isEndingTriggeringRef = useRef(false);
  const ampRef = useRef<Amp | null>(null);

  useEffect(() => {
    repeatCountRef.current = repeatCount;
  }, [repeatCount]);

  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const startNewTimer = (prayerDurationSeconds: number) => {
    const currentTime = Date.now();

    setIsPlaying(true);
    setDuration(prayerDurationSeconds);
    setInitialRemainingTime(prayerDurationSeconds);
    setElapsedTime(0);
    setRepeatCount(0);
    setPausedTime(0);
    endTimeRef.current = currentTime + prayerDurationSeconds * 1000;
    setTimerKey(prev => prev + 1);
  };

  const handleAdjustElapsedTime = async (nextElapsedTime: number, newDuration?: number) => {
    const currentDuration = newDuration ?? durationRef.current;

    if (currentDuration === 0) {
      return;
    }

    const nextRepeatCount = Math.floor(nextElapsedTime / currentDuration);
    const remainElapsedTime = Math.floor(nextElapsedTime % currentDuration);

    setRepeatCount(nextRepeatCount);
    setElapsedTime(remainElapsedTime);
    setInitialRemainingTime(currentDuration - remainElapsedTime);
    endTimeRef.current = Date.now() + (currentDuration - remainElapsedTime) * 1000;
    setTimerKey(prev => prev + 1);
  };

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
        return;
      }

      await amp.pauseBgm();
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

    let cancelled = false;

    const startPrayer = async () => {
      const prayerDurationSeconds = getE2EDurationSeconds(selectedMinutes * 60);

      hasPlayedEndingRef.current = false;
      isEndingTriggeringRef.current = false;
      void ampRef.current?.stopEffect("ending");

      if (isReconnect !== "true") {
        startNewTimer(prayerDurationSeconds);
        return;
      }

      const storedPrayingState = await AsyncStorage.getItem(ASYNC_IS_PRAYING);
      if (!storedPrayingState) {
        startNewTimer(prayerDurationSeconds);
        return;
      }

      try {
        const parsedState: unknown = JSON.parse(storedPrayingState);
        if (!isAsyncIsPrayingType(parsedState)) {
          await AsyncStorage.removeItem(ASYNC_IS_PRAYING);
          startNewTimer(prayerDurationSeconds);
          return;
        }

        const isFreePrayerState =
          parsedState.entryPath === FREE_PRAYER_ENTRY_PATH || parsedState.prayer_minutes !== undefined;

        if (!isFreePrayerState) {
          await AsyncStorage.removeItem(ASYNC_IS_PRAYING);
          startNewTimer(prayerDurationSeconds);
          return;
        }

        if (lecture_id && parsedState.lecture_id !== lecture_id) {
          await AsyncStorage.removeItem(ASYNC_IS_PRAYING);
          startNewTimer(prayerDurationSeconds);
          return;
        }

        const restoredMinutes = parsedState.prayer_minutes ?? selectedMinutes;
        const restoredDurationSeconds = getE2EDurationSeconds(restoredMinutes * 60);

        if (cancelled) {
          return;
        }

        setIsPlaying(true);
        setDuration(restoredDurationSeconds);
        setInitialRemainingTime(restoredDurationSeconds);
        endTimeRef.current = parsedState.endTime;

        const totalElapsedTimeInMillis = calculateElapsedTimeFromSavedState(
          parsedState.repeatCount,
          parsedState.endTime,
          restoredDurationSeconds
        );

        await handleAdjustElapsedTime(totalElapsedTimeInMillis / 1000, restoredDurationSeconds);
        await AsyncStorage.removeItem(ASYNC_IS_PRAYING);
      } catch {
        await AsyncStorage.removeItem(ASYNC_IS_PRAYING);
        startNewTimer(prayerDurationSeconds);
      }
    };

    void startPrayer();

    return () => {
      cancelled = true;
    };
  }, [isContentVisible, selectedMinutes, isReconnect, lecture_id]);

  useEffect(() => {
    const savePrayingState = async () => {
      if (!lecture_id || !isContentVisible) {
        return;
      }

      const currentDuration = durationRef.current;
      if (currentDuration === 0) {
        return;
      }

      if (endTimeRef.current === 0) {
        endTimeRef.current = Date.now() + Math.max(0, currentDuration - elapsedTimeRef.current) * 1000;
      }

      const prayingState: AsyncIsPrayingType = {
        plan_id: plan_id || "",
        plan_title: plan_title || FREE_PRAYER_LECTURE_TITLE,
        lecture_id,
        lecture_title: FREE_PRAYER_LECTURE_TITLE,
        repeatCount: repeatCountRef.current,
        endTime: endTimeRef.current,
        entryPath: FREE_PRAYER_ENTRY_PATH,
        prayer_minutes: selectedMinutes,
      };

      await AsyncStorage.setItem(ASYNC_IS_PRAYING, JSON.stringify(prayingState));
    };

    const changeToBackground = async () => {
      wasPlayingBeforeBackgroundRef.current = isPlayingRef.current;
      setIsPlaying(false);
      await savePrayingState();
    };

    const changeToForeground = async () => {
      setIsPlaying(wasPlayingBeforeBackgroundRef.current);
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        void changeToForeground();
      } else if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        void changeToBackground();
      }

      appState.current = nextAppState;
      setAppStateVisible(nextAppState);
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isContentVisible, lecture_id, plan_id, plan_title, selectedMinutes]);

  useEffect(() => {
    const syncBgmPlayback = async () => {
      const amp = ampRef.current;
      if (!amp) {
        return;
      }

      const shouldPlayWhileBackground = appStateVisible !== "active" && wasPlayingBeforeBackgroundRef.current;
      const shouldPlay = isContentVisible && !isBgmMute && (isPlaying || shouldPlayWhileBackground);

      if (shouldPlay) {
        await amp.playBgm();
      } else {
        await amp.pauseBgm();
      }
    };

    void syncBgmPlayback();
  }, [appStateVisible, isBgmMute, isContentVisible, isPlaying]);

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
        hasPlayedEndingRef.current = await amp.playEffect("ending", {
          restart: false,
          bgmVolumeWhilePlaying: 0.5,
        });
      } catch (error) {
        hasPlayedEndingRef.current = false;
        console.error(error);
      } finally {
        isEndingTriggeringRef.current = false;
      }
    };

    void playEndingSound();
  }, [isContentVisible, isPlaying, duration, elapsedTime, repeatCount]);

  const handlePressPlay = async () => {
    if (isPlaying) {
      await ampRef.current?.pause();
      setIsPlaying(false);
      setPausedTime(Date.now());
      return;
    }

    await ampRef.current?.resumeAudio();
    setIsPlaying(true);

    const pauseDuration = Date.now() - pausedTime;
    if (pauseDuration > 0 && endTimeRef.current > 0) {
      endTimeRef.current += pauseDuration;
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

  const handlePressTab = (nextMode: "timer" | "topic") => {
    setMode(nextMode);
  };

  const handleCompleteTimer = () => {
    const currentDuration = durationRef.current;

    if (currentDuration > 0) {
      if (endTimeRef.current === 0) {
        endTimeRef.current = Date.now() + currentDuration * 1000;
      } else {
        endTimeRef.current += currentDuration * 1000;
      }
    }

    setRepeatCount(prev => prev + 1);
    return { shouldRepeat: true };
  };

  const handlePressCompleteBtn = async (currentElapsedTime: number) => {
    await navigateToPrayerRecord(currentElapsedTime);
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
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
        <Animated.View style={[styles.content, { opacity: contentOpacity }]}> 
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

          <View style={styles.tabList}>
            <TouchableOpacity onPress={() => handlePressTab("timer")} testID="free-prayer-tab-timer">
              <View style={[styles.tab, mode === "timer" && styles.activeTab]}>
                <RegularText
                  fontSize={14}
                  lineHeight={21}
                  color={mode === "timer" ? "#FFFFFF" : "rgba(255, 255, 255, 0.8)"}
                >
                  타이머
                </RegularText>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePressTab("topic")} testID="free-prayer-tab-topic">
              <View style={[styles.tab, mode === "topic" && styles.activeTab]}>
                <RegularText
                  fontSize={14}
                  lineHeight={21}
                  color={mode === "topic" ? "#FFFFFF" : "rgba(255, 255, 255, 0.8)"}
                >
                  기도 제목
                </RegularText>
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={[styles.timer, mode !== "timer" && styles.timerHidden]}
            pointerEvents={mode === "timer" ? "auto" : "none"}
          >
            <Timer
              key={timerKey}
              planTitle={plan_title || FREE_PRAYER_LECTURE_TITLE}
              lectureTitle={FREE_PRAYER_LECTURE_TITLE}
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

          {mode === "topic" && <PrayerTopicChecklist style={styles.topicChecklist} />}
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
  content: {
    flex: 1,
  },
  tabList: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: moderateScale(24),
  },
  tab: {
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(14),
  },
  activeTab: {
    borderRadius: moderateScale(100),
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  timer: {
    marginTop: scaleHeight(48),
    alignItems: "center",
  },
  timerHidden: {
    height: 0,
    marginTop: 0,
    opacity: 0,
    overflow: "hidden",
  },
  topicChecklist: {
    flex: 1,
    paddingTop: moderateScale(8),
  },
});
