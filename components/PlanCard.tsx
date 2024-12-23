import Heart from "@/assets/images/icon/heart.svg";
import api from "@/utils/axios";
import { PlanResponseType, PlanType } from "@/utils/dataType";
import { moderateScale } from "@/utils/style";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { BoldText } from "./text/BoldText";
import { RegularText } from "./text/RegularText";

export default function PlanCard({ plan }: { plan: PlanType }) {

  const queryClient = useQueryClient();

  const [isLiked, setIsLiked] = useState(plan.is_liked);

  const { mutate: mutateLike } = useMutation({
    mutationFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api<{ message: string, plan_like_id: string }>({
        method: plan.is_liked ? "DELETE" : "POST",
        url: "/plan/user",
        data: {
          plan_like_id: plan.is_liked ? plan.plan_like_id : '',
          plan_id: plan.plan_id
        },
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        },
      })

      return res.data;
    },
    onMutate: async () => {
      setIsLiked(!isLiked);
    },
    onSuccess: (data) => {
      const {
        currentPlan,
        plans: previousPlans
      } = queryClient.getQueryData<PlanResponseType>(["plan"]) || { currentPlan: null, plans: [] };

      const updatePlanLikeStatus = (plans: PlanType[], planId: string, isLiked: boolean, planLikeId = '') => {
        return plans.map(prevPlan => {
          if (prevPlan.plan_id === planId) {
            return {
              ...prevPlan,
              is_liked: isLiked,
              plan_like_id: planLikeId,
            };
          }
          return prevPlan;
        });
      };

      const updatedPlans = plan.is_liked
        ? updatePlanLikeStatus(previousPlans, plan.plan_id, false)
        : updatePlanLikeStatus(previousPlans, plan.plan_id, true, data.plan_like_id);

      queryClient.invalidateQueries({ queryKey: ["plan"] });

      queryClient.setQueryData(["plan"], { currentPlan, plans: updatedPlans });
    },
    onError: (error, newUser, context) => {
      console.error('onError', error, newUser, context)
      // 변이 실패 시, 낙관적 업데이트 결과를 이전 사용자 목록으로 되돌리기!
      setIsLiked(!isLiked);
    },
  })

  const onPressHeart = () => {
    mutateLike();
    setIsLiked(!isLiked);
  }

  const onPressPlan = (params: {
    id: string;
    title: string;
    desc: string;
    banner: string;
  }) => {
    const { id, title, desc, banner } = params;
    router.push(`/planDetail?id=${id}&title=${title}&desc=${desc}&banner=${banner}`);
  }


  return (
    <TouchableOpacity
      onPress={() => onPressPlan({
        id: plan.plan_id,
        title: plan.title,
        desc: plan.description,
        banner: plan.thumbnail
      })}
    >
      <ImageBackground
        style={styles.card}
        source={plan.s_thumbnail}
      >
        <LinearGradient
          colors={["rgba(0, 0, 0, 0)", "#161B29"]}
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

        <Heart
          style={styles.heart}
          fill={isLiked ? "#FF7D71" : "transparent"}
          stroke={isLiked ? "#FF7D71" : "white"}
          onPress={onPressHeart}
        />
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
    right: moderateScale(14)
  }
});