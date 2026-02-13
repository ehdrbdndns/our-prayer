import LeftArrow from "@/assets/images/icon/leftArrow.svg";
import PrimaryButton from "@/components/button/PrimaryButton";
import Header from "@/components/Header";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import TimerPicker from "@/components/TimerPicker";
import { usePlanQuery } from "@/utils/queries";
import { moderateScale } from "@/utils/style";
import { minuteToTimeLabel } from "@/utils/timerPicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImageBackground } from "expo-image";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TIMER_PICKER_LAST_MINUTE_KEY = "timerPicker:lastMinute";

export default function FreePrayerSetupPage() {
  const insets = useSafeAreaInsets();

  const {
    plan_id,
    title,
    banner,
    description,
    backToLink,
  } = useLocalSearchParams<{
    plan_id: string;
    title: string;
    banner: string;
    description: string;
    backToLink?: string;
  }>();

  const { data } = usePlanQuery({ plan_id });
  const [prayerMinutes, setPrayerMinutes] = useState(30);

  const lectures = useMemo(
    () => (data?.lectures || []).slice().sort((a, b) => a.created_date - b.created_date),
    [data?.lectures]
  );

  const firstLecture = lectures[0];
  const displayBanner = banner || data?.plan.thumbnail || "";
  const displayTitle = data?.plan.title || title || "자유 기도";
  const displayDescription = data?.plan.description || description || "";
  const prayerTimeLabel = useMemo(() => minuteToTimeLabel(prayerMinutes), [prayerMinutes]);

  useEffect(() => {
    let mounted = true;

    const restoreLastMinute = async () => {
      const storedMinute = await AsyncStorage.getItem(TIMER_PICKER_LAST_MINUTE_KEY);
      if (!mounted || !storedMinute) {
        return;
      }

      const parsed = Number(storedMinute);
      if (Number.isFinite(parsed)) {
        const clamped = Math.max(1, Math.min(300, Math.round(parsed)));
        setPrayerMinutes(clamped);
      }
    };

    restoreLastMinute();

    return () => {
      mounted = false;
    };
  }, []);

  const handlePressLeftArrow = () => {
    if (backToLink !== undefined) {
      router.dismissTo(backToLink as Href);
      return;
    }

    router.back();
  };

  const handleChangeMinute = async (minute: number) => {
    setPrayerMinutes(minute);
    await AsyncStorage.setItem(TIMER_PICKER_LAST_MINUTE_KEY, String(minute));
  };

  const handlePressStartPrayer = () => {
    if (!firstLecture) {
      Alert.alert("알림", "자유기도를 시작할 강의 정보를 찾을 수 없습니다.");
      return;
    }

    router.navigate({
      pathname: "/freePrayer",
      params: {
        plan_id,
        // freePrayer와 prayerRecord 저장 연동을 위해 lecture_id를 필수로 전달합니다.
        lecture_id: firstLecture.lecture_id,
        plan_title: displayTitle,
        plan_description: displayDescription,
        banner: displayBanner,
        prayer_minutes: String(prayerMinutes),
      },
    });
  };

  return (
    <ImageBackground blurRadius={30} style={styles.background} source={{ uri: displayBanner }}>
      <View style={styles.backgroundFilter} />

      <View
        style={[
          styles.contentWrapper,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom + moderateScale(96),
          },
        ]}
      >
        <Header
          style={styles.header}
          prefix={
            <View style={styles.headerPrefix}>
              <Pressable onPress={handlePressLeftArrow} hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}>
                <LeftArrow />
              </Pressable>
              <MediumText>{displayTitle}</MediumText>
            </View>
          }
        />

        <View style={styles.container}>
          <BoldText style={styles.title} fontSize={24} lineHeight={29}>
            자유기도 타이머 설정
          </BoldText>

          <View style={styles.descriptionBox}>
            <RegularText fontSize={14} lineHeight={22} color="#B3B3B3">
              기도 소개
            </RegularText>
            <RegularText fontSize={14} lineHeight={22}>
              {displayDescription}
            </RegularText>
          </View>

          <BoldText style={styles.timerTitle} fontSize={18} lineHeight={22}>
            기도 시간 선택
          </BoldText>
          <RegularText style={styles.timerIndicator} fontSize={14} lineHeight={21} color="#B3B3B3">
            {`선택한 시간: ${prayerTimeLabel}`}
          </RegularText>

          <View style={styles.pickerWrapper}>
            <TimerPicker value={prayerMinutes} min={1} max={300} onChange={handleChangeMinute} />
          </View>
        </View>
      </View>

      <View
        style={[
          styles.buttonWrapper,
          {
            bottom: insets.bottom,
          },
        ]}
      >
        <PrimaryButton testID="free-prayer-setup-start" onPress={handlePressStartPrayer} style={styles.startButton}>
          <MediumText fontSize={14}>기도 시작하기</MediumText>
        </PrimaryButton>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundFilter: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 20, 26, 0.8)",
  },
  header: {
    marginBottom: moderateScale(24),
  },
  headerPrefix: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(16),
  },
  contentWrapper: {
    flex: 1,
  },
  container: {
    paddingHorizontal: moderateScale(24),
  },
  title: {
    marginBottom: moderateScale(12),
  },
  descriptionBox: {
    marginBottom: moderateScale(24),
  },
  timerTitle: {
    marginBottom: moderateScale(8),
  },
  timerIndicator: {
    marginBottom: moderateScale(8),
    width: "100%",
    textAlign: "right",
  },
  pickerWrapper: {
    borderRadius: moderateScale(10),
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(12),
  },
  buttonWrapper: {
    position: "absolute",
    width: "100%",
    paddingHorizontal: moderateScale(24),
  },
  startButton: {
    paddingVertical: moderateScale(14),
  },
});
