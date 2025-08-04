import Download from "@/assets/images/icon/download.svg";
import { useModal } from "@/ctx";
import { PlanType } from "@/utils/dataType";
import { moderateScale } from "@/utils/style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import { BoldText } from "./text/BoldText";

export default function PlanCard({ plan, refreshing }: { plan: PlanType, refreshing: boolean }) {

  const { showModal } = useModal();

  const [isDownloaded, setIsDownloaded] = useState(false);

  const checkPlanAudit = async () => {
    let audit = JSON.parse(await AsyncStorage.getItem(`planAudit-${plan.plan_id}`) || '{}');
    setIsDownloaded(!!audit && audit.audit_updated_date === plan.audit_updated_date);
  }

  checkPlanAudit();

  const handlePressCard = () => {
    if (isDownloaded) {
      router.push({
        pathname: `/planDetail/[plan_id]`,
        params: {
          plan_id: plan.plan_id,
          title: "기도 플랜",
          banner: plan.thumbnail,
          isLiked: '',
          backToLink: '/plan'
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
                auditDate: plan.audit_updated_date,
                thumbnail: plan.thumbnail,
                title: plan.title,
                isLiked: false
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
      onPress={handlePressCard}
    >
      <ImageBackground
        style={styles.card}
        imageStyle={{ borderRadius: moderateScale(8) }}
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
        {
          !isDownloaded ? (
            <Download
              style={styles.heart}
            />
          ) : null
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
    paddingBottom: moderateScale(14),
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