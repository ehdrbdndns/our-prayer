import { LectureAudioType } from "@/utils/dataType";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import * as FileSystem from 'expo-file-system';
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";

type SoundBoxProps = {
  plan_id: string;
  lecture_id: string;
  elapsedTime: number;
  userAdjustedTime: number;
  audios: LectureAudioType[];
  repeatCount: number;
  isMute: boolean;
  isBgmMute: boolean;
  isPlaying: boolean;
}

export default function SoundBox(props: SoundBoxProps) {

  const {
    plan_id,
    lecture_id,
    elapsedTime,
    audios,
    repeatCount,
    isMute,
    isBgmMute,
    isPlaying,
    userAdjustedTime
  } = props;

  const bgmRef = useRef<Sound>();
  const currentAudioRef = useRef<string>();
  const audioRefs = useRef<{ [lecture_audio_id: string]: Audio.Sound }>({});

  // SET BGM
  useEffect(() => {
    // Load sound
    const loadSound = async () => {
      try {
        const bgm = await AsyncStorage.getItem(`audio-${lecture_id}`);

        if (bgm === null) {
          throw new Error('BGM file does not exist of async storage');
        }

        const fileInfo = await FileSystem.getInfoAsync(bgm);

        if (!fileInfo.exists) {
          // TODO go to plan page and download audio
          throw new Error('BGM file does not exist of FileSystem');
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: fileInfo.uri },
          {
            shouldPlay: true,
            isLooping: true,
          }
        );
        bgmRef.current = sound;
      } catch (e) {
        console.error(e);
        Alert.alert('에러!', '배경음악에 문제가 발생하였습니다. 파일을 다시 다운로드 해주세요.');
        await AsyncStorage.removeItem(`planAudit-${plan_id}`);
        router.dismissTo('/plan');
      }
    }

    // have to unload sound when component is unmounted
    const unloadSound = async () => {
      if (bgmRef.current) {
        await bgmRef.current.unloadAsync();
      }
    }

    if (!!lecture_id && lecture_id !== '') {
      loadSound();
    }

    return () => {
      unloadSound();
    };
  }, [lecture_id]);

  // SET AUDIO
  useEffect(() => {
    const loadAudios = async () => {
      try {
        for (const { lecture_audio_id } of audios) {
          const audioUri = await AsyncStorage.getItem(`audio-${lecture_audio_id}`);

          if (audioUri === null) {
            throw new Error('Audio file does not exist of async storage');
          }

          const fileInfo = await FileSystem.getInfoAsync(audioUri);

          if (!fileInfo.exists) {
            // TODO go to plan page and download audio
            throw new Error('Audio file does not exist of FileSystem');
          }

          const { sound } = await Audio.Sound.createAsync(
            { uri: audioUri },
            { shouldPlay: false, isLooping: false }
          );
          audioRefs.current[lecture_audio_id] = sound;
        }
      } catch (e) {
        console.error(e);
        Alert.alert('에러!', '오디오 파일에 문제가 발생하였습니다. 다시 다운로드 해주세요.');
        await AsyncStorage.removeItem(`planAudit-${plan_id}`);
        router.dismissTo('/plan');
      }
    };

    loadAudios();

    return () => {
      Object.values(audioRefs.current).forEach((sound) => {
        sound.unloadAsync();
      });
    };
  }, [audios]);

  // Mute audio and bgm by isMute
  useEffect(() => {

    if (isMute || isBgmMute) {
      bgmRef.current?.pauseAsync();
    } else {
      bgmRef.current?.playAsync();
    }

    if (isMute) {
      if (currentAudioRef.current) {
        audioRefs.current[currentAudioRef.current]?.pauseAsync();
      }
    } else {
      if (currentAudioRef.current) {
        audioRefs.current[currentAudioRef.current]?.playAsync();
      }
    }
  }, [isMute, isBgmMute]);

  // Play audio when elapsedTime equals each audio's start_time
  useEffect(() => {
    const playAudio = async () => {
      for (const audio of audios) {
        if (audio.start_time === elapsedTime && repeatCount === 0) {
          const sound = audioRefs.current[audio.lecture_audio_id];
          if (sound) {
            // 기존에 실행중이던 오디오 파일 정지
            if (currentAudioRef.current && currentAudioRef.current !== audio.lecture_audio_id) {
              const currentSound = audioRefs.current[currentAudioRef.current];
              if (currentSound) {
                await currentSound.stopAsync();
              }
            }

            // 앞으로 실행할 오디오 파일 설정
            currentAudioRef.current = audio.lecture_audio_id;

            // 실행할 오디오 완료시 배경 음악 볼륨 조절
            sound.setOnPlaybackStatusUpdate(async (status) => {
              if (status.isLoaded && status.didJustFinish) {
                if (bgmRef.current) {
                  await bgmRef.current.setVolumeAsync(1.0);
                }
              }
            });

            // 배경음악 볼륨 조절
            if (bgmRef.current) {
              await bgmRef.current.setVolumeAsync(0.2);
            }

            await sound.playAsync();
          }
        }
      }
    };

    playAudio();
  }, [elapsedTime]);

  // Play audio when userAdjustedTime is changed
  useEffect(() => {
    async function playAudio() {

      // 현재 진행중인 오디오 정지
      if (currentAudioRef.current) {
        const currentSound = audioRefs.current[currentAudioRef.current];
        if (currentSound) {
          await currentSound.pauseAsync();
        }
      }

      // 전체 오디오 파일을 확인하면서 사용자가 조정한 시간에 맞는 오디오를 찾아 재생
      let hasAudio = false;
      for (const audio of audios) {
        const sound = audioRefs.current[audio.lecture_audio_id];
        const status = await sound.getStatusAsync();

        if (
          status.isLoaded && status.durationMillis !== undefined
          && audio.start_time <= elapsedTime
          && audio.start_time + status.durationMillis / 1000 > elapsedTime
        ) {
          await sound.setPositionAsync((elapsedTime - audio.start_time) * 1000);

          if (isPlaying) {
            await sound.playAsync();
          } else {
            await sound.pauseAsync();
          }

          hasAudio = true;
          currentAudioRef.current = audio.lecture_audio_id;
        }
      }

      if (!hasAudio) {
        // 실행중인 오디오가 없으면 배경음악 풀 볼륨으로 조절
        if (bgmRef.current) {
          await bgmRef.current.setVolumeAsync(1);
        }
      } else {
        // 실행중인 오디오가 있으면 배경음악 0.2 볼륨으로 조절
        if (bgmRef.current) {
          await bgmRef.current.setVolumeAsync(0.2);
        }
      }
    }

    playAudio();
  }, [userAdjustedTime])

  return null;
}