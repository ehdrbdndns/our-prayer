import Delete from "@/assets/images/icon/delete.svg";
import Music from "@/assets/images/icon/music.svg";
import Mute from "@/assets/images/icon/mute.svg";
import Header from "@/components/Header";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import Timer from "@/components/timer/Timer";
import { moderateScale, scaleHeight } from "@/utils/style";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Intro duration in seconds
const DEFAULT_DURATION = 60;

export default function Prayer() {
  const insets = useSafeAreaInsets();

  const [showIntro, setShowIntro] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const introOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  const [timerKey, setTimerKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMute, setIsMute] = useState(false);
  const [repeatCount, setRepeatCount] = useState(0);
  const [duration, setDuration] = useState(DEFAULT_DURATION); // Duration in seconds
  const [initialRemainingTime, setInitialRemainingTime] = useState(DEFAULT_DURATION); // Initial remaining time

  const [mode, setMode] = useState<"default" | "text">('default');

  useEffect(() => {
    // Show intro after 0.5 seconds, and hide it after 3 seconds
    setTimeout(() => {
      setShowIntro(true);
      Animated.timing(introOpacity, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }).start(() => {
        // Hide intro and show content after 1 second
        Animated.timing(introOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          setShowIntro(false);
          setShowContent(true);
          setIsPlaying(true);
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }).start();
        });
      });
    }, 500);
  }, []);

  const onPressDelete = () => {
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
    setIsMute(!isMute);
  }

  const onPressTab = (mode: "default" | "text") => {
    setMode(mode);

  }
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

  return (
    <View style={{ paddingTop: insets.top }}>
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
              <Pressable onPress={onPressDelete}>
                <Delete />
              </Pressable>
            }
            suffix={
              <Pressable onPress={onPressMusic}>
                {
                  isMute
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
                {"사랑하는 하나님, 이 시간 저를 당신의 품으로 초대해 주셔서 감사합니다. 제 마음을 정돈하고, 당신과의 깊은 교제를 위해 준비합니다. 제가 가진 모든 걱정과 불안을 내려놓고, 오직 당신께 집중할 수 있도록 도와주세요.\n주님, 오늘 제가 기도하는 이 순간, 저의 마음 속 깊은 곳에 있는 소원과 갈망을 당신께 올립니다. 제가 사랑하는 이들을 위해 기도합니다. 그들에게 필요한 힘과 위로를 주시고, 당신의 사랑이 그들의 삶을 가득 채우게 하여 주세요. 하나님, 저의 삶의 방향과 선택을 인도해 주시기를 간구합니다. 제가 걸어가는 길에서 당신의 뜻을 발견하고, 그 길을 따르게 하여 주세요. 매일의 삶 속에서 당신의 은혜를 느낄 수 있도록 해주시고, 모든 순간에 감사하는 마음을 갖게 하여 주세요. 주님, 지금 이 순간, 세상의 고통과 아픔을 위해 기도합니다. 힘든 상황에 처한 이들에게 위로와 소망을 주시고, 당신의 사랑이 그들에게 전해지기를 간구합니다. 우리가 서로를 사랑하고 도우며 살아갈 수 있도록 인도해 주세요. 하나님, 당신의 말씀과 진리로 저를 가르쳐 주세요. 기도를 통해 제 영혼이 새롭게 되고, 당신과의 관계가 더욱 깊어지기를 소망합니다. 기도의 시간이 저에게 힘과 평화를 주는 시간이 되게 하여 주세요. 이제 제가 드리는 모든 기도를 당신의 뜻에 맡깁니다. 제가 기도하는 이 순간, 당신의 사랑이 저를 감싸고, 당신의 은혜가 제 삶을 인도하기를 바랍니다. 감사합니다, 주님. 아멘."}
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
              repeatCount={repeatCount}
              duration={DEFAULT_DURATION}
              initialRemainingTime={initialRemainingTime}
              isPlaying={isPlaying}
              onPressNext={onPressNext}
              onPressPlay={onPressPlay}
              onPressPrev={onPressPrev}
              onComplete={onCompleteTimer}
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