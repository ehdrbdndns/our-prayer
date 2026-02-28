import api from '@/utils/axios';
import { HistoryType, PlanResponseType, PlanType, PrayerTopicPriority, PrayerTopicType, QuestionType } from '@/utils/dataType';
import { createPrayerTopic, deletePrayerTopic, restorePrayerTopic, togglePrayerTopicChecked, updatePrayerTopic } from '@/utils/prayerTopicStorage';
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

export const useHistoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lecture_id, duration, note
    }: {
      lecture_id: string, duration: string, note: string
    }) => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api<{ message: string }>({
        method: "POST",
        url: "/history",
        data: {
          lecture_id: lecture_id,
          duration: duration,
          note: note
        },
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        },
      });

      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["history"] });
      await queryClient.invalidateQueries({ queryKey: ["plan"] });
    },
    onError: (error, newUser, context) => {
      console.error('onError', error, newUser, context);
    },
  })
}

export const useUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name, alarm, expoPushToken
    }: {
      name?: string, alarm?: boolean, expoPushToken?: string
    }) => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api<{ message: string }>({
        method: "PUT",
        url: "/user",
        data: {
          name: name,
          alarm: alarm,
          expoPushToken: expoPushToken
        },
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        },
      });

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error, newUser, context) => {
      console.error('onError', error, newUser, context);
    },
  })
}

export const useDeleteQuestionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (question_id: string) => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api<{ message: string }>({
        method: "DELETE",
        url: "/question",
        data: {
          question_id
        },
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        },
      });
      return res.data;
    },
    onMutate: async (question_id: string) => {
      await queryClient.cancelQueries({ queryKey: ["question"] });

      const previousValue = queryClient.getQueryData<QuestionType[]>(["question"]);
      if (previousValue) {
        queryClient.setQueryData<QuestionType[]>(["question"], previousValue.filter((question) => question.question_id !== question_id));
      }

      return { previousValue };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question"] });
    },
    onError: (error, newUser, context) => {
      console.error('onError', error, newUser, context);

      if (context) {
        queryClient.setQueryData<QuestionType[]>(["question"], context.previousValue);
      }
    },
  })
}

export const useHistoryDetailMutation = ({ onSuccess, onError }: {
  onSuccess: (data: HistoryType[]) => void,
  onError: () => void
}) => {
  return useMutation({
    mutationFn: async (prayer_history_id_list: string[]) => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api<HistoryType[]>({
        method: "POST",
        url: "/history/detail",
        data: {
          prayer_history_id_list
        },
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        },
      });

      return res.data.sort((a, b) => b.created_date - a.created_date);
    },
    onSuccess,
    onError,
  })
}

export const useDeleteUserMutation = ({ onSuccess, onError }: {
  onSuccess: () => void,
  onError: () => void
}) => {
  return useMutation({
    mutationFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api<{ message: string }>({
        method: "DELETE",
        url: "/user",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        },
      });

      return res.data;
    },
    onSuccess,
    onError: (error, newUser, context) => {
      console.error('onError', error, newUser, context);
      onError();
    },
  })
}

export const useUpdateHistoryMutation = ({
  params,
  onSuccess,
  onError
}: {
  params: {
    history_id: string,
    note: string
  },
  onSuccess: () => void,
  onError: () => void
}) => {
  return useMutation({
    mutationFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api<HistoryType[]>({
        method: "PUT",
        url: "/history",
        data: {
          prayer_history_id: params.history_id,
          note: params.note
        },
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        },
      });

      return res.data;
    },
    onSuccess: onSuccess,
    onError: (error, newUser, context) => {
      console.error('onError', error, newUser, context);
      onError();
    },
  });
}

export const useDeleteHistoryMutation = ({
  params,
  onSuccess,
  onError
}: {
  params: {
    history_id: string,
  },
  onSuccess: () => void,
  onError: () => void
}) => {
  return useMutation({
    mutationFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api<HistoryType[]>({
        method: "DELETE",
        url: "/history/detail",
        data: {
          prayer_history_id: params.history_id,
        },
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        },
      });

      return res.data;
    },
    onSuccess,
    onError: (error, newUser, context) => {
      console.error('onError', error, newUser, context);
      onError();
    },
  })
}

export const useInsertQuestionMutation = ({
  onSuccess,
  onMutate,
  onError
}: {
  onSuccess: () => Promise<void>,
  onMutate: (content: string) => Promise<{ previousValue: QuestionType[] | undefined; }>,
  onError: (context: { previousValue: QuestionType[] | undefined }) => Promise<void>
}) => {
  return useMutation({
    mutationFn: async (content: string) => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.post<{ message: string }>(`/question`, {
        content,
      }, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        }
      });
      return res.data;
    },
    onMutate, onSuccess,
    onError: (error, newQuestion, context) => {
      console.error('onError', error, newQuestion, context);

      if (context) {
        onError(context);
      }
    },
  })
}

export const useUpdateQuestionMutation = ({
  onSuccess,
  onError
}: {
  onSuccess: () => Promise<void>,
  onError: () => Promise<void>
}) => {
  return useMutation({
    mutationFn: async ({
      question_id,
      content
    }: {
      question_id: string;
      content: string
    }) => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api<HistoryType[]>({
        method: "PUT",
        url: "/question",
        data: {
          question_id,
          content,
        },
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        },
      });

      return res.data;
    },
    onSuccess,
    onError: (error, newUser, context) => {
      console.error('onError', error, newUser, context);
      onError();
    },
  })
}

export const useCreatePrayerTopicMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      priority,
    }: {
      content: string;
      priority: PrayerTopicPriority;
    }) => {
      return await createPrayerTopic({ content, priority });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['prayerTopic'] });
      await queryClient.invalidateQueries({ queryKey: ['prayerTopicCheck'] });
    },
    onError: (error, newTopic, context) => {
      console.error('onError', error, newTopic, context);
    },
  });
}

export const useUpdatePrayerTopicMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      prayer_topic_id,
      content,
      priority,
    }: {
      prayer_topic_id: string;
      content: string;
      priority: PrayerTopicPriority;
    }) => {
      return await updatePrayerTopic({ prayer_topic_id, content, priority });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['prayerTopic'] });
    },
    onError: (error, newTopic, context) => {
      console.error('onError', error, newTopic, context);
    },
  });
}

export const useDeletePrayerTopicMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prayer_topic_id: string) => {
      return await deletePrayerTopic(prayer_topic_id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['prayerTopic'] });
      await queryClient.invalidateQueries({ queryKey: ['prayerTopicCheck'] });
    },
    onError: (error, topicId, context) => {
      console.error('onError', error, topicId, context);
    },
  });
}

export const useTogglePrayerTopicCheckMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      prayer_topic_id,
      checked,
      dateKey,
    }: {
      prayer_topic_id: string;
      checked: boolean;
      dateKey?: string;
    }) => {
      return await togglePrayerTopicChecked({ prayer_topic_id, checked, dateKey });
    },
    onSuccess: async (_, variables) => {
      if (variables.dateKey) {
        await queryClient.invalidateQueries({ queryKey: ['prayerTopicCheck', variables.dateKey] });
      }
      await queryClient.invalidateQueries({ queryKey: ['prayerTopicCheck'] });
    },
    onError: (error, params, context) => {
      console.error('onError', error, params, context);
    },
  });
}

export const useRestorePrayerTopicMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      topic,
      checked,
      dateKey,
    }: {
      topic: PrayerTopicType;
      checked?: boolean;
      dateKey?: string;
    }) => {
      return await restorePrayerTopic({ topic, checked, dateKey });
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['prayerTopic'] });
      if (variables.dateKey) {
        await queryClient.invalidateQueries({ queryKey: ['prayerTopicCheck', variables.dateKey] });
      }
      await queryClient.invalidateQueries({ queryKey: ['prayerTopicCheck'] });
    },
    onError: (error, params, context) => {
      console.error('onError', error, params, context);
    },
  });
}
