import CheckedCircle from '@/assets/images/icon/checkedCircle.svg';
import Heart from "@/assets/images/icon/heart.svg";
import LeftArrow from "@/assets/images/icon/leftArrow.svg";
import Play from '@/assets/images/icon/play.svg';
import RightShortArrow from '@/assets/images/icon/rightShortArrow.svg';
import Header from "@/components/Header";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import { useLikeMutation } from '@/utils/mutation';
import { usePlanQuery } from '@/utils/queries';
import { moderateScale } from "@/utils/style";
import { ImageBackground } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { Image, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PlanDetailPage() {
  const insets = useSafeAreaInsets();

  const {
    plan_id, title, banner,
    isLiked: isLikedFromParam,
  } = useLocalSearchParams<{
    plan_id: string;
    title: string;
    banner: string;
    isLiked: string;
  }>();

  const { data, isSuccess: isPlanSuccess } = usePlanQuery({ plan_id });

  const plan = data?.plan;
  const lectures = data?.lectures || [];

  const { isLiked, mutateLike } = useLikeMutation({
    plan_id,
    is_liked: plan?.is_liked || Boolean(Number(isLikedFromParam)),
    plan_like_id: plan?.plan_like_id || '',
  });

  const onPressHeart = () => {
    mutateLike();
  }

  const onPressLeftArrow = () => {
    router.push('/plan');
  }

  const onPressLecture = ({ lecture_id }: { lecture_id: string }) => {
    // Todo - add params
    router.push({
      pathname: '/lecture/[lecture_id]',
      params: {
        plan_id: plan_id,
        plan_title: title,
        lecture_id: lecture_id,
      }
    })
  }

  const onPressAuthor = async (uri: string) => {
    await WebBrowser.openBrowserAsync(uri);
  }

  return (
    // Background
    <ImageBackground
      source={{ uri: banner }}
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
              <Pressable onPress={onPressLeftArrow} hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}>
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
              hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
            />
          }
        />
        {/* Banner */}
        <View style={styles.banner}>
          <Image
            resizeMode="cover"
            style={styles.bannerImage}
            source={{ uri: banner }}
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
              {plan?.description}
            </RegularText>
          </View>

          {/* Desc Author */}
          <TouchableOpacity
            onPress={() => onPressAuthor(plan?.author_deeplink || '')}
          >
            <View style={[styles.card, styles.author]}>
              {/* Profile */}
              <View style={styles.profile}>
                <Image
                  style={styles.profileImage}
                  source={{ uri: plan?.author_profile }}
                />
                <View style={styles.profileName}>
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
                    {plan?.author_name}
                  </RegularText>
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
                {plan?.author_description}
              </RegularText>

              <RegularText
                fontSize={12}
                lineHeight={22}
                color="#B3B3B3"
              >
                출판자 소개
              </RegularText>
            </View>
          </TouchableOpacity>

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
              {`전체 회차 수: ${lectures.length}회차`}
            </RegularText>

            {/* List */}
            <View>
              {
                lectures.map((row) => (
                  <TouchableOpacity
                    key={row.lecture_id}
                    onPress={() => onPressLecture({ lecture_id: row.lecture_id })}
                    style={[styles.card, styles.lecture]}
                  >
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