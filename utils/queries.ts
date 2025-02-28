import api from '@/utils/axios';
import { BibleType, HistoryType, LectureResponseType, PlanDetailResponseType, PlanResponseType, QuestionReplyType, QuestionType, UserType } from '@/utils/dataType';
import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';


export const usePlanListQuery = () => {
  const { isConnected } = useNetInfo();

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
    staleTime: 2 * 60 * 60 * 1000, // 2시간
    gcTime: 2 * 60 * 60 * 1000, // 2시간
    enabled: !!isConnected
  });
};

export const usePlanQuery = ({ plan_id }: { plan_id: string }) => {
  const { isConnected } = useNetInfo();

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
    staleTime: 2 * 60 * 60 * 1000, // 2시간
    gcTime: 2 * 60 * 60 * 1000, // 2시간
    enabled: !!isConnected
  });
};

export const useLectureQuery = ({ lecture_id }: { lecture_id: string }) => {
  return useQuery<LectureResponseType | null>({
    queryKey: ["lecture", lecture_id],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api<LectureResponseType>({
        method: "POST",
        url: "/lecture",
        data: {
          lecture_id
        },
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        },
      });

      const data = {
        ...res.data,
        lecture: {
          ...res.data.lecture,
          time: Number(res.data.lecture.time)
        },
        lectureAudios: res.data.lectureAudios.map((row) => ({
          ...row,
          start_time: Number(row.start_time)
        }))
      }

      return data;
    },
    // enabled: !!isConnected, 다시 네트워크가 연결될 시 다시 요청되는 행위를 막기 위해 주석 처리
  });
};

export const useHistoryQuery = (historyRange?: number) => {
  const { isConnected } = useNetInfo();
  return useQuery<HistoryType[]>({
    queryKey: ["history"],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.get<HistoryType[]>(`/history${historyRange !== undefined ? `?historyRange=${historyRange}` : ''}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        }
      });

      return res.data;
    },
    placeholderData: [],
    staleTime: 2 * 60 * 60 * 1000, // 2시간
    gcTime: 2 * 60 * 60 * 1000, // 2시간
    enabled: !!isConnected
  });
}

export const useHistoryDetailQuery = (history_id: string) => {
  const { isConnected } = useNetInfo();
  return useQuery<HistoryType>({
    queryKey: ["historyDetail", history_id],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.get<HistoryType>(
        `/history/detail?prayer_history_id=${history_id}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "RefreshToken": refreshToken
          }
        });

      return res.data;
    },
    enabled: !!isConnected
  })
}

export const useQuestionDetailQuery = (question_id: string) => {
  const { isConnected } = useNetInfo();
  return useQuery<QuestionType>({
    queryKey: ["question", question_id],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.get<QuestionType>(`/question?question_id=${question_id}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        }
      });
      return res.data;
    },
    staleTime: 2 * 60 * 60 * 1000, // 2시간
    gcTime: 2 * 60 * 60 * 1000, // 2시간
    enabled: !!question_id
  });
}

export const useQuestionQuery = () => {
  return useQuery<QuestionType[]>({
    queryKey: ["question"],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.get<QuestionType[]>(`/question`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        }
      });
      return res.data;
    },
    placeholderData: [],
    staleTime: 2 * 60 * 60 * 1000, // 2시간
    gcTime: 2 * 60 * 60 * 1000, // 2시간
  });
}

export const useBibleQuery = () => {
  const { isConnected } = useNetInfo();
  return useQuery<BibleType>({
    queryKey: ["bible"],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.get<BibleType>("/bible", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        }
      });

      return res.data;
    },
    placeholderData: {
      title: "마가복음 11:24",
      content: "그러므로 내가 너희에게 말하노니 무엇이든지 기도하고 구하는 것은 받은 줄로 믿으라 그리하면 너희에게 그대로 되리라"
    },
    staleTime: 2 * 60 * 60 * 1000, // 2시간
    gcTime: 2 * 60 * 60 * 1000, // 2시간,
    enabled: !!isConnected
  });
}

export const useUserQuery = ({
  onSuccess
}: {
  onSuccess: (isAlarm: boolean) => void
}) => {
  const { isConnected } = useNetInfo();
  return useQuery<UserType>({
    queryKey: ["user"],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.get<UserType>(`/user`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        }
      });

      onSuccess(Boolean(res.data.alarm));

      return res.data;
    },
    staleTime: 2 * 60 * 60 * 1000, // 2시간
    gcTime: 2 * 60 * 60 * 1000, // 2시간,
    enabled: !!isConnected
  });
}

export const useReplyQuery = (question_id: string) => {
  return useQuery<QuestionReplyType[]>({
    queryKey: ["reply", question_id],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.get<QuestionReplyType[]>(`/question/reply?question_id=${question_id}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        }
      });
      return res.data;
    },
    placeholderData: [],
    staleTime: 60 * 60 * 1000, // 1시간
    gcTime: 60 * 60 * 1000, // 1시간
    enabled: !!question_id
  });
}