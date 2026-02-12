export const clampMinute = (value: number, min: number, max: number) => {
  const safeValue = Number.isFinite(value) ? Math.round(value) : min;
  return Math.max(min, Math.min(max, safeValue));
};

export const minuteToOffset = (minute: number, min: number, itemHeight: number) => {
  return (minute - min) * itemHeight;
};

export const offsetToMinute = (offset: number, min: number, max: number, itemHeight: number) => {
  const index = Math.round(offset / itemHeight);
  return clampMinute(min + index, min, max);
};

export const minuteToTimeLabel = (minute: number) => {
  const hour = Math.floor(minute / 60);
  const remainMinute = minute % 60;
  return `${hour}시간 ${remainMinute}분`;
};
