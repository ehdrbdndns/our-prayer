import Download from "@/assets/images/icon/download.svg";
import Heart from "@/assets/images/icon/heart.svg";
import { useModal } from "@/ctx";
import { PlanType } from "@/utils/dataType";
import { useLikeMutation } from "@/utils/mutation";
import { moderateScale } from "@/utils/style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import { BoldText } from "./text/BoldText";
import { RegularText } from "./text/RegularText";

export default function PlanCard({ plan }: { plan: PlanType }) {

  const { showModal } = useModal();

  const [isDownloaded, setIsDownloaded] = useState(false);

  const { isLiked, mutateLike } = useLikeMutation({
    plan_id: plan.plan_id,
    is_liked: plan.is_liked,
    plan_like_id: plan.plan_like_id
  })

  useEffect(() => {
    // get Audio file from local storage
    const checkPlanAudit = async () => {
      let audit = JSON.parse(await AsyncStorage.getItem(`planAudit-${plan.plan_id}`) || '{}');
      setIsDownloaded(!!audit && audit.audit_updated_date === plan.audit_updated_date);
      // for test
      setIsDownloaded(false);
    }

    checkPlanAudit();
  }, []);

  const onPressHeart = () => {
    mutateLike();
  }

  const onPressCard = () => {
    if (isDownloaded) {
      router.push({
        pathname: `/planDetail/[plan_id]`,
        params: {
          plan_id: plan.plan_id,
          title: plan.title,
          banner: plan.thumbnail,
          isLiked: String(isLiked),
        },
      });
    } else {
      Alert.alert(
        "다운로드",
        `${plan.title} 플랜을 다운로드 하시겠습니까?`,
        [
          {
            text: "취소",
            style: "cancel"
          },
          {
            text: "다운로드",
            onPress: () => {
              showModal({
                planId: plan.plan_id,
                auditDate: plan.audit_updated_date
              });
            }
          }
        ],
        { cancelable: false }
      )
    }
  }

  return (
    <TouchableOpacity
      onPress={onPressCard}
    >
      <ImageBackground
        style={styles.card}
        source={plan.s_thumbnail}
      >
        <LinearGradient
          colors={isDownloaded
            ? ["rgba(0, 0, 0, 0)", "#161B29"]
            : ["rgba(0, 0, 0, 1)", "rgba(0, 0, 0, 1)"]
          }
          style={styles.cardFilter}
        />
        <BoldText
          fontSize={16}
          lineHeight={24}
        >
          {plan.title}
        </BoldText>

        <RegularText
          numberOfLines={1}
          fontSize={14}
          lineHeight={22}
        >
          {plan.description}
        </RegularText>

        {
          isDownloaded ? (
            <Heart
              style={styles.heart}
              fill={isLiked ? "#FF7D71" : "transparent"}
              stroke={isLiked ? "#FF7D71" : "white"}
              onPress={onPressHeart}
            />
          ) : (
            <Download
              style={styles.heart}
            />
          )
        }
      </ImageBackground>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: moderateScale(160),
    height: moderateScale(160),
    borderRadius: moderateScale(8),

    paddingLeft: moderateScale(12),
    paddingBottom: moderateScale(20),
    paddingTop: moderateScale(14),
    paddingRight: moderateScale(14),

    justifyContent: "flex-end"
  },
  cardFilter: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: moderateScale(8),
    opacity: 0.7
  },
  heart: {
    position: "absolute",
    top: moderateScale(14),
    right: moderateScale(14),
    width: moderateScale(24),
    height: moderateScale(24),
  },
});