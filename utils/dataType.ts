export interface UserType {
  name: string;
  alarm: boolean;
  created_date: number; // Unix timestamp
}

export interface BibleType {
  title: string;
  content: string;
}

export interface HistoryType {
  prayer_history_id: string;
  duration: number;
  note: string;
  created_date: number; // Unix timestamp
}

export interface PlanType {
  plan_id: string;
  title: string;
  description: string;
  author_name: string;
  author_description: string;
  author_profile: string;
  author_deeplink: string;
  is_active: boolean;
  thumbnail: string;
  s_thumbnail: string;
  updated_date: number;
  created_date: number;
  type: 'free' | 'time' | 'topic';

  is_liked: boolean; // 사용자가 좋아요를 눌렀는지 여부
  plan_like_id: string; // 좋아요 ID
  audit_updated_date: number; // 플랜 강의의 오디오 파일이 업데이트 된 시간
}

export interface PlanResponseType {
  currentPlan: { plan_id: string } | null,
  plans: PlanType[];
}

export interface PlanDetailResponseType {
  plan: PlanType;
  lectures: LectureType[];
}

export interface LectureType {
  lecture_id: string;
  plan_id: string;
  title: string;
  description: string;
  time: number;
  bgm: string;
  is_active: boolean;
  updated_date: number;
  created_date: number;
}

export interface LectureAudioType {
  lecture_audio_id: string;
  lecture_id: string;
  file_name: string;
  audio: string;
  caption: string;
  start_time: number;
  is_active: boolean;
  created_date: number;
  updated_date: number;
}

export interface LectureResponseType {
  lecture: LectureType;
  lectureAudios: LectureAudioType[];
}