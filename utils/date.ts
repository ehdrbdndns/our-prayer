import { HistoryType } from "./dataType";

// 연속 기도 일수 계산
export const calculateContinuousPrayerDays = (history: HistoryType[]): number => {
  if (history.length === 0) {
    return 0;
  }

  // 날짜별로 기록을 그룹화
  const dateSet = new Set<string>();
  history.forEach(entry => {
    dateSet.add(formatDateToHyphenated(entry.created_date));
  });

  const dates = Array.from(dateSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  let continuousDays = 0;
  let today = formatDateToHyphenated(new Date().getTime() / 1000);
  let yesterday = formatDateToHyphenated(new Date(new Date().setDate(new Date().getDate() - 1)).getTime() / 1000);

  // 연속 기도 일수 계산
  for (let i = dates.length - 1; i >= 0; i--) {
    // console.log(dates[i], today, yesterday);
    if (dates[i] === today || dates[i] === yesterday) {
      continuousDays++;
      yesterday = formatDateToHyphenated(new Date(new Date(dates[i]).setDate(new Date(dates[i]).getDate() - 1)).getTime() / 1000);
    } else {
      break;
    }
  }

  return continuousDays;
};

// 오늘의 기도 시간 계산
export const calculateTodayPrayerTime = (history: HistoryType[]): string => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000; // 오늘 00:00:00의 Unix 타임스탬프 (초 단위)

  const totalMinutes = history
    .filter(row => row.created_date >= todayStart)
    .reduce((total, { duration }) => total + duration, 0) / 60; // 초 단위를 분 단위로 변환

  // 소수점 이하를 제거하고 정수로 반환
  return Math.floor(totalMinutes).toString();
};

// 전체 기도 시간 계산
export const calculateTotalPrayerTime = (history: HistoryType[]): { time: string, unit: string } => {
  const totalHours = history.reduce((total, { duration }) => total + duration, 0) / 3600; // 초 단위를 시간 단위로 변환

  if (totalHours < 1) {
    return {
      time: '0',
      unit: '시간'
    };
  } else if (totalHours < 100) {
    return {
      time: totalHours.toFixed(),
      unit: '시간'
    };
  } else if (totalHours < 1000) {
    return {
      time: (totalHours / 100).toFixed(1),
      unit: '백'
    };
  } else if (totalHours < 10000) {
    return {
      time: (totalHours / 1000).toFixed(2),
      unit: '천'
    }
  } else {
    return {
      time: (totalHours / 10000).toFixed(3),
      unit: '만'
    }
  }
};

// 가입한 날짜로부터 오늘까지의 일수를 계산하는 함수
export const calculateDaysSinceSignup = (signupDateUnix: number): number => {
  const signupDate = new Date(signupDateUnix * 1000); // 초 단위를 밀리초 단위로 변환
  const currentDate = new Date();

  const timeDifference = currentDate.getTime() - signupDate.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return daysDifference + 1;
};

/**
 * Unix 타임스탬프를 받아서 "오후 12시 30분에 30분 기도했습니다" 형식의 문자열로 변환하는 함수
 * @param created_date 10자리 Unix 타임스탬프 (초 단위)
 * @param prayerDuration 기도 시간 (초 단위)
 * @returns 형식화된 문자열
 */
export const formatPrayerTime = (created_date: number, duration: number): string => {
  const startTimestamp = created_date - duration;
  const date = new Date(startTimestamp * 1000); // 초 단위를 밀리초 단위로 변환
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? '오후' : '오전';
  const formattedHours = hours % 12 || 12; // 12시간 형식으로 변환
  const formattedMinutes = String(minutes).padStart(2, '0');
  const prayerDurationMinutes = Math.floor(duration / 60); // 초 단위를 분 단위로 변환

  const prayerDurationString = prayerDurationMinutes === 0 ? '1분 미만으로' : `${prayerDurationMinutes}분`;

  return `${period} ${formattedHours}시 ${formattedMinutes}분에 ${prayerDurationString} 기도했습니다`;
};

/**
 * Unix 타임스탬프를 받아서 로컬 시간 기준 "YYYY년 MM월 DD일" 형식의 문자열로 변환하는 함수
 * @param unixTime 10자리 Unix 타임스탬프 (초 단위)
 * @returns 형식화된 문자열
 */
export const formatDateToKorean = (unixTime: number): string => {
  const date = new Date(unixTime * 1000); // 초 단위를 밀리초 단위로 변환
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더함
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}년 ${month}월 ${day}일`;
};

/**
 * Unix 타임스탬프를 받아서 로컬시간기준 "YYYY-MM-DD" 형식의 문자열로 변환하는 함수
 * @param unixTime 10자리 Unix 타임스탬프 (초 단위)
 * @returns 형식화된 문자열
 */
export const formatDateToHyphenated = (unixTime: number): string => {
  const date = new Date(unixTime * 1000); // 초 단위를 밀리초 단위로 변환
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더함
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const calculateToday = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth()는 0부터 시작하므로 +1
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}