import Fire from "@/assets/images/icon/fire.svg";
import RightShortArrow from '@/assets/images/icon/rightShortArrow.svg';
import Star from "@/assets/images/icon/star.svg";
import Header from "@/components/Header";
import PrayerRecord from "@/components/PrayerRecord";
import PrayerState from "@/components/PrayerState";
import ScreenLayout from "@/components/ScreenLayout";
import ShareCard from "@/components/ShareCard";
import { BoldText } from "@/components/text/BoldText";
import TodayVerse from "@/components/TodayVerse";
import { useAppContext } from "@/contexts/AppContext";
import { useSession } from '@/contexts/AuthContext';
import { ASYNC_IS_PRAYING, AsyncIsPrayingType } from "@/storage/asyncStorageKeys";
import { calculateContinuousPrayerDays, calculateTodayPrayerTime } from "@/utils/date";
import { handleSmartReviewRequest } from "@/utils/inAppReview";
import { useBibleQuery, useHistoryQuery } from "@/utils/queries";
import { moderateScale } from "@/utils/style";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {

  const { session, isLoading } = useSession();
  const { shouldRequestReview, setShouldRequestReview } = useAppContext();
  const isFocused = useIsFocused();

  const [name, setName] = useState('');

  // fetch Bible data
  const { data: bible, isSuccess: isBibleSuccess } = useBibleQuery();

  // fetch History data for 3 weeks
  const { data: history, isSuccess: isHistorySuccess, isFetched: isHistoryLoading } = useHistoryQuery();

  const continuousPrayerDays = calculateContinuousPrayerDays(history || []);
  const todayPrayerTime = calculateTodayPrayerTime(history || []);

  const handlePressHistory = () => {
    router.navigate("/calendar");
  }

  // 앱이 준비 되었을 때 기도 중이였는지 확인하고 
  // 기도 중이었다면 Alert로 기도 페이지로 이동 여부 확인
  useEffect(() => {
    async function checkIsPraying() {
      const isPraying = await AsyncStorage.getItem(ASYNC_IS_PRAYING);

      if (!isPraying) { return }

      const {
        plan_id
        , plan_title
        , lecture_id
        , endTime
      } = JSON.parse(isPraying) as AsyncIsPrayingType

      // 3시간 이상 지난 경우 기도 중 상태 초기화
      const now = new Date().getTime();
      if (now - endTime > 3 * 60 * 60 * 1000) {
        await AsyncStorage.removeItem(ASYNC_IS_PRAYING);
        return;
      }

      Alert.alert(
        `혹시 기도 중이셨나요?`,
        `기도 중이셨다면 기도 페이지로 이동하시겠습니까?`,
        [
          {
            text: "아니오",
            style: "cancel",
            onPress: async () => {
              // 기도 중 상태 초기화
              await AsyncStorage.removeItem(ASYNC_IS_PRAYING);
            }
          },
          {
            text: "이어서 기도하기",
            onPress: () => {
              // 기도 페이지로 이동
              router.navigate({
                pathname: '/lectureDetail/[lecture_id]',
                params: {
                  plan_id: plan_id,
                  plan_title: plan_title,
                  lecture_id: lecture_id,
                  isReconnect: 'true',
                }
              })
            }
          }
        ]
      )
    }

    if (!isLoading && !session) {
      router.navigate("/login");
    } else if (!isLoading && !!session) {
      const { name } = JSON.parse(session);
      setName(name);
      checkIsPraying();
    }
  }, [session, isLoading]);

  // 앱 리뷰 요청 로직
  useEffect(() => {
    if (isFocused && shouldRequestReview) {
      const timer = setTimeout(() => {
        handleSmartReviewRequest(setShouldRequestReview);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isFocused, shouldRequestReview]);

  if (!isHistorySuccess || !isBibleSuccess || isLoading) {
    return null; // TODO : Add skeleton
  }

  return (
    <ScreenLayout>
      <ScrollView
        style={[styles.scrollViewContent]}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <Header style={styles.header} />

          {/* Content */}
          <View style={styles.content}>
            <BoldText style={styles.intro} fontSize={24} lineHeight={36} letterSpacingPercent={-1}>
              {`안녕하세요, ${name}님\n오늘의 기도를 시작해보세요.`}
            </BoldText>
          </View>

          {/* 기도 데이터 */}
          <View style={styles.content}>
            <View style={styles.prayerStateList}>
              {/* 연속 기도 일수 */}
              <PrayerState
                style={styles.prayerState}
                title={"연속 기도일 수"}
                icon={<Fire width={moderateScale(24)} height={moderateScale(24)} />}
                data={continuousPrayerDays}
                unit={"일"}
              />

              {/* 오늘의 기도 시간 */}
              <PrayerState
                style={styles.prayerState}
                title={"오늘의 기도 시간"}
                icon={<Star width={moderateScale(24)} height={moderateScale(24)} />}
                data={todayPrayerTime}
                unit={"분"}
              />
            </View>
          </View>

          {/* 오늘의 말씀 */}
          <View style={styles.content}>
            {
              isBibleSuccess ? (
                <TodayVerse
                  subTitle={bible.title}
                  content={bible.content}
                />
              ) : null // TODO : Add skeleton loader
            }

          </View>
          {/* 기도 일자 데이터 */}
          <TouchableOpacity
            style={[styles.content, { marginBottom: moderateScale(40) }]}
            onPress={handlePressHistory}
          >
            {/* Title */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: moderateScale(16)
              }}
            >
              <BoldText
                color="#FFFFFF"
                fontSize={16}
                letterSpacingPercent={-1}
              >
                나의 기도 기록
              </BoldText>
              <RightShortArrow />
            </View>

            <View
              style={{
                paddingVertical: moderateScale(18),
                paddingHorizontal: moderateScale(16),
                borderRadius: moderateScale(10),
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              }}
            >
              <PrayerRecord history={history.sort((a, b) => b.created_date - a.created_date).slice(0, 28) || []} />
            </View>
          </TouchableOpacity>

          {/* 공유 카드 */}
          <View style={styles.shareCard}>
            <ShareCard />
          </View>
        </SafeAreaView>
        <View style={{ height: moderateScale(60) }} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: moderateScale(12),
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: moderateScale(24),
  },
  scrollViewContent: {
    paddingBottom: 0
  },

  // 인트로(안녕하세요, {name}님...)
  intro: {
    marginBottom: moderateScale(16),
  },

  // 기도 데이터
  prayerStateList: {
    flexDirection: "row",
    marginBottom: moderateScale(40),
  },
  prayerState: {
    flex: 1
  },

  // 오늘의 말씀
  todayVerse: {
    marginBottom: moderateScale(36),
  },
  todayVerseTitle: {
    marginBottom: moderateScale(12),
  },
  todayVerseCard: {
    paddingVertical: moderateScale(18),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(10),
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  todayVerseCardSection: {
    marginBottom: moderateScale(4),
  },
  todayVerseCardContent: {
    marginBottom: moderateScale(20),
  },
  todayVerseCardButton: {
    width: 'auto',
    alignSelf: 'flex-start',
    backgroundColor: '#0F141A',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(24)
  },
  button: {
    width: 'auto',
    alignSelf: 'flex-start',
    backgroundColor: '#0F141A',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(24),
    marginTop: moderateScale(16),
  },
  // 공유 카드
  shareCard: {
    marginBottom: Platform.OS === 'ios' ? 0 : moderateScale(40),
  }
});