/**
 * 테스트 설계:
 * 1) freePrayer가 Amp를 번들 오디오 소스(bgm/ending)로 초기화하는지 검증한다.
 * 2) 기도 종료 20초 전(remaining <= 20)에 ending 알람을 1회만 재생하는지 검증한다.
 * 3) 완료 버튼/그만두기에서 prayerRecord로 이동하며 lecture_id/duration을 전달하는지 검증한다.
 * 4) lecture_id 누락 시 예외 처리(alert + /plan 복귀)를 검증한다.
 * 5) 일시정지 저장/복구에서 남은 시간과 저장된 기도 시간을 안정적으로 복원하는지 검증한다.
 */
import FreePrayerPage from "@/app/(app)/(stacks)/freePrayer";
import Amp from "@/classes/Amp";
import { ASYNC_IS_PRAYING } from "@/storage/asyncStorageKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert, AppState, AppStateStatus } from "react-native";

jest.mock("@/classes/Amp", () => {
  return jest.fn().mockImplementation(() => ({
    turnOn: jest.fn(() => Promise.resolve(true)),
    turnOff: jest.fn(() => Promise.resolve()),
    playBgm: jest.fn(() => Promise.resolve()),
    pauseBgm: jest.fn(() => Promise.resolve()),
    playEffect: jest.fn(() => Promise.resolve(true)),
    stopEffect: jest.fn(() => Promise.resolve()),
    pause: jest.fn(() => Promise.resolve()),
    resumeAudio: jest.fn(() => Promise.resolve()),
  }));
});

jest.mock("@react-native-async-storage/async-storage", () => ({
  removeItem: jest.fn(() => Promise.resolve()),
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));

jest.mock("expo-keep-awake", () => ({
  useKeepAwake: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

type MockParams = {
  plan_id?: string;
  lecture_id?: string;
  plan_title?: string;
  prayer_minutes?: string;
  isReconnect?: string;
};

let mockParams: MockParams = {
  lecture_id: "lecture-1",
  plan_title: "자유 기도",
  prayer_minutes: "1",
};
const mockReplace = jest.fn();
const mockDismissTo = jest.fn();
let appStateHandler: ((nextAppState: AppStateStatus) => void) | undefined;
const originalAppStateCurrentState = AppState.currentState;

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockParams,
  router: {
    replace: (...args: unknown[]) => mockReplace(...args),
    dismissTo: (...args: unknown[]) => mockDismissTo(...args),
  },
}));

jest.mock("@/utils/hooks/useScreenTransition", () => ({
  useScreenTransition: () => ({
    isIntroVisible: false,
    isContentVisible: true,
    introOpacity: 1,
    contentOpacity: 1,
  }),
}));

let timerProps: any;
jest.mock("@/components/timer/Timer", () => {
  return function MockTimer(props: any) {
    timerProps = props;
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, { testID: "mock-timer" });
  };
});

jest.mock("@/assets/images/icon/music.svg", () => {
  return function MusicIcon() {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View);
  };
});

jest.mock("@/assets/images/icon/mute.svg", () => {
  return function MuteIcon() {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View);
  };
});

const createDeferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
};

describe("FreePrayerPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    timerProps = undefined;
    mockParams = {
      lecture_id: "lecture-1",
      plan_title: "자유 기도",
      prayer_minutes: "1",
    };
    AppState.currentState = "active";
    appStateHandler = undefined;
    jest.spyOn(AppState, "addEventListener").mockImplementation((_eventName, handler) => {
      appStateHandler = handler as (nextAppState: AppStateStatus) => void;
      return { remove: jest.fn() } as never;
    });
  });

  afterEach(() => {
    AppState.currentState = originalAppStateCurrentState;
    jest.restoreAllMocks();
  });

  const getAmpInstance = () => (Amp as unknown as jest.Mock).mock.results[0]?.value;

  it("initializes Amp with bundled bgm and ending sources", async () => {
    render(<FreePrayerPage />);
    const amp = getAmpInstance();

    await waitFor(() => {
      expect(amp.turnOn).toHaveBeenCalled();
    });

    expect(Amp).toHaveBeenCalledWith(
      "free",
      [],
      expect.objectContaining({
        isPlaying: true,
        bgmSource: expect.objectContaining({
          kind: "module",
          module: expect.any(Number),
        }),
        effectSources: expect.objectContaining({
          ending: expect.objectContaining({
            kind: "module",
            module: expect.any(Number),
          }),
        }),
      })
    );
  });

  it("plays ending sound once when remaining time is 20 seconds or less", async () => {
    render(<FreePrayerPage />);
    const amp = getAmpInstance();

    await waitFor(() => {
      expect(timerProps).toBeDefined();
      expect(amp.turnOn).toHaveBeenCalled();
    });

    act(() => {
      timerProps.setElapsedTime(40); // 60s duration -> 20s remaining
    });

    await waitFor(() => {
      expect(amp.playEffect).toHaveBeenCalledWith(
        "ending",
        expect.objectContaining({
          restart: false,
          bgmVolumeWhilePlaying: 0.5,
        })
      );
      expect(amp.playEffect).toHaveBeenCalledTimes(1);
    });

    act(() => {
      timerProps.setElapsedTime(42);
    });

    await waitFor(() => {
      expect(amp.playEffect).toHaveBeenCalledTimes(1);
    });
  });

  it("navigates to prayerRecord on complete button with lecture_id and duration", async () => {
    render(<FreePrayerPage />);
    const amp = getAmpInstance();

    await waitFor(() => {
      expect(timerProps).toBeDefined();
    });

    await act(async () => {
      await timerProps.onPressCompleteBtn(8.2);
    });

    expect((AsyncStorage.removeItem as jest.Mock)).toHaveBeenCalledWith(ASYNC_IS_PRAYING);
    expect(amp.pause).toHaveBeenCalled();
    expect(amp.stopEffect).toHaveBeenCalledWith("ending");
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: "/prayerRecord",
      params: {
        lecture_id: "lecture-1",
        duration: "9",
      },
    });
  });

  it("navigates to prayerRecord on quit confirm", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    const screen = render(<FreePrayerPage />);
    const amp = getAmpInstance();

    await waitFor(() => {
      expect(screen.getByText("그만두기")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("그만두기"));

    const quitAlertCall = alertSpy.mock.calls.find(call => call[0] === "그만두시겠습니까?");
    const quitButtons = quitAlertCall?.[2] as { onPress?: () => Promise<void> }[];

    await act(async () => {
      await quitButtons[1].onPress?.();
    });

    expect((AsyncStorage.removeItem as jest.Mock)).toHaveBeenCalledWith(ASYNC_IS_PRAYING);
    expect(amp.pause).toHaveBeenCalled();
    expect(amp.stopEffect).toHaveBeenCalledWith("ending");
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: "/prayerRecord",
      params: {
        lecture_id: "lecture-1",
        duration: "1",
      },
    });

    alertSpy.mockRestore();
  });

  it("shows alert and returns to plan when lecture_id is missing", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    mockParams = {
      lecture_id: "",
      plan_title: "자유 기도",
      prayer_minutes: "1",
    };

    render(<FreePrayerPage />);

    await waitFor(() => {
      expect(timerProps).toBeDefined();
    });

    await act(async () => {
      await timerProps.onPressCompleteBtn(12);
    });

    const invalidAlertCall = alertSpy.mock.calls.find(call => call[0] === "알림");
    const invalidButtons = invalidAlertCall?.[2] as { onPress?: () => void }[];

    act(() => {
      invalidButtons[0].onPress?.();
    });

    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockDismissTo).toHaveBeenCalledWith("/plan");

    alertSpy.mockRestore();
  });

  it("stores paused free prayer state without counting paused wall-clock time", async () => {
    const startTime = new Date("2026-06-13T00:00:00.000Z").getTime();
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(startTime);

    render(<FreePrayerPage />);

    await waitFor(() => {
      expect(timerProps).toBeDefined();
      expect(timerProps.isPlaying).toBe(true);
    });

    act(() => {
      timerProps.setElapsedTime(12);
    });

    await act(async () => {
      await timerProps.onPressPlay();
    });

    await waitFor(() => {
      expect(timerProps.isPlaying).toBe(false);
    });

    nowSpy.mockReturnValue(startTime + 5 * 60_000);
    expect(appStateHandler).toBeDefined();
    const handleAppStateChange = appStateHandler!;

    await act(async () => {
      handleAppStateChange("background");
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(ASYNC_IS_PRAYING, expect.any(String));
    });

    const savedPayload = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls.at(-1)?.[1]);
    expect(savedPayload).toEqual(
      expect.objectContaining({
        lecture_id: "lecture-1",
        entryPath: "/freePrayer",
        prayer_minutes: 1,
        repeatCount: 0,
        isPlaying: false,
        remainingSeconds: 48,
      })
    );
  });

  it("persists paused state before audio pause resolves when backgrounded immediately", async () => {
    const pauseDeferred = createDeferred<void>();

    render(<FreePrayerPage />);
    const amp = getAmpInstance();
    amp.pause.mockReturnValueOnce(pauseDeferred.promise);

    await waitFor(() => {
      expect(timerProps).toBeDefined();
      expect(timerProps.isPlaying).toBe(true);
    });

    act(() => {
      timerProps.setElapsedTime(12);
    });

    let pauseAction: Promise<void> | undefined;
    act(() => {
      pauseAction = timerProps.onPressPlay();
    });

    expect(amp.pause).toHaveBeenCalled();
    expect(appStateHandler).toBeDefined();

    await act(async () => {
      appStateHandler!("background");
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(ASYNC_IS_PRAYING, expect.any(String));
    });

    const savedPayload = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls.at(-1)?.[1]);
    expect(savedPayload).toEqual(
      expect.objectContaining({
        lecture_id: "lecture-1",
        entryPath: "/freePrayer",
        prayer_minutes: 1,
        repeatCount: 0,
        isPlaying: false,
        remainingSeconds: 48,
      })
    );

    await act(async () => {
      pauseDeferred.resolve();
      await pauseAction;
    });
  });

  it("restores paused reconnect state as paused with saved remaining time", async () => {
    const now = new Date("2026-06-13T00:00:00.000Z").getTime();
    jest.spyOn(Date, "now").mockReturnValue(now);

    mockParams = {
      lecture_id: "lecture-1",
      plan_title: "자유 기도",
      prayer_minutes: "1",
      isReconnect: "true",
    };

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({
        plan_id: "",
        plan_title: "자유 기도",
        lecture_id: "lecture-1",
        lecture_title: "자유 기도",
        repeatCount: 1,
        endTime: now - 5 * 60_000,
        entryPath: "/freePrayer",
        prayer_minutes: 1,
        isPlaying: false,
        remainingSeconds: 42,
      })
    );

    render(<FreePrayerPage />);

    await waitFor(() => {
      expect(timerProps).toBeDefined();
      expect(timerProps.isPlaying).toBe(false);
      expect(timerProps.repeatCount).toBe(1);
      expect(timerProps.duration).toBe(60);
      expect(timerProps.initialRemainingTime).toBe(42);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(ASYNC_IS_PRAYING);
    });
  });

  it("keeps running reconnect based on saved endTime", async () => {
    mockParams = {
      lecture_id: "lecture-1",
      plan_title: "자유 기도",
      prayer_minutes: "1",
      isReconnect: "true",
    };

    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1_000_000);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({
        plan_id: "",
        plan_title: "자유 기도",
        lecture_id: "lecture-1",
        lecture_title: "자유 기도",
        repeatCount: 0,
        endTime: 1_000_000 + 45_000,
        entryPath: "/freePrayer",
        prayer_minutes: 1,
        isPlaying: true,
        remainingSeconds: 55,
      })
    );

    render(<FreePrayerPage />);

    await waitFor(() => {
      expect(timerProps).toBeDefined();
      expect(timerProps.isPlaying).toBe(true);
      expect(timerProps.repeatCount).toBe(0);
      expect(timerProps.duration).toBe(60);
      expect(timerProps.initialRemainingTime).toBe(45);
    });

    nowSpy.mockRestore();
  });

  it("normalizes invalid saved free prayer minutes during paused reconnect restore", async () => {
    const now = new Date("2026-06-13T00:00:00.000Z").getTime();
    jest.spyOn(Date, "now").mockReturnValue(now);

    mockParams = {
      lecture_id: "lecture-1",
      plan_title: "자유 기도",
      prayer_minutes: "1",
      isReconnect: "true",
    };

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({
        plan_id: "",
        plan_title: "자유 기도",
        lecture_id: "lecture-1",
        lecture_title: "자유 기도",
        repeatCount: 2,
        endTime: now - 5 * 60_000,
        entryPath: "/freePrayer",
        prayer_minutes: 0,
        isPlaying: false,
        remainingSeconds: 42,
      })
    );

    render(<FreePrayerPage />);

    await waitFor(() => {
      expect(timerProps).toBeDefined();
      expect(timerProps.isPlaying).toBe(false);
      expect(timerProps.repeatCount).toBe(2);
      expect(timerProps.duration).toBe(60);
      expect(timerProps.initialRemainingTime).toBe(42);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(ASYNC_IS_PRAYING);
    });
  });
});
