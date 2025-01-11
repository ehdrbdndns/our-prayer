import Delete from "@/assets/images/icon/delete.svg";
import Music from "@/assets/images/icon/music.svg";
import Mute from "@/assets/images/icon/mute.svg";
import SoundBox from "@/components/\bSoundBox";
import Header from "@/components/Header";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import Timer from "@/components/timer/Timer";
import { LectureType } from "@/utils/dataType";
import { useLectureQuery } from "@/utils/queries";
import { moderateScale, scaleHeight } from "@/utils/style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  useKeepAwake();

  const insets = useSafeAreaInsets();

  const { plan_id, lecture_id, plan_title } = useLocalSearchParams<{
    plan_id: string,
    lecture_id: string,
    plan_title: string
  }>();

  // Fetch lecture data
  const { data, isSuccess: isLectureSuccess } = useLectureQuery({ lecture_id });

  if (isLectureSuccess && data === undefined) {
    return <Redirect href="/plan" />
  }

  const lecture = data?.lecture || getDefaultLecture();
  const lectureAudios = data?.lectureAudios || [];

  const [isShowedIntro, setIsShowedIntro] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const introOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  const [timerKey, setTimerKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMute, setIsMute] = useState(false);
  const [isBgmMute, setIsBgmMute] = useState(false);
  const [repeatCount, setRepeatCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [initialRemainingTime, setInitialRemainingTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [userAdjustedTime, setUserAdjustedTime] = useState(0);

  const [mode, setMode] = useState<"default" | "text">('default');

  // Show intro when component is mounted
  useEffect(() => {
    setTimeout(async () => {
      setShowIntro(true);
      Animated.timing(introOpacity, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }).start(() => setIsShowedIntro(true));
    }, 500);
  }, []);

  // Hide intro and show content after lecture data is loaded
  useEffect(() => {
    async function hideIntro() {
      if (isLectureSuccess && isShowedIntro) {

        if (lecture.bgm === '') {
          Alert.alert('오류', '파일을 다시 다운로드 해주세요.');
          await AsyncStorage.removeItem(`planAudit-${plan_id}`);
          router.replace('/plan');
        }

        Animated.timing(introOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          const time = lecture.time === 0 ? 1 : (lecture.time * 60);
          setShowIntro(false);
          setShowContent(true);
          setIsPlaying(true);
          setDuration(time);
          setInitialRemainingTime(time);
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }).start();
        });
      }
    }

    hideIntro();
  }, [isLectureSuccess, isShowedIntro]);

  useEffect(() => {
    setUserAdjustedTime(initialRemainingTime);
  }, [initialRemainingTime])

  useEffect(() => {
    setIsMute(!isPlaying);
  }, [isPlaying])

  const onPressLeftArrow = () => {
    Alert.alert(
      '그만두시겠습니까?', // title
      '기도 기록이 저장되지 않습니다.', // message
      [                     // buttons
        { text: '취소', style: 'cancel' },
        { text: '그만두기', onPress: () => router.back() }
      ]
    )
  }

  const onPressMusic = () => {
    setIsBgmMute(!isBgmMute);
  }

  const onPressTab = (mode: "default" | "text") => {
    setMode(mode);
  }

  // Timer event handlers
  const onCompleteTimer = () => {
    setRepeatCount(repeatCount + 1);
    return { shouldRepeat: true }
  }

  const onPressPlay = () => {
    setIsPlaying(!isPlaying);
  }

  const onPressPrev = (remainingTime: number) => {
    setInitialRemainingTime(Math.min(remainingTime + 10, duration)); // Subtract 10 seconds, but not below 0
    setTimerKey(timerKey + 1);
  }

  const onPressNext = (remainingTime: number) => {
    setInitialRemainingTime(Math.max(remainingTime - 10, 0)); // Add 10 seconds
    setTimerKey(timerKey + 1);
  }

  const onPressCompleteBtn = (elapsedTime: number) => {
    router.replace({
      pathname: '/prayerRecord',
      params: {
        lecture_id: lecture.lecture_id,
        duration: (repeatCount * duration) + Math.ceil(elapsedTime ? elapsedTime : 1)
      }
    });
  }

  return (
    <View style={{ paddingTop: insets.top }}>
      <SoundBox
        plan_id={plan_id}
        bgm={lecture.bgm}
        audios={lectureAudios}
        isBgmMute={isBgmMute}
        isMute={isMute}
        isPlaying={isPlaying}
        repeatCount={repeatCount}
        elapsedTime={elapsedTime}
        userAdjustedTime={userAdjustedTime}
      />

      {/* Intro */}
      {showIntro && (
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
      {showContent && (
        <Animated.View style={{ opacity: contentOpacity }}>
          <Header
            style={styles.header}
            prefix={
              <Pressable onPress={onPressLeftArrow}>
                <Delete />
              </Pressable>
            }
            suffix={
              <Pressable onPress={onPressMusic}>
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
                  lineHeight={15}
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
                      lineHeight={15}
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
                  lectureAudios.map((row) => row.caption).join('\n\n')
                }
              </BoldText>
            </ScrollView>
          </View>
          <LinearGradient
            style={[styles.textFilter, mode === 'default' && styles.hidden]}
            start={{ x: 0.5, y: 0 }}
            colors={['transparent', 'rgba(43, 47, 58, 1)']}
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