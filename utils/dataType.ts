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
  is_active: boolean;
  thumbnail: string;
  s_thumbnail: string;
  updated_date: number;
  created_date: number;

  is_liked: boolean; // 사용자가 좋아요를 눌렀는지 여부
  audit_updated_date: number; // 플랜 강의의 오디오 파일이 업데이트 된 시간
}