import { ASYNC_AUDIO_KEY } from "@/storage/asyncStorageKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import * as FileSystem from 'expo-file-system';
import { LectureAudioType } from "../utils/dataType";

type AudioMap = { [startTime: number]: LectureAudioType };

export default class Amp {
  // lecture_id
  private lectureId: string;

  // audios
  private audios: LectureAudioType[];
  private audiosMap: { [startTime: number]: LectureAudioType };

  // bgm
  private bgmSound?: Sound;
  private isBgmMute: boolean;

  // voice
  private voiceSoundList: { [lectureAudioId: string]: Sound };

  // currnet voice sound
  private currentVoiceSound: Sound | null;

  private isPlaying: boolean;

  constructor(lectureId: string, audios: LectureAudioType[], option: { isPlaying?: boolean }) {
    this.lectureId = lectureId;
    this.audios = audios;
    this.audiosMap = audios.reduce((map: AudioMap, audio) => {
      map[audio.start_time] = audio;
      return map;
    }, {});
    this.isPlaying = option.isPlaying ?? true;

    this.voiceSoundList = {};
    this.isBgmMute = false;
    this.currentVoiceSound = null;
  }

  private async loadAudio(audioKey: string, option: { shouldPlay: boolean, isLooping: boolean }) {
    try {
      const audioUri = await AsyncStorage.getItem(audioKey);

      if (audioUri === null) {
        throw new Error(JSON.stringify({ code: 404, message: 'Audio file does not exist of async storage' }));
      }

      const fileInfo = await FileSystem.getInfoAsync(audioUri);

      if (!fileInfo.exists) {
        // TODO go to plan page and download audio
        throw new Error(JSON.stringify({ code: 404, message: 'Audio file does not exist of FileSystem' }));
      }

      const { sound } = await Audio.Sound.createAsync({ uri: audioUri }, option);

      return sound;
    } catch (e) {
      console.error(e);
      throw new Error(JSON.stringify({ code: 500, message: 'Failed to load audio' }));
    }
  }

  private async stopCurrentVoice() {
    if (this.currentVoiceSound) {
      await this.currentVoiceSound.stopAsync();
      this.currentVoiceSound = null;
    }
  }

  private async pauseCurrentVoice() {
    if (this.currentVoiceSound) {
      await this.currentVoiceSound.pauseAsync();
    }
  }

  /**
   * bgm과 voice 파일을 로드합니다.
   * @returns Promise<Boolean> 
   */
  async turnOn(): Promise<Boolean> {
    try {
      // set bgm
      const bgmKey = ASYNC_AUDIO_KEY(this.lectureId);
      this.bgmSound = await this.loadAudio(bgmKey, { shouldPlay: true, isLooping: true });

      // set voice
      for (const audio of this.audios) {
        const { lecture_audio_id } = audio;
        const audioKey = ASYNC_AUDIO_KEY(lecture_audio_id);
        const sound = await this.loadAudio(audioKey, { shouldPlay: false, isLooping: false });

        sound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.isLoaded && status.didJustFinish) {
            if (this.bgmSound) {
              await this.bgmSound.setVolumeAsync(1.0);
            }
          }
        });
        this.voiceSoundList[lecture_audio_id] = sound;
      }

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /**
   * bgm과 voice 파일을 언로드합니다.
   */
  async turnOff() {
    if (this.bgmSound) {
      await this.bgmSound.unloadAsync();
    }

    for (const audio of this.audios) {
      const { lecture_audio_id } = audio;
      const sound = this.voiceSoundList[lecture_audio_id];
      if (sound) {
        await sound.unloadAsync();
      }
    }
  }

  /**
   * 음성 파일을 실행합니다.
   * @param elapsedTime 초단위
   */
  async playVoiceBy(elapsedTime: number) {
    // play voice when elapsedTime is equal of voice
    if (!!this.audiosMap[elapsedTime]) {
      // pause current voice
      await this.stopCurrentVoice();

      this.bgmSound?.setVolumeAsync(0.2);

      const { lecture_audio_id } = this.audiosMap[elapsedTime];
      const sound = this.voiceSoundList[lecture_audio_id];

      if (sound) {
        await sound.playAsync();
        this.currentVoiceSound = sound;
      }
    }
  }

  async resumeAudio() {
    if (this.currentVoiceSound) {
      await this.currentVoiceSound.playAsync();
    }

    if (this.bgmSound && !this.isBgmMute) {
      await this.bgmSound.playAsync();
    }

    this.isPlaying = true;
  }

  /**
   * bgm을 실행합니다.
   */
  async playBgm() {
    if (this.bgmSound) {
      await this.bgmSound.playAsync();
      this.isBgmMute = false;
    }
  }

  /**
   * bgm을 일시정지합니다.
   */
  async pauseBgm() {
    if (this.bgmSound) {
      await this.bgmSound.pauseAsync();
      this.isBgmMute = true;
    }
  }

  /**
   * 모든 음성 파일을 일시정지합니다.
   */
  async pause() {
    // pause bgm
    if (this.bgmSound) {
      await this.bgmSound.pauseAsync();
    }

    // pause playing voice
    await this.pauseCurrentVoice();

    this.isPlaying = false;
  }

  async adjustVoiceBy(elapsedTime: number) {
    // pause current voice
    await this.stopCurrentVoice();

    // 전체 오디오 파일을 확인하면서 사용자가 조정한 시간에 맞는 오디오를 찾아 재생
    let hasAudio = false;
    for (const { lecture_audio_id, start_time } of this.audios) {

      const sound = this.voiceSoundList[lecture_audio_id];
      const status = await sound.getStatusAsync();

      if (!status.isLoaded || !status.durationMillis) {
        continue;
      }

      if (
        start_time <= elapsedTime
        && elapsedTime < (start_time + status.durationMillis / 1000)
      ) {
        await sound.setPositionAsync((elapsedTime - start_time) * 1000);

        if (this.isPlaying) {
          await sound.playAsync();
        } else {
          await sound.pauseAsync();
        }

        hasAudio = true;
        this.currentVoiceSound = sound;
      }
    }

    if (!hasAudio) {
      // 실행중인 오디오가 없으면 배경음악 풀 볼륨으로 조절
      if (this.bgmSound) {
        await this.bgmSound.setVolumeAsync(1);
      }
    } else {
      // 실행중인 오디오가 있으면 배경음악 0.2 볼륨으로 조절
      if (this.bgmSound) {
        await this.bgmSound.setVolumeAsync(0.2);
      }
    }
  }
}