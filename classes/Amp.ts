import { ASYNC_AUDIO_KEY } from "@/storage/asyncStorageKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import * as FileSystem from 'expo-file-system/legacy';
import { LectureAudioType } from "../utils/dataType";

type AudioMap = { [startTime: number]: LectureAudioType };
type PlaybackOption = { shouldPlay: boolean; isLooping: boolean };
type EffectPlaybackOption = {
  restart?: boolean;
  bgmVolumeWhilePlaying?: number;
  restoreBgmVolume?: number;
};

export type AudioSource =
  | { kind: "storage-key"; storageKey: string }
  | { kind: "module"; module: number };

type AmpOption = {
  isPlaying?: boolean;
  bgmSource?: AudioSource;
  effectSources?: Record<string, AudioSource>;
};

export default class Amp {
  // lecture_id
  private lectureId: string;

  // audios
  private audios: LectureAudioType[];
  private audiosMap: { [startTime: number]: LectureAudioType };

  // bgm
  private bgmSound?: Sound;
  private silentSound?: Sound;
  private isBgmOn: boolean;
  private bgmSource?: AudioSource;

  // voice
  private voiceSoundList: { [lectureAudioId: string]: Sound };

  // effects
  private effectSources: Record<string, AudioSource>;
  private effectSoundList: { [effectId: string]: Sound };
  private effectPlayingMap: { [effectId: string]: boolean };
  private effectRestoreBgmVolumeMap: { [effectId: string]: number | null };

  // currnet voice sound
  private currentVoiceSound: Sound | null;

  private isPlaying: boolean;
  private bgmVolume: number;

  private scheduleIdList: NodeJS.Timeout[] = [];

  constructor(lectureId: string, audios: LectureAudioType[], option: AmpOption = {}) {
    this.lectureId = lectureId;
    this.audios = audios;
    this.audiosMap = audios.reduce((map: AudioMap, audio) => {
      map[audio.start_time] = audio;
      return map;
    }, {});
    this.isPlaying = option.isPlaying ?? true;
    this.bgmSource = option.bgmSource;
    this.effectSources = option.effectSources ?? {};

    this.voiceSoundList = {};
    this.effectSoundList = {};
    this.effectPlayingMap = {};
    this.effectRestoreBgmVolumeMap = {};
    this.isBgmOn = true;
    this.currentVoiceSound = null;
    this.bgmVolume = 1.0;
  }

  private async loadAudioFromStorageKey(storageKey: string, option: PlaybackOption) {
    try {
      const audioUri = await AsyncStorage.getItem(storageKey);

      if (audioUri === null) {
        throw new Error(JSON.stringify({ code: 404, message: 'Audio file does not exist of async storage' }));
      }

      const fullFileUri = FileSystem.documentDirectory + audioUri;
      const fileInfo = await FileSystem.getInfoAsync(fullFileUri);

      if (!fileInfo.exists) {
        // TODO go to plan page and download audio
        throw new Error(JSON.stringify({ code: 404, message: 'Audio file does not exist of FileSystem' }));
      }

      const { sound } = await Audio.Sound.createAsync({ uri: fullFileUri }, option);

      return sound;
    } catch (e) {
      console.error(e);
      throw new Error(JSON.stringify({ code: 500, message: 'Failed to load audio' }));
    }
  }

  private async loadAudioFromSource(source: AudioSource, option: PlaybackOption) {
    if (source.kind === "module") {
      const { sound } = await Audio.Sound.createAsync(source.module, option);
      return sound;
    }

    return this.loadAudioFromStorageKey(source.storageKey, option);
  }

  private normalizeVolume(volume: number) {
    return Math.max(0, Math.min(1, volume));
  }

  private async setBgmVolume(volume: number) {
    const safeVolume = this.normalizeVolume(volume);
    this.bgmVolume = safeVolume;
    if (this.bgmSound) {
      await this.bgmSound.setVolumeAsync(safeVolume);
    }
  }

  private async restoreEffectBgmVolume(effectId: string) {
    const restoreBgmVolume = this.effectRestoreBgmVolumeMap[effectId];
    this.effectRestoreBgmVolumeMap[effectId] = null;

    if (restoreBgmVolume === null || restoreBgmVolume === undefined) {
      return;
    }

    await this.setBgmVolume(restoreBgmVolume);
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
    // Turn off existing sounds before turning on new ones
    await this.turnOff();

    try {
      // set bgm
      const bgmSource = this.bgmSource ?? { kind: "storage-key", storageKey: ASYNC_AUDIO_KEY(this.lectureId) };
      this.bgmSound = await this.loadAudioFromSource(bgmSource, { shouldPlay: true, isLooping: true });
      this.bgmVolume = 1.0;

      // set silent audio
      const { sound: silentSound } = await Audio.Sound.createAsync(
        require('../assets/audio/silent.mp3'),
        { shouldPlay: false, isLooping: true }
      );
      this.silentSound = silentSound;

      // set voice
      for (const audio of this.audios) {
        const { lecture_audio_id } = audio;
        const source: AudioSource = { kind: "storage-key", storageKey: ASYNC_AUDIO_KEY(lecture_audio_id) };
        const sound = await this.loadAudioFromSource(source, { shouldPlay: false, isLooping: false });

        sound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.isLoaded && status.didJustFinish) {
            await this.setBgmVolume(1.0);
          }
        });
        this.voiceSoundList[lecture_audio_id] = sound;
      }

      // set effects
      for (const [effectId, source] of Object.entries(this.effectSources)) {
        const sound = await this.loadAudioFromSource(source, { shouldPlay: false, isLooping: false });
        sound.setOnPlaybackStatusUpdate(async (status) => {
          if (!status.isLoaded) {
            this.effectPlayingMap[effectId] = false;
            return;
          }

          if (status.didJustFinish) {
            this.effectPlayingMap[effectId] = false;
            await this.restoreEffectBgmVolume(effectId);
            return;
          }

          this.effectPlayingMap[effectId] = status.isPlaying;
        });
        this.effectSoundList[effectId] = sound;
        this.effectPlayingMap[effectId] = false;
        this.effectRestoreBgmVolumeMap[effectId] = null;
      }

      return true;
    } catch (e) {
      console.error(e);
      await this.turnOff();
      return false;
    }
  }

  /**
   * bgm과 voice 파일을 언로드합니다.
   */
  async turnOff() {
    this.changeToForgroundState();
    this.currentVoiceSound = null;

    if (this.bgmSound) {
      await this.bgmSound.unloadAsync();
      this.bgmSound = undefined;
    }

    if (this.silentSound) {
      await this.silentSound.unloadAsync();
      this.silentSound = undefined;
    }

    for (const audio of this.audios) {
      const { lecture_audio_id } = audio;
      const sound = this.voiceSoundList[lecture_audio_id];
      if (sound) {
        sound.setOnPlaybackStatusUpdate(null);
        await sound.unloadAsync();
      }
    }
    this.voiceSoundList = {};

    for (const [effectId, sound] of Object.entries(this.effectSoundList)) {
      sound.setOnPlaybackStatusUpdate(null);
      await sound.unloadAsync();
      this.effectPlayingMap[effectId] = false;
      this.effectRestoreBgmVolumeMap[effectId] = null;
    }
    this.effectSoundList = {};
    this.effectPlayingMap = {};
    this.effectRestoreBgmVolumeMap = {};
    this.bgmVolume = 1.0;
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

      await this.setBgmVolume(0.2);

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

    if (this.bgmSound && this.isBgmOn) {
      await this.bgmSound.playAsync();
    }

    this.isPlaying = true;
  }

  /**
   * bgm을 실행합니다.
   */
  async playBgm() {
    if (this.bgmSound && this.silentSound) {
      await this.silentSound.pauseAsync();
      await this.bgmSound.playAsync();
      this.isBgmOn = true;
    }
  }

  /**
   * bgm을 일시정지합니다.
   */
  async pauseBgm() {
    if (this.bgmSound && this.silentSound) {
      await this.bgmSound.pauseAsync();
      await this.silentSound.playAsync();
      this.isBgmOn = false;
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

  async playEffect(effectId: string, option: EffectPlaybackOption = {}) {
    const sound = this.effectSoundList[effectId];
    if (!sound) {
      return false;
    }

    const restart = option.restart ?? false;
    const currentBgmVolume = this.bgmVolume;
    const bgmVolumeWhilePlaying = this.normalizeVolume(option.bgmVolumeWhilePlaying ?? 0.2);
    const restoreBgmVolume = option.restoreBgmVolume ?? currentBgmVolume;

    if (this.effectPlayingMap[effectId] && !restart) {
      return true;
    }

    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) {
        return false;
      }

      if (status.isPlaying && !restart) {
        this.effectPlayingMap[effectId] = true;
        return true;
      }

      this.effectPlayingMap[effectId] = true;
      this.effectRestoreBgmVolumeMap[effectId] = restoreBgmVolume;
      await this.setBgmVolume(bgmVolumeWhilePlaying);

      await sound.replayAsync();
      return true;
    } catch (e) {
      console.error(e);
      this.effectPlayingMap[effectId] = false;
      await this.restoreEffectBgmVolume(effectId);
      return false;
    }
  }

  async stopEffect(effectId: string) {
    const sound = this.effectSoundList[effectId];
    if (!sound) {
      return;
    }

    try {
      await sound.stopAsync();
    } catch {
      // no-op
    } finally {
      this.effectPlayingMap[effectId] = false;
      await this.restoreEffectBgmVolume(effectId);
    }
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
      await this.setBgmVolume(1);
    } else {
      // 실행중인 오디오가 있으면 배경음악 0.2 볼륨으로 조절
      await this.setBgmVolume(0.2);
    }
  }

  /**
     * 앱이 백그라운드로 전환되었을 때 다음 음성 파일을 자동으로 실행하도록 예약합니다.
     * @param elapsedTime 현재 시간 (초 단위)
     */
  async changeToBackgroundState(elapsedTime: number) {
    // 모든 오디오 파일을 확인하면서 사용자가 조정한 시간에 맞는 오디오를 찾아 재생 예약
    for (const { lecture_audio_id, start_time } of this.audios) {
      const sound = this.voiceSoundList[lecture_audio_id];
      const status = await sound.getStatusAsync();

      if (!status.isLoaded || !status.durationMillis) {
        continue;
      }

      const delay = (start_time - elapsedTime) * 1000; // 밀리초 단위로 변환

      if (delay > 0) {
        const timeoutId = setTimeout(async () => {
          // 새로운 음성 파일을 재생합니다.
          this.currentVoiceSound = sound;
          this.currentVoiceSound.playAsync();

          // 배경음악 볼륨 조절
          await this.setBgmVolume(0.2);
        }, delay);

        // 타이머 ID 저장
        this.scheduleIdList.push(timeoutId);
      }
    }
  }

  /**
   * 앱이 포그라운드 모드로 전환되었을 때 예약된 타이머를 삭제합니다.
   */
  changeToForgroundState() {
    // 저장된 모든 타이머 ID를 사용하여 타이머를 취소합니다.
    for (const timeoutId of this.scheduleIdList) {
      clearTimeout(timeoutId);
    }

    // 타이머 ID 배열을 초기화합니다.
    this.scheduleIdList = [];
  }
}
