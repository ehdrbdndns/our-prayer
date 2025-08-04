import CheckedCircle from '@/assets/images/icon/checkedCircle.svg';
import LeftArrow from "@/assets/images/icon/leftArrow.svg";
import Play from '@/assets/images/icon/play.svg';
import UnChckedCircle from '@/assets/images/icon/unCheckedCircle.svg';
import PrimaryButton from '@/components/button/PrimaryButton';
import Header from "@/components/Header";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import { usePlanQuery } from '@/utils/queries';
import { moderateScale, scaleHeight } from "@/utils/style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageBackground } from "expo-image";
import { Href, router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PlanDetailPage() {
  const insets = useSafeAreaInsets();

  const {
    plan_id, title, banner, backToLink,
    isLiked: isLikedFromParam,
  } = useLocalSearchParams<{
    plan_id: string,
    title: string,
    banner: string,
    isLiked: string
    backToLink?: string
  }>();

  const { data, isSuccess: isPlanSuccess } = usePlanQuery({ plan_id });

  // [lecture_id]: count
  const [lectureHistoryDict, setLectureHistoryDict] = useState<{ [lecture_id: string]: number }>({});

  const plan = data?.plan;
  const lectures = (data?.lectures || []).sort((a, b) => a.created_date - b.created_date);

  const [prevScrollY, setPrevScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  const buttonOpacity = useRef(new Animated.Value(0));
  const buttonTranslateY = useRef(new Animated.Value(20));

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const maxScrollY = event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height;

    // 바운스 효과에 반응하지 않도록 스크롤 위치가 유효한 범위 내에 있는지 확인
    if (currentScrollY >= 0 && currentScrollY <= maxScrollY) {
      if (currentScrollY > prevScrollY) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
      setPrevScrollY(currentScrollY);
    }
  };

  useEffect(() => {
    const showButton = Animated.parallel([
      Animated.timing(buttonOpacity.current, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY.current, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    const hideButton = Animated.parallel([
      Animated.timing(buttonOpacity.current, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY.current, {
        toValue: 20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    if (scrollDirection === 'down') {
      showButton.start();
    } else {
      hideButton.start();
    }
  }, [scrollDirection]);

  // check if plan is downloaded
  useEffect(() => {
    // get Audio file from local storage
    const checkPlanAudit = async () => {
      if (plan !== undefined) {
        let audit = JSON.parse(await AsyncStorage.getItem(`planAudit-${plan?.plan_id}`) || '{}');

        if (!audit || audit.audit_updated_date !== plan.audit_updated_date) {
          Alert.alert('알림!', '새로운 오디오 파일이 추가되었습니다. 파일을 다시 다운로드 해주세요.', [
            {
              text: '확인',
              onPress: async () => {
                await AsyncStorage.removeItem(`planAudit-${plan_id}`);
                router.dismissTo('/plan');
              }
            }
          ])
        }
      }
    }

    checkPlanAudit();
  }, [plan]);

  // fetch lecture history from AsyncStorage
  useEffect(() => {
    async function fetchLectureHistory() {
      const lectureHistory = await AsyncStorage.getItem('lecture-history');
      const lectureHistoryData = lectureHistory ? JSON.parse(lectureHistory) : {};
      setLectureHistoryDict(lectureHistoryData);
    }

    fetchLectureHistory();
  }, [])

  const handlePressLeftArrow = () => {
    if (backToLink !== undefined) {
      router.dismissTo(backToLink as Href);
    } else {
      router.back();
    }
  }

  const handlePressLecture = ({ lecture_id }: { lecture_id: string }) => {
    // Todo - add params
    router.push({
      pathname: '/lectureDetail/[lecture_id]',
      params: {
        plan_id: plan_id,
        plan_title: data?.plan.title,
        lecture_id: lecture_id,
      }
    })
  }

  const handlePressAuthor = async (uri: string) => {
    await WebBrowser.openBrowserAsync(uri);
  }

  const handlePressContinueBtn = () => {
    // 수강할 강의 ID
    let nextLectureId = getNextLectureId();
    router.push({
      pathname: '/lectureDetail/[lecture_id]',
      params: {
        plan_id: plan_id,
        plan_title: data?.plan.title,
        lecture_id: nextLectureId,
      }
    })
  }

  /*
    다음 강의 ID를 가져오는 함수
    수강한 강의가 없으면 첫 번째 강의 ID를 반환
    수강한 강의가 있으면 가장 최근 강의 이후의 강의 ID를 반환
  */
  const getNextLectureId = () => {
    const completedLectureIds = Object.keys(lectureHistoryDict);
    const completedLectures = lectures
      .filter(lecture => completedLectureIds.includes(lecture.lecture_id));

    if (completedLectures.length === 0) {
      return lectures[0].lecture_id;
    }

    const latestLecture = completedLectures
      .sort((a, b) => b.created_date - a.created_date)[0];

    const nextLecture = lectures
      .filter(lecture =>
        !completedLectureIds.includes(lecture.lecture_id)
        && lecture.created_date > latestLecture.created_date
      )
      .sort((a, b) => a.created_date - b.created_date)[0];

    return nextLecture ? nextLecture.lecture_id : latestLecture.lecture_id;
  }

  return (
    // Background
    <ImageBackground
      blurRadius={30}
      style={{ flex: 1 }}
      source={{ uri: banner || data?.plan.thumbnail }}
    >
      <View style={styles.backgroundFilter} />
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={32}
        style={{ paddingTop: insets.top }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + moderateScale(40) }}
      >
        {/* Header */}
        <Header
          style={styles.header}
          prefix={
            <View style={styles.headerPrefix}>
              <Pressable onPress={handlePressLeftArrow} hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}>
                <LeftArrow />
              </Pressable>
              <MediumText>{title}</MediumText>
            </View>
          }
        />

        {/* Content */}
        <View style={styles.container}>
          {/* Title */}
          <BoldText
            style={styles.title}
            fontSize={24}
            lineHeight={29}
          >
            {data?.plan.title}
          </BoldText>

          {/* Desc Plan */}
          <View style={styles.description}>
            <RegularText
              fontSize={14}
              lineHeight={22}
              color="#B3B3B3"
            >
              기도 소개
            </RegularText>
            <RegularText
              fontSize={14}
              lineHeight={22}
            >
              {plan?.description}
            </RegularText>
          </View>

          {/* LectureList */}
          <View>
            {/* Title */}
            <BoldText
              style={styles.lectureTitle}
              fontSize={16}
              lineHeight={22}
            >
              회차 선택하기
            </BoldText>

            {/* Indicator */}
            <RegularText
              style={styles.lectureIndicator}
              fontSize={14}
              lineHeight={21}
              color="#B3B3B3"
            >
              {`전체 회차 수: ${lectures.length}회차`}
            </RegularText>

            {/* List */}
            <View>
              {
                lectures.map((row) => (
                  <TouchableOpacity
                    key={row.lecture_id}
                    onPress={() => handlePressLecture({ lecture_id: row.lecture_id })}
                    style={[styles.card, styles.lecture]}
                  >
                    {/* CheckBox */}
                    {
                      (lectureHistoryDict[row.lecture_id] && lectureHistoryDict[row.lecture_id] > 0) ? (
                        <CheckedCircle
                          width={moderateScale(22)}
                          height={moderateScale(22)}
                        />
                      ) : (
                        <UnChckedCircle
                          width={moderateScale(22)}
                          height={moderateScale(22)}
                        />
                      )
                    }

                    {/* Content */}
                    <View style={styles.lectureContent}>
                      <BoldText
                        fontSize={16}
                        lineHeight={24}
                      >
                        {row.title}
                      </BoldText>
                      <RegularText
                        fontSize={14}
                        lineHeight={22}
                        numberOfLines={1}
                      >
                        {row.description}
                      </RegularText>
                    </View>

                    {/* Button */}
                    <Play
                      width={moderateScale(38)}
                      height={moderateScale(38)}
                    />
                  </TouchableOpacity>
                ))
              }
            </View>
          </View>
        </View>
      </ScrollView >

      {/* Continue Button */}
      <Animated.View style={{
        position: 'absolute',
        width: '100%',
        bottom: insets.bottom + Platform.OS === 'ios' ? 0 : scaleHeight(48),
        paddingHorizontal: moderateScale(24),
        opacity: buttonOpacity.current,
        transform: [{ translateY: buttonTranslateY.current }],
      }
      }>
        <PrimaryButton
          onPress={handlePressContinueBtn}
          style={{
            paddingVertical: moderateScale(14)
          }}>
          <MediumText
            fontSize={14}
          >
            {
              Object.keys(lectureHistoryDict).length > 0 &&
                Object.keys(lectureHistoryDict).length < lectures.length
                ? '이어서 기도하기'
                : '기도 시작하기'
            }
          </MediumText>
        </PrimaryButton>
      </Animated.View>
    </ImageBackground >
  )
}

const styles = StyleSheet.create({
  backgroundFilter: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 20, 26, 0.8)'
  },
  headerPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(16)
  },
  banner: {
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScale(16),
    borderRadius: moderateScale(8),
  },
  bannerImage: {
    width: moderateScale(343),
    height: moderateScale(180),
  },
  header: {
    marginBottom: moderateScale(24),
  },
  container: {
    paddingHorizontal: moderateScale(24),
  },
  title: {
    marginBottom: moderateScale(12),
  },
  card: {
    paddingVertical: moderateScale(14),
    paddingLeft: moderateScale(12),
    paddingRight: moderateScale(16),
    borderRadius: moderateScale(10),
    backgroundColor: 'rgba(255, 255, 255, .04)',
  },
  description: {
    marginBottom: moderateScale(24),
  },
  author: {
    marginBottom: moderateScale(40),
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  profileImage: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(100),
  },
  profileName: {
    flex: 1
  },
  profileContent: {
    marginVertical: moderateScale(10),
  },
  lectureTitle: {
    marginBottom: moderateScale(8),
  },
  lectureIndicator: {
    marginBottom: moderateScale(8),
    width: '100%',
    textAlign: 'right'
  },
  lecture: {
    flexDirection: 'row',
    gap: moderateScale(14),
    alignItems: 'center',
    marginBottom: moderateScale(16)
  },
  lectureContent: {
    flex: 1,
    gap: moderateScale(2),
  }
});