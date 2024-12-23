import api from '@/utils/axios';
import { PlanResponseType, PlanType } from '@/utils/dataType';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

export const useLikeMutation = ({
  plan_like_id, plan_id, is_liked
}: {
  plan_like_id: string, plan_id: string, is_liked: boolean
}) => {
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(is_liked);

  useEffect(() => {
    setIsLiked(is_liked);
  }, [is_liked])

  const { mutate: mutateLike } = useMutation({
    mutationFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api<{ message: string, plan_like_id: string }>({
        method: isLiked ? "DELETE" : "POST",
        url: "/plan/user",
        data: {
          plan_id: plan_id,
          plan_like_id: isLiked ? plan_like_id : ''
        },
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        },
      });

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

      const updatedPlans = isLiked
        ? updatePlanLikeStatus(previousPlans, plan_id, false)
        : updatePlanLikeStatus(previousPlans, plan_id, true, data.plan_like_id);

      queryClient.invalidateQueries({ queryKey: ["plan"] });

      queryClient.setQueryData(["plan"], { currentPlan, plans: updatedPlans });
    },
    onError: (error, newUser, context) => {
      console.error('onError', error, newUser, context);
      // 변이 실패 시, 낙관적 업데이트 결과를 이전 사용자 목록으로 되돌리기!
      setIsLiked(!isLiked);
    },
  });

  return { isLiked, mutateLike };
};