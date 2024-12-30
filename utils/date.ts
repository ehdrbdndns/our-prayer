import { HistoryType } from "./dataType";

// 연속 기도 일수 계산
export const calculateContinuousPrayerDays = (history: HistoryType[]): number => {
  if (history.length === 0) {
    return 0;
  }

  // 날짜별로 기록을 그룹화
  const dateSet = new Set<string>();
  history.forEach(entry => {
    const date = new Date(entry.created_date * 1000).toISOString().split('T')[0];
    dateSet.add(date);
  });

  const dates = Array.from(dateSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  let continuousDays = 0;
  let today = new Date().toISOString().split('T')[0];
  let yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];

  // 연속 기도 일수 계산
  for (let i = dates.length - 1; i >= 0; i--) {
    if (dates[i] === today || dates[i] === yesterday) {
      continuousDays++;
      yesterday = new Date(new Date(dates[i]).setDate(new Date(dates[i]).getDate() - 1)).toISOString().split('T')[0];
    } else {
      break;
    }
  }

  return continuousDays;
};

// 오늘의 기도 시간 계산
export const calculateTodayPrayerTime = (history: HistoryType[]): number => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000; // 오늘 00:00:00의 Unix 타임스탬프 (초 단위)

  return history
    .filter(row => row.created_date >= todayStart)
    .reduce((total, { duration }) => total + duration, 0) / 60; // 초 단위를 분 단위로 변환
};

// 전체 기도 시간 계산
export const calculateTotalPrayerTime = (history: HistoryType[]): { time: string, unit: string } => {
  const totalHours = history.reduce((total, { duration }) => total + duration, 0) / 3600; // 초 단위를 시간 단위로 변환

  if (totalHours < 100) {
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
  // 가입한 날짜를 Date 객체로 변환
  const signupDate = new Date(signupDateUnix * 1000); // 초 단위를 밀리초 단위로 변환
  // 현재 날짜를 Date 객체로 가져옴
  const currentDate = new Date();

  // 두 날짜의 차이를 밀리초 단위로 계산
  const timeDifference = currentDate.getTime() - signupDate.getTime();
  // 밀리초 단위를 일수로 변환
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return daysDifference + 1;
};