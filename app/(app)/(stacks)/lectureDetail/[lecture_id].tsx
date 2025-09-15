import Music from "@/assets/images/icon/music.svg";
import Mute from "@/assets/images/icon/mute.svg";
import Amp from "@/classes/Amp";
import CustomButton from "@/components/button/CustomButton";
import Header from "@/components/Header";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import Timer from "@/components/timer/Timer";
import { LectureType } from "@/utils/dataType";
import { useScreenTransition } from "@/utils/hooks/useScreenTransition";
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
  useKeepAwake();

  const insets = useSafeAreaInsets();

  const {
    plan_id
    , lecture_id
    , plan_title
    , isReconnect
  } = useLocalSearchParams<{
    plan_id: string,
    lecture_id: string,
    plan_title: string,
    isReconnect?: string
  }>();

  // Fetch lecture data
  const { data, isSuccess: isLectureSuccess } = useLectureQuery({ lecture_id });

  const lecture = data?.lecture || getDefaultLecture();
  const lectureAudios = data?.lectureAudios || [];

  const {
    isIntroVisible
    , isContentVisible
    , introOpacity
    , contentOpacity
  } = useScreenTransition({
    isDataLoaded: isLectureSuccess,
  });

  // Timer States
  const [timerKey, setTimerKey] = useState(0);
  const [repeatCount, setRepeatCount] = useState(0);
  const repeatCountRef = useRef(0);
  const [duration, setDuration] = useState(0);
  const [initialRemainingTime, setInitialRemainingTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const elapsedTimeRef = useRef(0);
  const [endTime, setEndTime] = useState(0);

  // Audio Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBgmMute, setIsBgmMute] = useState(false);

  const [amp, setAmp] = useState<Amp>();

  const [mode, setMode] = useState<"default" | "text">('default');

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime])

  useEffect(() => {
    repeatCountRef.current = repeatCount;
  }, [repeatCount])

  // Set initial duration and remaining time
  useEffect(() => {
    async function startLecture() {
      if (isLectureSuccess && isContentVisible) {

        if (lecture.bgm === '') {
          Alert.alert('알림!', '새로운 오디오 파일이 추가되었습니다. 파일을 다시 다운로드 해주세요.');
          await AsyncStorage.removeItem(`planAudit-${plan_id}`);
          router.dismissTo('/plan');
        }

        const isPraying = await AsyncStorage.getItem('isPraying');
        const duration = lecture.time === 0 ? 1 : (lecture.time * 60);

        setIsPlaying(true);
        setDuration(duration);
        setInitialRemainingTime(duration);

        if (!!isReconnect && !!isPraying) {
          // If already praying, set the elapsed time and repeat count
          const {
            repeatCount: savedRepeatCount
            , elapsedTime: savedElapsedTime
            , pauseTime: savedPauseTime
          } = JSON.parse(isPraying);

          let curTime = new Date().getTime() / 1000;
          let diffTime = curTime - Number(savedPauseTime);

          let totalElapsedTime = savedElapsedTime + diffTime + (savedRepeatCount * duration);

          await amp?.adjustVoiceBy(totalElapsedTime);
          handleAdjustElapsedTime(totalElapsedTime, duration);
        }
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

      // 3. 기도중이라는 상태를 AsyncStorage에 저장
      //    나중에 메인 화면에서 기도중인지 확인하기 위함
      await AsyncStorage.setItem('isPraying', JSON.stringify({
        plan_id: plan_id,
        plan_title: plan_title,
        lecture_id: lecture_id,
        lecture_title: lecture.title,
        repeatCount: repeatCountRef.current,
        elapsedTime: elapsedTimeRef.current,
        pauseTime: new Date().getTime() / 1000,
      }))
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

  const handleAdjustElapsedTime = async (elapsedTime: number, newDuration?: number) => {
    const currentDuration = newDuration ?? duration;

    if (currentDuration === 0) {
      return; // 0으로 나누는 오류 방지
    }

    let newRepeatCount = Math.floor(elapsedTime / currentDuration);
    let newElapsedTime = Math.floor(elapsedTime % currentDuration);

    setRepeatCount(newRepeatCount);
    setElapsedTime(newElapsedTime);
    setInitialRemainingTime(currentDuration - newElapsedTime);

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

  const handlePressLeftArrow = () => {
    Alert.alert(
      '그만두시겠습니까?', // title
      '기도 기록 페이지로 넘어갑니다.', // message
      [                     // buttons
        { text: '취소', style: 'cancel' },
        { text: '그만두기', onPress: () => handlePressCompleteBtn(elapsedTime) }
      ]
    )
  }

  const handlePressMusic = () => {
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

  const handlePressTab = (mode: "default" | "text") => {
    setMode(mode);
  }

  // Timer event handlers
  const handleCompleteTimer = () => {
    setRepeatCount(repeatCount + 1);
    return { shouldRepeat: true }
  }

  /**
   * Timer의 Play or Pause 버튼을 누를 시 실행되는 함수
   */
  const handlePressPlay = async () => {
    if (isPlaying) {
      // stop audio
      await pauseAll();
    } else {
      // play audio
      await resumeAll();
    }
  }

  const handlePressCompleteBtn = async (elapsedTime: number) => {
    await AsyncStorage.removeItem('isPraying');
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
              <CustomButton style={{
                width: "auto"
              }} onPress={handlePressLeftArrow}>
                <MediumText style={{
                  color: "#959FFF"
                }} fontSize={14}>
                  그만두기
                </MediumText>
              </CustomButton>
            }
            suffix={
              <Pressable
                hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
                onPress={handlePressMusic}
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
            <TouchableOpacity onPress={() => handlePressTab('default')}>
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
                <TouchableOpacity onPress={() => handlePressTab('text')}>
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
              onAdjustElapedTime={handleAdjustElapsedTime}
              setElapsedTime={setElapsedTime}
              onPressPlay={handlePressPlay}
              onComplete={handleCompleteTimer}
              onPressCompleteBtn={handlePressCompleteBtn}
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