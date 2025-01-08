import { useModal } from '@/ctx';
import { addAudio } from '@/utils/audioFile';
import api from '@/utils/axios';
import { AudioFileSystemType } from '@/utils/dataType';
import { moderateScale } from '@/utils/style';
import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect } from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as ProgressBar from 'react-native-progress';
import { MediumText } from './text/MediumText';
import { RegularText } from './text/RegularText';

const { width: deviceWidth } = Dimensions.get('window');

export default function DownloadModal() {
  const { planId, auditDate, isModalVisible, hideModal } = useModal();

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

  useEffect(() => {
    async function downloadAudios() {
      if (isSuccess && !!audio) {
        Object.entries(audio).forEach(async ([lectureId, { audios, bgm }]) => {
          console.log("start download bgm")

          await addAudio({ path: `${lectureId}/bgm.mp3`, audio: bgm });

          console.log("end download bgm")

          console.log("------")

          console.log("start download audios")

          audios.forEach(async ({ lecture_audio_id, uri }, index) => {
            console.log("start download audio: ", index);
            await addAudio({ path: `${lectureId}/audios/${lecture_audio_id}`, audio: uri });
            console.log("end download audio: ", index);
            console.log("------")
          });

          console.log("end download audios")

          console.log("------")

          console.log('save to local storage');
          await SecureStore.setItemAsync(`planAudit-${planId}`, JSON.stringify({ audit_updated_date: auditDate }));
          await SecureStore.setItemAsync(`lecture-${lectureId}`, JSON.stringify({
            bgm: `${lectureId}/bgm.mp3`,
            audios: audios.map(({ lecture_audio_id, caption, start_time }) => ({
              caption,
              start_time,
              uri: `${lectureId}/audios/${lecture_audio_id}`,
            })) || []
          }));

          console.log('end save to local storage');
        });
      }
    }

    downloadAudios();
  }, [isSuccess])

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
            다운로드중입니다...
          </MediumText>

          {/* loading state */}
          <View style={{ marginVertical: moderateScale(8) }}>
            <ProgressBar.Bar color='#4F5FFF' progress={0.4} width={null} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <RegularText>
                0/5
              </RegularText>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={hideModal}>
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