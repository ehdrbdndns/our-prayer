import Fire from "@/assets/images/icon/fire.svg";
import Search from "@/assets/images/icon/search.svg";
import Star from "@/assets/images/icon/star.svg";
import Logo from "@/assets/images/text-s-logo.svg";
import CustomButton from "@/components/button/CustomButton";
import Header from "@/components/Header";
import PrayerPlan from "@/components/PrayerPlan";
import PrayerRecord from "@/components/PrayerRecord";
import PrayerState from "@/components/PrayerState";
import ShareCard from "@/components/ShareCard";
import { BoldText } from "@/components/text/BoldText";
import TodayVerse from "@/components/TodayVerse";
import { useSession } from "@/ctx";
import api from "@/utils/axios";
import { moderateScale } from "@/utils/style";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface BibleType {
  title: string;
  content: string;
}

export default function Index() {

  const { session } = useSession();

  const { data: bibleData } = useQuery<BibleType>({
    queryKey: ["bible"],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      try {
        const res = await api.get<BibleType>("/bible", {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "RefreshToken": refreshToken
          }
        });
        return res.data;
      } catch (e) {
        console.error(e);
        // return default data
        return {
          title: "마가복음 11:24",
          content: "그러므로 내가 너희에게 말하노니 무엇이든지 기도하고 구하는 것은 받은 줄로 믿으라 그리하면 너희에게 그대로 되리라"
        }
      }
    },
    staleTime: 12 * 60 * 60 * 1000, // 12시간
    gcTime: 12 * 60 * 60 * 1000, // 12시간
  })

  return (
    <ScrollView
      style={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <Header
          style={styles.header}
          prefix={
            <Link href="/login">
              <Logo
                style={{ marginLeft: moderateScale(4) }}
                width={moderateScale(82)}
                height={moderateScale(18)}
              />
            </Link>
          }
          suffix={
            <Search
              width={moderateScale(24)}
              height={moderateScale(24)}
            />
          }
        />

        {/* Content */}
        <View style={styles.content}>
          <BoldText style={styles.intro} fontSize={24} lineHeight={36} letterSpacingPercent={-1}>
            {`안녕하세요, ${session}님,\n오늘의 기도를 시작해보세요.`}
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
              data={134}
              unit={"일"}
            />

            {/* 오늘의 기도 시간 */}
            <PrayerState
              style={styles.prayerState}
              title={"오늘의 기도 시간"}
              icon={<Star width={moderateScale(24)} height={moderateScale(24)} />}
              data={14}
              unit={"분"}
            />
          </View>
        </View>

        {/* 오늘의 말씀 */}
        <View style={styles.content}>
          {
            bibleData ? (
              <TodayVerse
                subTitle={bibleData.title}
                content={bibleData.content}
              />
            ) : null
          }

        </View>

        {/* 기도 일자 데이터 */}
        <View style={[styles.content, { marginBottom: moderateScale(40) }]}>
          {/* Title */}
          <BoldText
            style={{ marginBottom: moderateScale(16) }}
            color="#FFFFFF"
            fontSize={16}
            lineHeight={24}
            letterSpacingPercent={-1}
          >
            나의 기도 기록
          </BoldText>

          <PrayerRecord />

          {/* Button */}
          <CustomButton style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            paddingVertical: moderateScale(12),
            paddingHorizontal: moderateScale(24),
            marginTop: moderateScale(16),
          }}>
            <BoldText
              color="#FFFFFF"
              fontSize={14}
              lineHeight={22}
              letterSpacingPercent={-1}
            >
              기도 기록 전체보기
            </BoldText>
          </CustomButton>
        </View>

        {/* 기도 플랜 */}
        <View style={[styles.content, { paddingRight: 0 }]}>
          <PrayerPlan />
        </View>

        {/* 공유 카드 */}
        <ShareCard />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: moderateScale(42),
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
  }
});
