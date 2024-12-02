import CheckedCircle from '@/assets/images/icon/checkedCircle.svg';
import Heart from "@/assets/images/icon/heart.svg";
import LeftArrow from "@/assets/images/icon/leftArrow.svg";
import Play from '@/assets/images/icon/play.svg';
import RightShortArrow from '@/assets/images/icon/rightShortArrow.svg';
import UnCheckedCircle from '@/assets/images/icon/unCheckedCircle.svg';
import Header from "@/components/Header";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import { moderateScale } from "@/utils/style";
import { ImageBackground } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DefaultBanner = require('@/assets/images/plan/default-banner.png');
const DefaultAuthor = require('@/assets/images/plan/default-author.png');

export default function PlanDetailPage() {
  const insets = useSafeAreaInsets();
  const { id, title, desc, banner } = useLocalSearchParams<{
    id: string;
    title: string;
    desc: string;
    banner: string;
  }>();
  const [isLiked, setIsLiked] = useState(false);

  const onPressHeart = () => {
    setIsLiked(!isLiked);
  }

  const onPressLeftArrow = () => {
    router.back();
  }

  return (
    // Background
    <ImageBackground
      source={banner === 'default' ? DefaultBanner : { uri: banner }}
      style={{ flex: 1 }}
      blurRadius={30}
    >
      <View style={styles.backgroundFilter} />
      <ScrollView style={{ paddingTop: insets.top }}>
        {/* Header */}
        <Header
          style={styles.header}
          prefix={
            <View style={styles.headerPrefix}>
              <Pressable onPress={onPressLeftArrow}>
                <LeftArrow />
              </Pressable>
              <MediumText>{title}</MediumText>
            </View>
          }
          suffix={
            <Heart
              fill={isLiked ? "#FF7D71" : "transparent"}
              stroke={isLiked ? "#FF7D71" : "white"}
              onPress={onPressHeart}
            />
          }
        />
        {/* Banner */}
        <View style={styles.banner}>
          <Image
            resizeMode="cover"
            style={styles.bannerImage}
            source={banner === 'default' ? DefaultBanner : { uri: banner }}
          />
        </View>

        {/* Content */}
        <View style={styles.container}>
          {/* Title */}
          <BoldText
            style={styles.title}
            fontSize={24}
            lineHeight={29}
          >
            {title}
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
              {desc}
            </RegularText>
          </View>

          {/* Desc Author */}
          <View style={[styles.card, styles.author]}>
            {/* Profile */}
            <View style={styles.profile}>
              <Image
                style={styles.profileImage}
                source={DefaultAuthor}
              />

              <View style={styles.profileName}>
                <Pressable>
                  <RegularText
                    fontSize={12}
                    lineHeight={18}
                    color={"#B3B3B3"}
                  >
                    더 보기
                  </RegularText>
                  <RegularText
                    fontSize={16}
                    lineHeight={22}
                  >
                    Jesus Medical Center
                  </RegularText>
                </Pressable>
              </View>
              <Pressable>
                <RightShortArrow />
              </Pressable>
            </View>
            {/* Content */}
            <RegularText
              style={styles.profileContent}
              fontSize={12}
              lineHeight={22}
            >
              {`이 기도 플랜 계획을 제공해주신 'Jesus Medical Center'에 감사드립니다. 더 많은 정보를 보시려면, 이 링크를 클릭해주세요: {유튜브 링크}`}
            </RegularText>

            <RegularText
              fontSize={12}
              lineHeight={22}
              color="#B3B3B3"
            >
              출판자 소개
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
              lineHeight={15}
              color="#B3B3B3"
            >
              {`전체 회차 수: {}회차`}
            </RegularText>

            {/* List */}
            <View>
              <View style={[styles.card, styles.lecture]}>
                {/* CheckBox */}
                <CheckedCircle
                  width={moderateScale(22)}
                  height={moderateScale(22)}
                />

                {/* Content */}
                <View style={styles.lectureContent}>
                  <BoldText
                    fontSize={16}
                    lineHeight={24}
                  >
                    1. 기도란 무엇인가?
                  </BoldText>
                  <RegularText
                    fontSize={14}
                    lineHeight={22}
                  >
                    처음 시작하는 기도
                  </RegularText>
                </View>

                {/* Button */}
                <Play
                  width={moderateScale(38)}
                  height={moderateScale(38)}
                />
              </View>
              <View style={[styles.card, styles.lecture]}>
                {/* CheckBox */}
                <UnCheckedCircle
                  width={moderateScale(22)}
                  height={moderateScale(22)}
                />

                {/* Content */}
                <View style={styles.lectureContent}>
                  <BoldText
                    fontSize={16}
                    lineHeight={24}
                  >
                    2. 하나님이 원하시는 기도
                  </BoldText>
                  <RegularText
                    fontSize={14}
                    lineHeight={22}
                  >
                    처음 시작하는 기도
                  </RegularText>
                </View>

                {/* Button */}
                <Play
                  width={moderateScale(38)}
                  height={moderateScale(38)}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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