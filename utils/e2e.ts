const E2E_ENABLED_VALUE = "1";
const DEFAULT_E2E_TIMER_SECONDS = 8;

export const isE2EEnabled = () => process.env.EXPO_PUBLIC_E2E_ENABLED === E2E_ENABLED_VALUE;

export const getE2EDurationSeconds = (defaultSeconds: number) => {
  if (!isE2EEnabled()) {
    return defaultSeconds;
  }

  const parsedTimerSeconds = Number(
    process.env.EXPO_PUBLIC_E2E_TIMER_SECONDS || DEFAULT_E2E_TIMER_SECONDS
  );

  if (!Number.isFinite(parsedTimerSeconds)) {
    return defaultSeconds;
  }

  return Math.max(1, Math.round(parsedTimerSeconds));
};
