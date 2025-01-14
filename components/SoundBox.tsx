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
  bgm: string;
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
    bgm,
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
        const fileInfo = await FileSystem.getInfoAsync(bgm);

        if (!fileInfo.exists) {
          // TODO go to plan page and download audio
          throw new Error('BGM file does not exist');
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: fileInfo.uri },
          {
            shouldPlay: true,
            isLooping: true,
          }
        );
        bgmRef.current = sound;

        // Todo play audio when duration equals start_time
      } catch (e) {
        console.log(e);
        Alert.alert('오류', '파일을 다시 다운로드 해주세요.');
        await AsyncStorage.removeItem(`planAudit-${plan_id}`);
        router.replace('/plan');
      }
    }

    // have to unload sound when component is unmounted
    const unloadSound = async () => {
      if (bgmRef.current) {
        await bgmRef.current.unloadAsync();
      }
    }

    if (!!bgm && bgm !== '') {
      loadSound();
    }

    return () => {
      unloadSound();
    };
  }, [bgm]);

  // SET AUDIO
  useEffect(() => {
    const loadAudios = async () => {
      for (const audio of audios) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audio.audio },
          { shouldPlay: false, isLooping: false }
        );
        audioRefs.current[audio.lecture_audio_id] = sound;
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

  // Play audio when elapsedTime equals start_time
  useEffect(() => {
    const playAudio = async () => {
      for (const audio of audios) {
        if (audio.start_time === elapsedTime && repeatCount === 0) {
          const sound = audioRefs.current[audio.lecture_audio_id];
          if (sound) {
            if (currentAudioRef.current && currentAudioRef.current !== audio.lecture_audio_id) {
              const currentSound = audioRefs.current[currentAudioRef.current];
              if (currentSound) {
                await currentSound.stopAsync();
              }
            }
            currentAudioRef.current = audio.lecture_audio_id;

            // Reduce BGM volume
            if (bgmRef.current) {
              await bgmRef.current.setVolumeAsync(0.3);
            }

            // Play sound and restore BGM volume when finished
            sound.setOnPlaybackStatusUpdate(async (status) => {
              if (status.isLoaded && status.didJustFinish) {
                if (bgmRef.current) {
                  await bgmRef.current.setVolumeAsync(1.0);
                }
              }
            });

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

      if (currentAudioRef.current) {
        const currentSound = audioRefs.current[currentAudioRef.current];
        if (currentSound) {
          await currentSound.pauseAsync();
        }
      }

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
          currentAudioRef.current = audio.lecture_audio_id;
        }
      }
    }

    playAudio();
  }, [userAdjustedTime])

  return null;
}