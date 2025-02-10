import { useModal } from '@/ctx';
import { addAudio } from '@/utils/audioFile';
import api from '@/utils/axios';
import { AudioFileSystemType } from '@/utils/dataType';
import { moderateScale } from '@/utils/style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as ProgressBar from 'react-native-progress';
import { MediumText } from './text/MediumText';
import { RegularText } from './text/RegularText';

type InsertUserAudioRequestType = {
  lecture_audio_id: string;
  audio: string;
}[]

const { width: deviceWidth } = Dimensions.get('window');

export default function DownloadModal() {

  const queryClient = useQueryClient();

  const { planId, title, thumbnail, isLiked, auditDate, isModalVisible, hideModal } = useModal();
  const [progress, setProgress] = useState(0);
  const [totalAudioCount, setTotalAudioCount] = useState(0);
  const [completedDownloadCount, setCompletedDownloadCount] = useState(0);
  const downloadAbortController = useRef<AbortController | null>(null);

  const { data: audio, isSuccess } = useQuery<AudioFileSystemType>({
    queryKey: ["lecture/audio", planId],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.get<AudioFileSystemType>(`/lecture/audio?plan_id=${planId}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        }
      });

      return {
        ...res.data
      };
    },
    staleTime: 12 * 60 * 60 * 1000, // 12시간
    gcTime: 12 * 60 * 60 * 1000, // 12시간
    enabled: !!planId
  });

  const { mutate: insertUserAudioMutate } = useMutation({
    mutationFn: async (req: InsertUserAudioRequestType) => {
      if (!isModalVisible) return;

      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api({
        method: "POST",
        url: "/lecture/userAudio",
        data: { audios: req },
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        },
      });

      return res.data;
    },
    onSuccess: async () => {
      await AsyncStorage.setItem(`planAudit-${planId}`, JSON.stringify({ audit_updated_date: auditDate }));
      await queryClient.invalidateQueries({ queryKey: ["plan", planId] });
      await queryClient.invalidateQueries({ queryKey: ["lecture"] });
      setCompletedDownloadCount(prevCount => prevCount + 1);
      setProgress((prevProgress) => prevProgress + 1 / totalAudioCount);

      setTimeout(() => {
        hideModal();
        initValue();
        router.push({
          pathname: `/planDetail/[plan_id]`,
          params: {
            plan_id: planId,
            title: title,
            banner: thumbnail,
            isLiked: String(isLiked),
          },
        });
      }, 1000)
    },
    onError: (error, newUser, context) => {
      console.error('onError', error, newUser, context);
    },
  })

  useEffect(() => {
    async function downloadAudios() {
      downloadAbortController.current = new AbortController();
      const { signal } = downloadAbortController.current;
      if (isSuccess && !!audio) {
        const lectureData: InsertUserAudioRequestType = [];
        const _totalAudioCount = Object.values(audio).reduce((acc, { audios }) => acc + audios.length + 1 + 1, 0) // audios(length) + bgm(1) + mutation(1)
        setTotalAudioCount(_totalAudioCount);

        for (const [lectureId, { audios, bgm }] of Object.entries(audio)) {

          if (signal.aborted) break;

          // download bgm
          const bgmUri = await addAudio({ path: `${lectureId}/bgm`, audioUri: bgm });
          setCompletedDownloadCount(prevCount => {
            const newCount = prevCount + 1;
            setProgress(newCount / _totalAudioCount);
            return newCount;
          });

          lectureData.push({
            lecture_audio_id: lectureId,
            audio: bgmUri
          })

          await new Promise(resolve => setTimeout(resolve, 100)); // .1초 대기

          // download audios
          for (const { lecture_audio_id, uri } of audios) {
            if (signal.aborted) break;

            const audioUri = await addAudio({ path: `${lectureId}/audios/${lecture_audio_id}`, audioUri: uri });
            setCompletedDownloadCount(prevCount => {
              const newCount = prevCount + 1;
              setProgress(newCount / _totalAudioCount);
              return newCount;
            });

            await new Promise(resolve => setTimeout(resolve, 100)); // .1초 대기

            lectureData.push({
              lecture_audio_id,
              audio: audioUri
            })
          }
        }

        if (signal.aborted) return;

        insertUserAudioMutate(lectureData);
      }
    }

    if (isModalVisible) {
      downloadAudios();
    }

    return () => {
      initValue();
    }
  }, [isSuccess])

  const initValue = () => {
    setProgress(0);
    setTotalAudioCount(0);
    setCompletedDownloadCount(0);
  }

  const onClickCancel = () => {
    if (downloadAbortController.current) {
      downloadAbortController.current.abort();
    }

    initValue();
    hideModal();
  }

  return (
    <Modal
      transparent={true}
      visible={isModalVisible}
      onRequestClose={hideModal}
    >
      <View style={styles.modalBackground}>
        <View style={[styles.modalContainer, { width: deviceWidth - 20 }]}>
          <MediumText
            fontSize={16}
            lineHeight={27}
            textAlign='left'
          >
            오디오 파일을 다운로드중입니다...
          </MediumText>

          {/* loading state */}
          <View style={{ marginVertical: moderateScale(8) }}>
            <ProgressBar.Bar color='#4F5FFF' progress={progress} width={null} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <RegularText>
                {Math.floor((completedDownloadCount / (totalAudioCount ? totalAudioCount : 1)) * 100)}%
              </RegularText>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={onClickCancel}>
              <MediumText
                fontSize={16}
                color='#4F5FFF'
              >
                취소하기
              </MediumText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },
  modalContainer: {
    padding: moderateScale(18),
    backgroundColor: '#3A3A3B',
    borderRadius: 10,
  },
});