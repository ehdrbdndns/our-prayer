// 상담 내역 임시 저장
export const ASYNC_TEMP_DRAFT = 'temp_draft';

// key는 lecture_id 혹은 lecture_audio_id입니다.
export const ASYNC_AUDIO_KEY = (key: string) => `audio-${key}`;

// Timer 상태 전환 키 입니다.
export const ASYNC_TIMER_KEY = 'timer';

// 마지막으로 리뷰를 남긴 앱 버전
export const ASYNC_LAST_REVIEWED_VERSION = 'last_reviewed_version';

// 스마트 리뷰 요청 횟수
export const ASYNC_REVIEW_REQUEST_COUNT = 'review_request_count';

// 마지막으로 리뷰를 요청한 시간
export const ASYNC_LAST_REVIEW_REQUEST_TIMESTAMP = 'last_review_request_timestamp';