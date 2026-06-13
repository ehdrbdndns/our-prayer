# 자유기도 일시정지 재연결 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 자유기도를 수동 일시정지한 뒤 앱을 백그라운드/종료했다가 재연결해도, 멈춰 있던 시간이 기도 시간으로 계산되지 않게 고친다.

**Architecture:** 기존 `ASYNC_IS_PRAYING` 저장 payload에 자유기도 복구용 선택 필드인 `isPlaying`, `remainingSeconds`를 추가한다. 재생 중이던 세션은 기존처럼 절대 종료 시각인 `endTime` 기준으로 복구하고, 일시정지 상태였던 세션은 저장된 남은 시간 기준으로 `isPlaying=false` 상태를 복원한다. 새 필드는 optional이므로 기존 강의기도 저장 payload와 하위 호환된다.

**Tech Stack:** Expo Router, React Native, TypeScript, AsyncStorage, Jest, React Native Testing Library.

---

## 파일 구조

- Modify `storage/asyncStorageKeys.ts`
  - `AsyncIsPrayingType`에 optional 필드 `isPlaying`, `remainingSeconds`를 추가한다.
  - 기존 lecture prayer payload는 그대로 유효해야 한다.

- Modify `app/(app)/(tabs)/index.tsx`
  - 홈 화면의 `isAsyncIsPrayingType` 런타임 가드가 `isPlaying`, `remainingSeconds`의 잘못된 타입을 걸러내도록 확장한다.
  - 라우팅 동작은 바꾸지 않는다.

- Modify `app/(app)/(stacks)/freePrayer.tsx`
  - 자유기도 화면의 `isAsyncIsPrayingType` 런타임 가드를 확장한다.
  - 앱이 백그라운드로 갈 때 `isPlaying`, `remainingSeconds`를 함께 저장한다.
  - 저장된 상태가 재생 중이면 기존 `endTime` 기반 계산으로 복구한다.
  - 저장된 상태가 일시정지 중이면 `remainingSeconds` 기준으로 paused timer를 복구하고, 이후 사용자가 재생을 눌렀을 때 `endTimeRef` 보정이 정상 동작하도록 `pausedTime`을 현재 시각으로 설정한다.
  - 기존 PR diff의 trailing whitespace 2건도 제거한다.

- Modify `__tests__/stacks/freePrayer.test.tsx`
  - AppState 전환을 테스트에서 시뮬레이션한다.
  - 일시정지 상태에서 백그라운드 진입 시 `isPlaying:false`, `remainingSeconds`가 저장되는지 검증한다.
  - 일시정지 상태 저장값으로 reconnect하면 타이머가 paused 상태와 저장된 남은 시간으로 렌더링되는지 검증한다.

---

### Task 1: 저장 payload 계약 확장

**Files:**
- Modify: `storage/asyncStorageKeys.ts`
- Modify: `app/(app)/(tabs)/index.tsx`
- Modify: `app/(app)/(stacks)/freePrayer.tsx`

- [ ] **Step 1: TypeScript payload 타입 확장**

`storage/asyncStorageKeys.ts`의 기존 `AsyncIsPrayingType` 블록을 아래 코드로 교체한다.

```ts
export type AsyncIsPrayingType = {
  plan_id: string,
  plan_title: string,
  lecture_id: string,
  lecture_title: string,
  repeatCount: number,
  endTime: number, // new Date().getTime() 형태로 저장
  entryPath?: AsyncPrayerEntryPath,
  prayer_minutes?: number,
  isPlaying?: boolean,
  remainingSeconds?: number,
}
```

- [ ] **Step 2: TypeScript 확인 실행**

Run:

```bash
npx tsc --noEmit
```

Expected: 기존에 확인된 unrelated 오류만 실패해야 한다. `AsyncIsPrayingType`, `isPlaying`, `remainingSeconds` 관련 신규 오류는 없어야 한다.

```text
components/SoundBox.tsx(36,18): error TS2554: Expected 1 arguments, but got 0.
components/SoundBox.tsx(37,27): error TS2554: Expected 1 arguments, but got 0.
components/Header.tsx(5,12): error TS2503: Cannot find namespace 'JSX'.
components/Header.tsx(6,11): error TS2503: Cannot find namespace 'JSX'.
components/Header.tsx(7,12): error TS2503: Cannot find namespace 'JSX'.
```

- [ ] **Step 3: 홈 화면 런타임 가드 확장**

`app/(app)/(tabs)/index.tsx`의 `isAsyncIsPrayingType` 내부 return expression을 아래 코드로 교체한다.

```ts
  return (
    typeof row.plan_id === "string" &&
    typeof row.plan_title === "string" &&
    typeof row.lecture_id === "string" &&
    typeof row.lecture_title === "string" &&
    isFiniteNumber(row.repeatCount) &&
    isFiniteNumber(row.endTime) &&
    (row.entryPath === undefined || row.entryPath === "/lectureDetail/[lecture_id]" || row.entryPath === "/freePrayer") &&
    (row.prayer_minutes === undefined || isFiniteNumber(row.prayer_minutes)) &&
    (row.isPlaying === undefined || typeof row.isPlaying === "boolean") &&
    (row.remainingSeconds === undefined || isFiniteNumber(row.remainingSeconds))
  );
```

- [ ] **Step 4: 자유기도 화면 런타임 가드 확장**

`app/(app)/(stacks)/freePrayer.tsx`의 `isAsyncIsPrayingType` 내부 return expression을 아래 코드로 교체한다.

```ts
  return (
    typeof row.plan_id === "string" &&
    typeof row.plan_title === "string" &&
    typeof row.lecture_id === "string" &&
    typeof row.lecture_title === "string" &&
    isFiniteNumber(row.repeatCount) &&
    isFiniteNumber(row.endTime) &&
    (row.entryPath === undefined || row.entryPath === "/lectureDetail/[lecture_id]" || row.entryPath === "/freePrayer") &&
    (row.prayer_minutes === undefined || isFiniteNumber(row.prayer_minutes)) &&
    (row.isPlaying === undefined || typeof row.isPlaying === "boolean") &&
    (row.remainingSeconds === undefined || isFiniteNumber(row.remainingSeconds))
  );
```

- [ ] **Step 5: 기존 자유기도 테스트 실행**

Run:

```bash
npm test -- --runInBand __tests__/stacks/freePrayer.test.tsx
```

Expected: PASS. 이 작업은 optional 필드만 확장하므로 기존 자유기도 동작은 변하지 않아야 한다.

- [ ] **Step 6: 커밋**

Run:

```bash
git add storage/asyncStorageKeys.ts 'app/(app)/(tabs)/index.tsx' 'app/(app)/(stacks)/freePrayer.tsx'
git commit -m "fix: extend prayer resume state metadata"
```

---

### Task 2: 일시정지 저장/복구 실패 테스트 추가

**Files:**
- Modify: `__tests__/stacks/freePrayer.test.tsx`

- [ ] **Step 1: AppState 시뮬레이션을 위해 React Native import 수정**

`__tests__/stacks/freePrayer.test.tsx`에서 아래 코드를:

```ts
import { Alert } from "react-native";
```

아래 코드로 교체한다.

```ts
import { Alert, AppState, AppStateStatus } from "react-native";
```

- [ ] **Step 2: Amp mock에 `resumeAudio` 추가**

`jest.mock("@/classes/Amp", ...)` 내부 object에서 아래 블록을:

```ts
    stopEffect: jest.fn(() => Promise.resolve()),
    pause: jest.fn(() => Promise.resolve()),
```

아래 코드로 교체한다.

```ts
    stopEffect: jest.fn(() => Promise.resolve()),
    pause: jest.fn(() => Promise.resolve()),
    resumeAudio: jest.fn(() => Promise.resolve()),
```

- [ ] **Step 3: route params mock이 reconnect 필드를 받을 수 있게 변경**

현재 `mockParams` 선언을 아래 코드에서:

```ts
let mockParams = {
  lecture_id: "lecture-1",
  plan_title: "자유 기도",
  prayer_minutes: "1",
};
```

아래 코드로 교체한다.

```ts
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
```

- [ ] **Step 4: AppState handler capture 변수 추가**

`const mockDismissTo = jest.fn();` 바로 아래에 아래 코드를 추가한다.

```ts
let appStateHandler: ((nextAppState: AppStateStatus) => void) | undefined;
```

- [ ] **Step 5: `beforeEach`에서 AppState mock 설치**

`beforeEach` 내부에서 `mockParams = { ... }` 할당 직후 아래 코드를 추가한다.

```ts
    appStateHandler = undefined;
    jest.spyOn(AppState, "addEventListener").mockImplementation((_eventName, handler) => {
      appStateHandler = handler as (nextAppState: AppStateStatus) => void;
      return { remove: jest.fn() } as never;
    });
```

- [ ] **Step 6: spy cleanup 추가**

`beforeEach` 블록 뒤에 아래 코드를 추가한다.

```ts
  afterEach(() => {
    jest.restoreAllMocks();
  });
```

- [ ] **Step 7: 일시정지 상태 저장 실패 테스트 추가**

`describe("FreePrayerPage", ...)`의 마지막 `});` 앞에 아래 테스트를 추가한다.

```ts
  it("stores paused free prayer state without counting paused wall-clock time", async () => {
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

    await act(async () => {
      appStateHandler?.("background");
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
```

- [ ] **Step 8: 일시정지 상태 복구 실패 테스트 추가**

Step 7에서 추가한 테스트 바로 뒤에 아래 테스트를 추가한다.

```ts
  it("restores paused reconnect state as paused with saved remaining time", async () => {
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
        endTime: Date.now() + 42_000,
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
```

- [ ] **Step 9: 테스트가 실패하는지 확인**

Run:

```bash
npm test -- --runInBand __tests__/stacks/freePrayer.test.tsx
```

Expected: FAIL. 일시정지 저장 테스트는 저장 payload에 `isPlaying:false`, `remainingSeconds:48`이 없어서 실패해야 한다. 일시정지 복구 테스트는 현재 구현이 `setIsPlaying(true)`를 강제하기 때문에 `timerProps.isPlaying`이 `false`가 아니라 `true`로 나와 실패해야 한다.

---

### Task 3: 일시정지 상태 metadata 저장 구현

**Files:**
- Modify: `app/(app)/(stacks)/freePrayer.tsx`
- Test: `__tests__/stacks/freePrayer.test.tsx`

- [ ] **Step 1: 남은 시간 계산 helper 추가**

`app/(app)/(stacks)/freePrayer.tsx`에서 `calculateElapsedTimeFromSavedState` 바로 아래에 아래 helper를 추가한다.

```ts
const calculateRemainingSeconds = (durationSeconds: number, elapsedSeconds: number) => {
  if (durationSeconds <= 0) {
    return 0;
  }

  const currentCycleElapsedSeconds = Math.max(0, Math.floor(elapsedSeconds % durationSeconds));
  return Math.max(0, durationSeconds - currentCycleElapsedSeconds);
};
```

- [ ] **Step 2: background 저장 payload에 `isPlaying`, `remainingSeconds` 추가**

`savePrayingState` 내부의 `prayingState` object를 아래 블록으로 교체한다.

```ts
      const wasPlaying = isPlayingRef.current;
      const remainingSeconds = calculateRemainingSeconds(currentDuration, elapsedTimeRef.current);

      const prayingState: AsyncIsPrayingType = {
        plan_id: plan_id || "",
        plan_title: plan_title || FREE_PRAYER_LECTURE_TITLE,
        lecture_id,
        lecture_title: FREE_PRAYER_LECTURE_TITLE,
        repeatCount: repeatCountRef.current,
        endTime: endTimeRef.current,
        entryPath: FREE_PRAYER_ENTRY_PATH,
        prayer_minutes: selectedMinutes,
        isPlaying: wasPlaying,
        remainingSeconds,
      };
```

- [ ] **Step 3: 일시정지 저장 테스트 실행**

Run:

```bash
npm test -- --runInBand __tests__/stacks/freePrayer.test.tsx -t "stores paused free prayer state"
```

Expected: PASS. 저장 payload에 `isPlaying:false`, `remainingSeconds:48`이 포함되어야 한다.

- [ ] **Step 4: 자유기도 전체 focused test 실행**

Run:

```bash
npm test -- --runInBand __tests__/stacks/freePrayer.test.tsx
```

Expected: `restores paused reconnect state as paused with saved remaining time`만 FAIL. 아직 restore 로직이 `setIsPlaying(true)`를 강제하기 때문이다.

- [ ] **Step 5: 커밋**

Run:

```bash
git add 'app/(app)/(stacks)/freePrayer.tsx' __tests__/stacks/freePrayer.test.tsx
git commit -m "fix: persist paused free prayer resume metadata"
```

---

### Task 4: 일시정지 자유기도를 진행시키지 않고 복구

**Files:**
- Modify: `app/(app)/(stacks)/freePrayer.tsx`
- Test: `__tests__/stacks/freePrayer.test.tsx`

- [ ] **Step 1: paused restore helper 추가**

`app/(app)/(stacks)/freePrayer.tsx`에서 `calculateRemainingSeconds` 바로 아래에 아래 helper를 추가한다.

```ts
const calculateElapsedSecondsFromRemainingSeconds = (
  savedRepeatCount: number,
  savedRemainingSeconds: number,
  prayerDurationSeconds: number
) => {
  if (prayerDurationSeconds <= 0) {
    return 0;
  }

  const clampedRemainingSeconds = Math.max(0, Math.min(prayerDurationSeconds, Math.ceil(savedRemainingSeconds)));
  return savedRepeatCount * prayerDurationSeconds + (prayerDurationSeconds - clampedRemainingSeconds);
};
```

- [ ] **Step 2: reconnect restore block 교체**

`startPrayer` 내부에서 아래 기존 블록을:

```ts
        setIsPlaying(true);
        setDuration(restoredDurationSeconds);
        setInitialRemainingTime(restoredDurationSeconds);
        endTimeRef.current = parsedState.endTime;

        const totalElapsedTimeInMillis = calculateElapsedTimeFromSavedState(
          parsedState.repeatCount,
          parsedState.endTime,
          restoredDurationSeconds
        );

        await handleAdjustElapsedTime(totalElapsedTimeInMillis / 1000, restoredDurationSeconds);
        await AsyncStorage.removeItem(ASYNC_IS_PRAYING);
```

아래 코드로 교체한다.

```ts
        const shouldRestorePlaying = parsedState.isPlaying ?? true;
        setIsPlaying(shouldRestorePlaying);
        setDuration(restoredDurationSeconds);
        setInitialRemainingTime(restoredDurationSeconds);
        endTimeRef.current = parsedState.endTime;

        if (shouldRestorePlaying) {
          const totalElapsedTimeInMillis = calculateElapsedTimeFromSavedState(
            parsedState.repeatCount,
            parsedState.endTime,
            restoredDurationSeconds
          );

          await handleAdjustElapsedTime(totalElapsedTimeInMillis / 1000, restoredDurationSeconds);
        } else {
          const savedRemainingSeconds =
            parsedState.remainingSeconds ?? calculateRemainingSeconds(restoredDurationSeconds, 0);
          const totalElapsedSeconds = calculateElapsedSecondsFromRemainingSeconds(
            parsedState.repeatCount,
            savedRemainingSeconds,
            restoredDurationSeconds
          );
          const clampedRemainingSeconds = Math.max(
            0,
            Math.min(restoredDurationSeconds, Math.ceil(savedRemainingSeconds))
          );

          setRepeatCount(parsedState.repeatCount);
          setElapsedTime(totalElapsedSeconds % restoredDurationSeconds);
          setInitialRemainingTime(clampedRemainingSeconds);
          setPausedTime(Date.now());
          endTimeRef.current = Date.now() + clampedRemainingSeconds * 1000;
          setTimerKey(prev => prev + 1);
        }

        await AsyncStorage.removeItem(ASYNC_IS_PRAYING);
```

- [ ] **Step 3: 일시정지 복구 테스트 실행**

Run:

```bash
npm test -- --runInBand __tests__/stacks/freePrayer.test.tsx -t "restores paused reconnect state"
```

Expected: PASS. 복구된 timer props는 `isPlaying:false`, `repeatCount:1`, `duration:60`, `initialRemainingTime:42`를 포함해야 한다.

- [ ] **Step 4: 자유기도 전체 focused test 실행**

Run:

```bash
npm test -- --runInBand __tests__/stacks/freePrayer.test.tsx
```

Expected: PASS.

- [ ] **Step 5: 커밋**

Run:

```bash
git add 'app/(app)/(stacks)/freePrayer.tsx' __tests__/stacks/freePrayer.test.tsx
git commit -m "fix: restore paused free prayer sessions as paused"
```

---

### Task 5: 재생 중 reconnect는 기존 절대시간 기준을 유지하는지 검증

**Files:**
- Modify: `__tests__/stacks/freePrayer.test.tsx`
- Test: `__tests__/stacks/freePrayer.test.tsx`

- [ ] **Step 1: running reconnect 회귀 테스트 추가**

일시정지 복구 테스트 뒤에 아래 테스트를 추가한다.

```ts
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
```

- [ ] **Step 2: running reconnect 회귀 테스트 실행**

Run:

```bash
npm test -- --runInBand __tests__/stacks/freePrayer.test.tsx -t "keeps running reconnect"
```

Expected: PASS. 저장 payload에 `remainingSeconds`가 있어도, `isPlaying:true`이면 `endTime` 기준 복구가 우선임을 확인한다.

- [ ] **Step 3: 자유기도 전체 focused test 실행**

Run:

```bash
npm test -- --runInBand __tests__/stacks/freePrayer.test.tsx
```

Expected: PASS.

- [ ] **Step 4: 커밋**

Run:

```bash
git add __tests__/stacks/freePrayer.test.tsx
git commit -m "test: cover running free prayer reconnect"
```

---

### Task 6: 정리 및 전체 검증

**Files:**
- Modify: `app/(app)/(stacks)/freePrayer.tsx`
- Verify: `storage/asyncStorageKeys.ts`
- Verify: `app/(app)/(tabs)/index.tsx`
- Verify: `__tests__/stacks/freePrayer.test.tsx`

- [ ] **Step 1: freePrayer trailing whitespace 제거**

`app/(app)/(stacks)/freePrayer.tsx`에서 아래 코드를:

```tsx
        <Animated.View style={[styles.intro, { opacity: introOpacity }]}>
```

아래 코드로 교체한다.

```tsx
        <Animated.View style={[styles.intro, { opacity: introOpacity }]}>
```

그리고 아래 코드를:

```tsx
        <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
```
아래 코드로 교체한다.

```tsx
        <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
```

- [ ] **Step 2: whitespace check 실행**

Run:

```bash
git diff --check origin/main...HEAD
```

Expected: PASS with no output.

- [ ] **Step 3: focused Jest tests 실행**

Run:

```bash
npm test -- --runInBand __tests__/stacks/freePrayer.test.tsx
```

Expected: PASS.

- [ ] **Step 4: TypeScript 실행**

Run:

```bash
npx tsc --noEmit
```

Expected: 기존 unrelated 오류만 실패해야 한다.

```text
components/SoundBox.tsx(36,18): error TS2554: Expected 1 arguments, but got 0.
components/SoundBox.tsx(37,27): error TS2554: Expected 1 arguments, but got 0.
components/Header.tsx(5,12): error TS2503: Cannot find namespace 'JSX'.
components/Header.tsx(6,11): error TS2503: Cannot find namespace 'JSX'.
components/Header.tsx(7,12): error TS2503: Cannot find namespace 'JSX'.
```

- [ ] **Step 5: lint 실행**

Run:

```bash
npm run lint
```

Expected: `app/login.tsx`, `app/(app)/(tabs)/mypage.tsx`의 기존 unrelated lint 오류로 실패한다. `expo lint`가 `eslint.config.js`를 다시 생성하면 아래 명령으로 그 파일만 제거한다.

```bash
rm eslint.config.js
```

- [ ] **Step 6: 최종 diff 확인**

Run:

```bash
git diff --stat origin/main...HEAD
git diff origin/main...HEAD -- storage/asyncStorageKeys.ts 'app/(app)/(tabs)/index.tsx' 'app/(app)/(stacks)/freePrayer.tsx' __tests__/stacks/freePrayer.test.tsx
```

Expected: diff에는 optional payload 필드, runtime guard 확장, 일시정지 저장/복구 로직, 관련 테스트, whitespace cleanup만 포함되어야 한다.

- [ ] **Step 7: 최종 커밋**

Run:

```bash
git add storage/asyncStorageKeys.ts 'app/(app)/(tabs)/index.tsx' 'app/(app)/(stacks)/freePrayer.tsx' __tests__/stacks/freePrayer.test.tsx
git commit -m "fix: prevent paused free prayer reconnect time drift"
```

---

## 셀프 리뷰

**Spec coverage:** 이 계획은 P2 실패 조건을 직접 다룬다. 자유기도를 일시정지한 상태로 백그라운드/종료해도 멈춰 있던 wall-clock 시간이 기도 시간으로 더해지지 않고, reconnect 시 타이머가 paused 상태로 복구된다.

**Placeholder scan:** 각 단계에는 정확한 파일 경로, 테스트 코드, 구현 코드, 실행 명령, 예상 결과가 포함되어 있다.

**Type consistency:** 새 필드명은 `AsyncIsPrayingType`, 두 runtime guard, 저장 payload, 복구 로직, 테스트에서 모두 `isPlaying`, `remainingSeconds`로 일관된다.
