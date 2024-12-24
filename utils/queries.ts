import api from '@/utils/axios';
import { LectureResponseType, PlanDetailResponseType, PlanResponseType } from '@/utils/dataType';
import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

export const usePlanListQuery = () => {
  return useQuery<PlanResponseType>({
    queryKey: ["plan"],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.get<PlanResponseType>("/plan", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        }
      });

      return res.data;
    },
    select: (data) => {
      const { plans } = data;
      const normalizedPlans = plans.map((plan) => {
        return {
          ...plan,
          is_liked: Boolean(Number(plan.is_liked))
        }
      });
      return { ...data, plans: normalizedPlans };
    },
    placeholderData: {
      currentPlan: null,
      plans: []
    },
    staleTime: 12 * 60 * 60 * 1000, // 12시간
    gcTime: 12 * 60 * 60 * 1000, // 12시간
  });
};

export const usePlanQuery = ({ plan_id }: { plan_id: string }) => {
  return useQuery<PlanDetailResponseType>({
    queryKey: ["plan", plan_id],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.get<PlanDetailResponseType>(`/plan?plan_id=${plan_id}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        }
      });

      return {
        ...res.data,
        plan: {
          ...res.data.plan,
          is_liked: Boolean(Number(res.data.plan.is_liked))
        }
      };
    },
    staleTime: 12 * 60 * 60 * 1000, // 12시간
    gcTime: 12 * 60 * 60 * 1000, // 12시간
  });
};

export const useLectureQuery = ({ lecture_id }: { lecture_id: string }) => {
  return useQuery<LectureResponseType>({
    queryKey: ["lecture", lecture_id],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.get<LectureResponseType>(`/lecture?lecture_id=${lecture_id}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        }
      });

      const data = {
        ...res.data,
        lecture: {
          ...res.data.lecture,
          time: Number(res.data.lecture.time)
        }
      }

      return data;
    },
    staleTime: 12 * 60 * 60 * 1000, // 12시간
    gcTime: 12 * 60 * 60 * 1000, // 12시간
  });
};