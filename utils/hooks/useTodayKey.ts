import { calculateToday } from '@/utils/date';
import { useEffect, useState } from 'react';

export const useTodayKey = () => {
  const [todayKey, setTodayKey] = useState(calculateToday());

  useEffect(() => {
    const timer = setInterval(() => {
      const nextToday = calculateToday();
      setTodayKey((prev) => (prev === nextToday ? prev : nextToday));
    }, 30 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return todayKey;
}

