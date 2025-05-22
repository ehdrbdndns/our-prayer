import Fire from "@/assets/images/icon/fire.svg";
import RightShortArrow from '@/assets/images/icon/rightShortArrow.svg';
import Star from "@/assets/images/icon/star.svg";
import Header from "@/components/Header";
import PrayerRecord from "@/components/PrayerRecord";
import PrayerState from "@/components/PrayerState";
import { BoldText } from "@/components/text/BoldText";
import TodayVerse from "@/components/TodayVerse";
import { useSession } from "@/ctx";
import { calculateContinuousPrayerDays, calculateTodayPrayerTime } from "@/utils/date";
import { useBibleQuery, useHistoryQuery } from "@/utils/queries";
import { moderateScale, scaleHeight } from "@/utils/style";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {

  const queryClient = useQueryClient();

  const { session, isLoading } = useSession();

  const [name, setName] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // fetch Bible data
  const { data: bible, isSuccess: isBibleSuccess } = useBibleQuery();

  // fetch History data for 3 weeks
  const { data: history, isSuccess: isHistorySuccess, isFetched: isHistoryLoading } = useHistoryQuery();

  const continuousPrayerDays = calculateContinuousPrayerDays(history || []);
  const todayPrayerTime = calculateTodayPrayerTime(history || []);

  const onPressHistory = () => {
    router.push("/calendar");
  }

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/login");
    } else if (!isLoading && !!session) {
      const { name } = JSON.parse(session);
      setName(name);
    }
  }, [session, isLoading]);

  if (!isHistorySuccess || !isBibleSuccess || isLoading) {
    return null; // TODO : Add skeleton
  }

  const onRefresh = async () => {
    setRefreshing(true);

    await queryClient.refetchQueries({ queryKey: ["history"] });
    await queryClient.refetchQueries({ queryKey: ["plan"] });

    setRefreshing(false);
  }

  return (
    <ScrollView
      style={[styles.scrollViewContent]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Platform.OS === "ios" ? "#FFFFFF" : "#000000"]}
          tintColor={"#FFFFFF"}
          progressViewOffset={scaleHeight(50)}
        />
      }
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
          onPress={onPressHistory}
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
              lineHeight={24}
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
            <PrayerRecord history={history || []} />
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
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
