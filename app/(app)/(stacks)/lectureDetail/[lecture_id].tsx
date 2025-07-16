import Delete from "@/assets/images/icon/delete.svg";
import Music from "@/assets/images/icon/music.svg";
import Mute from "@/assets/images/icon/mute.svg";
import Amp from "@/classes/Amp";
import Header from "@/components/Header";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import Timer from "@/components/timer/Timer";
import { LectureType } from "@/utils/dataType";
import { useScreenTransition } from "@/utils/hooks/useScreenTransition";
import { KEEP_AWAKE_TAG } from "@/utils/keepAwake";
import { useLectureQuery } from "@/utils/queries";
import { moderateScale, scaleHeight } from "@/utils/style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, AppState, NativeEventSubscription, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Intro duration in seconds
const DEFAULT_DURATION = 60;

const getDefaultLecture = (): LectureType => ({
  lecture_id: '',
  plan_id: '',
  title: '',
  description: '',
  time: DEFAULT_DURATION,
  bgm: '',
  is_active: false,
  updated_date: 0,
  created_date: 0,
})

export default function Lecture() {
  // Keep screen awake while the component is mounted
  useKeepAwake(KEEP_AWAKE_TAG);

  const insets = useSafeAreaInsets();

  const { plan_id, lecture_id, plan_title } = useLocalSearchParams<{
    plan_id: string,
    lecture_id: string,
    plan_title: string
  }>();

  // Fetch lecture data
  const { data, isSuccess: isLectureSuccess } = useLectureQuery({ lecture_id });

  const lecture = data?.lecture || getDefaultLecture();
  const lectureAudios = data?.lectureAudios || [];

  const { isIntroVisible, isContentVisible, introOpacity, contentOpacity } = useScreenTransition({
    isDataLoaded: isLectureSuccess,
  });

  const [timerKey, setTimerKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBgmMute, setIsBgmMute] = useState(false);
  const [repeatCount, setRepeatCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [initialRemainingTime, setInitialRemainingTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const elapsedTimeRef = useRef(0);

  const [amp, setAmp] = useState<Amp>();

  const [mode, setMode] = useState<"default" | "text">('default');

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime])

  // Hide intro and show content after lecture data is loaded
  useEffect(() => {
    async function startLecture() {
      if (isLectureSuccess && isContentVisible) {

        if (lecture.bgm === '') {
          Alert.alert('알림!', '새로운 오디오 파일이 추가되었습니다. 파일을 다시 다운로드 해주세요.');
          await AsyncStorage.removeItem(`planAudit-${plan_id}`);
          router.dismissTo('/plan');
        }

        const time = lecture.time === 0 ? 1 : (lecture.time * 60);
        setIsPlaying(true);
        setDuration(time);
        setInitialRemainingTime(time);
      }
    }

    startLecture();
  }, [isLectureSuccess, isContentVisible]);

  // Set Amp instance when lecture data is loaded
  useEffect(() => {
    if (isLectureSuccess && !!data?.lectureAudios) {
      setAmp(new Amp(lecture_id, data.lectureAudios, { isPlaying: true }));
    }
  }, [isLectureSuccess]);

  // Turn on amp
  useEffect(() => {
    async function changeToBackground() {
      // 1. 타이머 정지
      setIsPlaying(false);

      // 2. Amp 모드 전환
      if (!!amp) {
        await amp.changeToBackgroundState(elapsedTimeRef.current);
      }
    }

    async function changeToForeground() {
      // 1. 타이머 재개
      setIsPlaying(true);

      // 2. Amp 모드 전환
      if (!!amp) {
        amp.changeToForgroundState();
      }
    }

    async function turnOffAmp() {
      if (!amp) return;
      await amp.turnOff();
    }

    async function turnOnAmp() {
      if (!amp) return;

      const isAmpTurnedOn = await amp.turnOn();

      if (!isAmpTurnedOn) {
        Alert.alert('알림!', '오디오 파일을 다시 다운로드 해주세요.', [
          {
            text: '확인',
            onPress: async () => {
              await AsyncStorage.removeItem(`planAudit-${plan_id}`);
              router.dismissTo('/plan');
            }
          }
        ]);
      }

      await amp.playBgm();
    }

    let subscription: NativeEventSubscription | null = null;
    if (!!amp) {
      turnOnAmp();
      subscription = AppState.addEventListener('change', nextAppState => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // come to forground
          changeToForeground();
        } else if (
          appState.current === 'active'
          && nextAppState.match(/inactive|background/)
        ) {
          // go to bacgkround
          changeToBackground();
        }

        appState.current = nextAppState;
        setAppStateVisible(appState.current);
      });
    }

    return () => {
      if (!!subscription) {
        subscription.remove();
      }
      turnOffAmp();
    };
  }, [amp])

  useEffect(() => {
    async function playVoice() {
      if (repeatCount === 0 && amp) {
        await amp.playVoiceBy(elapsedTime);
      }
    }

    playVoice();
  }, [elapsedTime])

  const onAdjustElapedTime = async (elapsedTime: number) => {
    let newRepeatCount = Math.floor(elapsedTime / duration);
    let newElapsedTime = Math.floor(elapsedTime % duration);

    setRepeatCount(newRepeatCount);
    setElapsedTime(newElapsedTime);
    setInitialRemainingTime(duration - newElapsedTime);

    // 타이머 렌더링을 위한 작업
    setTimerKey(timerKey + 1);
  }

  const pauseAll = async () => {
    if (!amp) return;
    await amp.pause();
    setIsPlaying(false);
  }

  const resumeAll = async () => {
    if (!amp) return;
    await amp.resumeAudio();
    setIsPlaying(true);
  }

  const onPressLeftArrow = () => {
    Alert.alert(
      '그만두시겠습니까?', // title
      '기도 기록 페이지로 넘어갑니다.', // message
      [                     // buttons
        { text: '취소', style: 'cancel' },
        { text: '그만두기', onPress: () => onPressCompleteBtn(elapsedTime) }
      ]
    )
  }

  const onPressMusic = () => {
    Alert.alert(
      isBgmMute ? '배경음악을 키겠습니까?' : '배경음악을 끄겠습니까?', // title
      '', // message
      [ // buttons
        { text: '취소', style: 'cancel' },
        {
          text: '확인', onPress: async () => {
            if (isBgmMute) {
              await amp?.playBgm();
            } else {
              await amp?.pauseBgm();
            }
            setIsBgmMute(!isBgmMute);
          }
        }
      ]
    )
  }

  const onPressTab = (mode: "default" | "text") => {
    setMode(mode);
  }

  // Timer event handlers
  const onCompleteTimer = () => {
    setRepeatCount(repeatCount + 1);
    return { shouldRepeat: true }
  }

  /**
   * Timer의 Play or Pause 버튼을 누를 시 실행되는 함수
   */
  const onPressPlay = async () => {
    if (isPlaying) {
      // stop audio
      await pauseAll();
    } else {
      // play audio
      await resumeAll();
    }
  }

  const onPressPrev = async (remainingTime: number) => {
    // 10초 더하기, 단 duration(총 타이머 수)을 넘지 않도록
    const newInitialRemainingTime = Math.min(remainingTime + 10, duration)
    setInitialRemainingTime(newInitialRemainingTime);

    if (repeatCount === 0 && amp) {
      await amp.adjustVoiceBy(Math.max(elapsedTime - 10, 0));
    }

    // 타이머 렌더링을 위한 작업
    setTimerKey(timerKey + 1);
  }

  const onPressNext = async (remainingTime: number) => {
    // 10초 빼기, 단 0보다 작아지지 않도록
    const newInitialRemainingTime = Math.max(remainingTime - 10, 0);
    setInitialRemainingTime(newInitialRemainingTime);

    if (repeatCount === 0 && amp) {
      await amp.adjustVoiceBy(Math.min(elapsedTime + 10, duration));
    }

    // 타이머 렌더링을 위한 작업
    setTimerKey(timerKey + 1);
  }

  const onPressCompleteBtn = async (elapsedTime: number) => {
    router.replace({
      pathname: '/prayerRecord',
      params: {
        lecture_id: lecture.lecture_id,
        duration: (repeatCount * duration) + Math.ceil(elapsedTime ? elapsedTime : 1)
      }
    });
  }

  if (isLectureSuccess && data === undefined) {
    return <Redirect href="/plan" />
  }

  return (
    <View style={{ paddingTop: insets.top }}>
      {/* Intro */}
      {isIntroVisible && (
        <Animated.View style={[styles.intro, { opacity: introOpacity }]}>
          <RegularText
            style={styles.introText}
            fontSize={16}
            lineHeight={24}
          >
            그러므로 내가 너희에게 말하노니 무엇이든지 기도하고 구하는 것은 받은 줄로 믿으라 그리하면 너희에게 그대로 되리라
          </RegularText>
          <MediumText
            style={styles.introText}
            fontSize={12}
            lineHeight={22}
            textAlign="right"
            color="#B3B3B3"
          >
            마가복음 11:24
          </MediumText>
        </Animated.View>
      )}

      {/* Content */}
      {isContentVisible && (
        <Animated.View style={{ opacity: contentOpacity }}>
          <Header
            style={styles.header}
            prefix={
              <Pressable
                onPress={onPressLeftArrow}
                hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
              >
                <Delete />
              </Pressable>
            }
            suffix={
              <Pressable
                hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
                onPress={onPressMusic}
              >
                {
                  isBgmMute
                    ? <Mute />
                    : <Music />
                }
              </Pressable>
            }
          />

          {/* Tabs */}
          <View style={styles.tabList}>
            <TouchableOpacity onPress={() => onPressTab('default')}>
              <View style={[styles.tab, mode === 'default' && styles.activeTab]}>
                <RegularText
                  fontSize={14}
                  lineHeight={21}
                  color={mode === 'default' ? 'white' : 'rgba(255, 255, 255, 0.8)'}
                >
                  기본 모드
                </RegularText>
              </View>
            </TouchableOpacity>
            {
              lectureAudios.length > 0 && (
                <TouchableOpacity onPress={() => onPressTab('text')}>
                  <View style={[styles.tab, mode === 'text' && styles.activeTab]}>
                    <RegularText
                      fontSize={14}
                      lineHeight={21}
                      color={mode === 'text' ? 'white' : 'rgba(255, 255, 255, 0.8)'}
                    >
                      텍스트 모드
                    </RegularText>
                  </View>
                </TouchableOpacity>
              )
            }
          </View>

          {/* Text */}
          <View style={[styles.textContainer, mode === 'default' && styles.hidden]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContainer}
            >
              <BoldText
                fontSize={24}
                lineHeight={40}
                color="rgba(255, 255, 255, 0.8)"
                textAlign="left"
              >
                {
                  lectureAudios.sort((a, b) => a.start_time - b.start_time).map((row) => row.caption).join('\n\n')
                }
              </BoldText>
            </ScrollView>
          </View>
          <LinearGradient
            style={[styles.textFilter, mode === 'default' && styles.hidden]}
            start={{ x: 0.5, y: 0 }}
            colors={['transparent', 'rgba(43, 47, 58, 1)']}
            pointerEvents="none"
          />

          {/* Timer */}
          <View style={[styles.timer, mode === 'text' && styles.hidden]}>
            <Timer
              key={timerKey}
              planTitle={plan_title}
              lectureTitle={lecture.title}
              repeatCount={repeatCount}
              duration={duration}
              initialRemainingTime={initialRemainingTime}
              isPlaying={isPlaying}
              appState={appStateVisible}
              onAdjustElapedTime={onAdjustElapedTime}
              setElapsedTime={setElapsedTime}
              onPressNext={onPressNext}
              onPressPlay={onPressPlay}
              onPressPrev={onPressPrev}
              onComplete={onCompleteTimer}
              onPressCompleteBtn={onPressCompleteBtn}
            />
          </View>
        </Animated.View>
      )
      }
    </View >
  );
}

const styles = StyleSheet.create({
  intro: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(4)
  },
  introText: {
    width: moderateScale(295)
  },
  header: {
    marginBottom: moderateScale(8),
  },
  tabList: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: moderateScale(24),
  },
  tab: {
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(14),
  },
  activeTab: {
    borderRadius: moderateScale(100),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  hidden: {
    display: 'none',
  },
  scrollViewContainer: {
    paddingBottom: scaleHeight(120),
  },
  textContainer: {
    width: '100%',
    height: scaleHeight(660),
    paddingHorizontal: moderateScale(24),
  },
  textFilter: {
    position: 'absolute',
    bottom: -scaleHeight(30),
    left: 0,
    right: 0,
    height: scaleHeight(260), // Adjust height as needed
  },
  timer: {
    marginTop: scaleHeight(48),
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
    width: moderateScale(180),
    marginTop: moderateScale(64),
    paddingHorizontal: moderateScale(30),
  }
});