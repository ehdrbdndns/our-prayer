# `lectureDetail/[lecture_id].tsx` vs `freePrayer.tsx` 상세 비교 리서치

## 1) 조사 범위
- 기준 파일: `app/(app)/(stacks)/lectureDetail/[lecture_id].tsx`
- 비교 파일: `app/(app)/(stacks)/freePrayer.tsx`
- 연관 검토 파일:
  - `classes/Amp.ts`
  - `components/timer/Timer.tsx`
  - `app/(app)/(tabs)/index.tsx` (`ASYNC_IS_PRAYING` 복구 플로우 확인)

---

## 2) 두 파일의 공통점 (같은 점)

### 2-1. 화면/UX 골격은 거의 동일
- 둘 다 `useKeepAwake()`로 기도 중 화면 꺼짐 방지
- 둘 다 `useScreenTransition` 기반 Intro -> Content 전환
- 둘 다 `Header` + `그만두기` + BGM 뮤트 토글 아이콘 구성
- 둘 다 `Timer` 컴포넌트를 중심으로 타이머 진행
- 둘 다 `PrayerTopicChecklist` 탭 제공
- 둘 다 종료 시 `/prayerRecord`로 이동

### 2-2. 핵심 상태 구조도 유사
- 공통 타이머 상태: `timerKey`, `repeatCount`, `duration`, `initialRemainingTime`, `elapsedTime`, `pausedTime`
- 공통 재생 상태: `isPlaying`, `isBgmMute`
- 공통 앱 상태: `appStateVisible`
- 공통 이벤트:
  - `handleAdjustElapsedTime`
  - `handlePressPlay`
  - `handlePressMusic`
  - `handleCompleteTimer`
  - `handlePressCompleteBtn`

### 2-3. `Timer` 연동 계약은 동일
- 동일 props 전달:
  - `repeatCount`, `duration`, `initialRemainingTime`, `isPlaying`, `appState`
  - `onAdjustElapedTime`, `setElapsedTime`, `onPressPlay`, `onComplete`, `onPressCompleteBtn`
- 즉, 타이머 표시/반복/완료 버튼 동작의 기본 메커니즘은 공유됨.

---

## 3) 큰 구조 차이 (아키텍처 차이)

### 3-1. 데이터 소스 차이

#### `lectureDetail/[lecture_id].tsx`
- `useLectureQuery({ lecture_id })`로 서버 강의 데이터 + `lectureAudios`를 조회
- 강의 길이(`lecture.time`), BGM 유효성(`lecture.bgm`), 자막 텍스트(`lectureAudios.caption`)를 서버 기반으로 처리
- `isLectureSuccess`가 화면 준비 조건

#### `freePrayer.tsx`
- 서버 강의 조회 없음
- `prayer_minutes` 라우트 파라미터를 숫자로 정규화해 사용 (`1~300`분 clamp)
- 화면 준비 조건은 고정 `isDataLoaded: true`

핵심: `lectureDetail`은 “서버 강의 기반”, `freePrayer`는 “로컬 선택 시간 기반” 구조.

### 3-2. Amp 생성/운영 전략 차이

#### `lectureDetail`
- `amp`를 `state`로 보관 (`useState<Amp>()`)
- `new Amp(lecture_id, lectureAudios, { isPlaying: true })`
- BGM/voice 모두 AsyncStorage 기반 오디오 키로 로딩
- `elapsedTime` 변화마다 `amp.playVoiceBy(elapsedTime)` 호출 (음성 캡션 재생)

#### `freePrayer`
- `ampRef` (`useRef<Amp | null>`)로 보관
- `new Amp("free", [], { bgmSource: module, effectSources: { ending: module } })`
- voice 목록은 빈 배열, 대신 종료 20초 전 `ending` 효과음 재생

핵심: `lectureDetail`은 음성 트랙 중심, `freePrayer`는 BGM + ending effect 중심.

### 3-3. 탭 모드 차이

#### `lectureDetail`
- `mode: "timer" | "topic" | "text"`
- `lectureAudios`가 있으면 "본문" 탭 노출
- 본문 탭에서 캡션들을 `start_time`순으로 렌더링

#### `freePrayer`
- `mode: "timer" | "topic"`
- 본문(text) 모드 없음

### 3-4. 백그라운드/포그라운드 처리 철학 차이

#### `lectureDetail`
- AppState 전환 시 명시적 상태 머신 동작:
  - background 진입:
    - `wasPlayingBeforeBackgroundRef` 저장
    - `setIsPlaying(false)`
    - `amp.changeToBackgroundState(elapsedTimeRef.current)`
    - `ASYNC_IS_PRAYING`에 복구 정보 저장 (`plan_id`, `lecture_id`, `repeatCount`, `endTime`...)
  - active 복귀:
    - background 직전 재생 상태 복원
    - 필요 시 `amp.changeToForgroundState()`
- 결과적으로 앱 재진입 복구(홈의 “이어서 기도하기”)와 연동됨.

#### `freePrayer`
- AppState는 `appStateVisible` 갱신만 수행
- BGM 재생 여부는 별도 effect에서 `isPlaying && !isBgmMute && active` 조건으로 동기화
- `ASYNC_IS_PRAYING` 저장/복구 로직 없음

핵심: `freePrayer`는 “현재 세션 동기화”만 있고 “세션 복구”가 없음.

---

## 4) 코드 구현 레벨 상세 차이

## 4-1. 라우트 파라미터

### `lectureDetail`
- 입력: `plan_id`, `lecture_id`, `plan_title`, `isReconnect?`
- `isReconnect`가 true면 저장된 기도 상태 복구 경로 진입

### `freePrayer`
- 입력: `lecture_id`, `plan_title`, `prayer_minutes`
- `isReconnect` 없음
- `plan_id`도 받지 않음(현재 화면 로직에서 필요 데이터 최소화)

영향: free 기도는 중단 후 재연결 시작점을 계산할 데이터(`endTime`, `repeatCount` 원본)가 없음.

## 4-2. 타이머 시작/복구 초기화

### `lectureDetail`
- 최초 시작 `startNewTimer()`에서 `endTimeRef = now + duration`
- 재연결 시 AsyncStorage의 `savedEndTime`, `savedRepeatCount`로 총 경과시간 계산
- `amp.adjustVoiceBy(totalElapsedSec)`로 음성 위치까지 복구

### `freePrayer`
- 콘텐츠 표시 시 항상 신규 시작처럼 초기화
- `repeatCount = 0`, `isPlaying = true`, `duration = selectedMinutes * 60`
- 중단 복귀 시점 계산 없음

## 4-3. 재생/일시정지 구현

### `lectureDetail`
- `pauseAll()`:
  - `amp.pause()`
  - `isPlaying=false`
  - `pausedTime` 저장
- `resumeAll()`:
  - `amp.resumeAudio()`
  - `isPlaying=true`
  - `endTimeRef += pauseDuration` (복구 시 절대 종료시각 보정)

### `freePrayer`
- `handlePressPlay()`에서 `isPlaying`만 토글
- pause 시각은 저장하지만 `endTimeRef` 개념 자체가 없음
- 실제 오디오 pause/resume은 별도 BGM sync effect에 간접 의존

영향: freePrayer는 “남은시간 기준 절대 시각 관리”가 없어 reconnect 정확도 설계가 불가능한 구조.

## 4-4. 오디오 예외 처리

### `lectureDetail`
- `lecture.bgm === ''`면 Alert + `planAudit-{plan_id}` 제거 + `/plan` 이동
- `amp.turnOn()` 실패 시도 동일하게 재다운로드 유도
- 서버 데이터 비정상(`isLectureSuccess && data === undefined`)이면 `<Redirect href="/plan" />`

### `freePrayer`
- Amp turnOn 실패 시 Alert 후 `/plan`으로 이동
- 그러나 `planAudit` 제거/재다운로드 유도 같은 플로우는 없음(모듈 번들 오디오 사용이므로 설계상 차이)

## 4-5. 배경 실행 중 음성 스케줄링

### `lectureDetail`
- `amp.changeToBackgroundState(elapsedTime)` 사용
- `Amp` 내부에서 각 voice 시작 시간을 timeout 예약

### `freePrayer`
- voice 트랙이 없으므로 해당 로직 미사용
- 대신 종료 20초 전 `playEffect("ending")` 한 번만 트리거

## 4-6. 본문 탭 및 텍스트 렌더링

### `lectureDetail`
- `isTextModeAvailable = lectureAudios.length > 0`
- text 모드 진입 시 캡션 join 렌더링 + 하단 gradient overlay
- 오디오가 없을 때 text 모드 자동 해제

### `freePrayer`
- 해당 기능 전체 없음

## 4-7. freePrayer 백그라운드 음성 재생 검증 (추가 요청)

판정: **현재 `freePrayer`는 앱이 백그라운드로 전환되면 음성(BGM/효과음)을 지속 재생하지 않도록 구현되어 있음.**

근거:
1. `freePrayer.tsx`의 BGM 동기화 로직에서 `shouldPlay` 조건이 `appStateVisible === "active"`를 강제함.
- 즉 active가 아니면 `amp.pauseBgm()` 분기로 들어감.

2. 전역 오디오 모드(`app/_layout.tsx`)에는 `staysActiveInBackground: true`가 설정되어 있음.
- OS/엔진 레벨로는 백그라운드 재생이 가능하지만, `freePrayer` 화면 로직에서 명시적으로 pause하기 때문에 실제로는 계속 재생되지 않음.

3. `ending` 효과음은 `elapsedTime` 기반 트리거인데, `Timer`는 background 중 실시간 증가 대신 foreground 복귀 시 보정하는 구조.
- 따라서 background 체류 중 20초 구간에 진입해도 그 시점에 효과음이 재생되지 않고, 복귀 후 상태 보정에 의해 이미 구간이 지난 경우 트리거 자체가 누락될 수 있음.

정리:
- 질문하신 “앱이 background로 넘어가도 freePrayer에서 음성이 제대로 나오는 기능”은 **현재 구현되어 있지 않다**고 판단됨.

---

## 5) `freePrayer.tsx`에 “빠진 기능” 분석 (기준: `lectureDetail`)

아래는 “`lectureDetail` 기준으로 보면 누락”된 항목이며, 자유기도 특성상 **필수 이식**과 **선택 이식**으로 분리했다.

## 5-1. 필수 이식 (복구/연속성 관점에서 반드시 필요)

1. `ASYNC_IS_PRAYING` 저장 로직 부재
- 현재 `freePrayer`는 기도 종료 시 삭제만 하고, 진행 중 저장을 하지 않음.
- 결과: 홈(`app/(app)/(tabs)/index.tsx`)의 “이어서 기도하기” 복구 플로우에서 free prayer 상태가 잡히지 않음.

2. `isReconnect` 기반 복구 진입점 부재
- `lectureDetail`은 `isReconnect` + 저장된 상태로 elapsed/repeat/endTime 복원.
- `freePrayer`는 항상 신규 시작으로 초기화됨.

3. 절대 종료 시각(`endTimeRef`) 관리 부재
- pause/resume/background 이후 정확한 경과시간 계산을 위한 기준값이 없음.
- reconnect 구현하려면 `endTimeRef`가 필요.

4. background 전환 시 “재생 전 상태 기억” 부재
- `wasPlayingBeforeBackgroundRef` 패턴이 없어 복귀 시 재생 상태 일관성이 깨질 여지가 있음.

5. background 상태에서 음성 지속 재생 정책 부재
- 현재는 background 전환 시 BGM을 pause하는 조건으로 동작.
- 만약 요구사항이 “background에서도 자유기도 음성이 이어져야 함”이라면 명시적 보강이 필요.

## 5-2. 선택 이식 (자유기도 성격에 따라 결정)

1. 본문(text) 탭
- free prayer에서 텍스트 본문이 필수인지 정책 결정 필요.
- 자유기도가 캡션/스크립트 없는 모드라면 미도입이 자연스러움.

2. voice 재생/복구(`playVoiceBy`, `adjustVoiceBy`)
- free prayer는 voice 트랙이 없으므로 그대로 이식 불필요.
- 단, 향후 “가이드 음성 자유기도”로 확장 계획이 있으면 구조 여지는 고려 필요.

3. `planAudit` 삭제 유도 로직
- free prayer는 번들 모듈 오디오(`require(...)`)라 재다운로드 플로우 의미가 약함.

---

## 6) 구현 차이 요약표

| 관점 | `lectureDetail/[lecture_id].tsx` | `freePrayer.tsx` | gap |
|---|---|---|---|
| 데이터 로딩 | 서버 `useLectureQuery` | 로컬 params | 서버 복구정보 없음 |
| 모드 | timer/topic/text | timer/topic | text 모드 누락 |
| Amp 소스 | 저장된 BGM + voice | 번들 BGM + ending effect | voice 흐름 없음 |
| 재연결 | `isReconnect` + saved state restore | 없음 | 복구 기능 누락 |
| 백그라운드 | 상태 저장 + Amp background scheduling | AppState 반영 + BGM sync | 진행상태 영속화 누락 |
| 백그라운드 오디오 지속 | background에서도 voice 스케줄링으로 재생 지속 설계 | `active` 조건이 아니면 `pauseBgm()` | background 음성 지속 재생 미구현 |
| 종료 전 효과음 | 없음 | ending effect(20초 전) | freePrayer 전용 장점 |

---

## 7) `freePrayer` 개선을 위한 권장 구현 순서

1. `freePrayer` 라우트 파라미터에 `plan_id`, `isReconnect` 추가
- `freePrayerSetup`에서 `plan_id` 전달은 이미 하고 있으므로 수신만 정합화 가능.

2. `endTimeRef`, `repeatCountRef`, `elapsedTimeRef`, `isPlayingRef`, `wasPlayingBeforeBackgroundRef` 도입
- `lectureDetail`과 동일한 복구 계산 축 확보.

3. AppState effect 확장
- background 진입 시 `ASYNC_IS_PRAYING` 저장
- active 복귀 시 배경 진입 직전 재생 상태 복원

4. 시작 effect 분기
- `isReconnect && ASYNC_IS_PRAYING`이면 saved state로 복구
- 아니면 신규 시작

5. 홈 복귀 라우팅 정책 결정
- 현재 홈의 “이어서 기도하기”는 `/lectureDetail/[lecture_id]` 고정.
- free prayer도 복구 대상에 넣으려면:
  - (A) `ASYNC_IS_PRAYING` payload에 `mode` 또는 `entryPath` 추가
  - (B) 홈에서 조건 분기하여 `/freePrayer`로 이동

6. 기존 freePrayer 고유 기능(ending effect)은 유지
- 복구 로직 추가 후에도 종료 20초 전 효과음 트리거는 병행 가능.

7. 백그라운드 음성 정책 확정 후 구현
- 정책 A: background에서도 계속 재생하려면 `appStateVisible === "active"` 조건 완화 및 AppState 전환 시 pause 강제 제거 필요.
- 정책 B: foreground 전용 재생이 의도라면 현재 동작을 명시적으로 문서화(요구사항 확정)하는 것이 안전.

---

## 8) 결론
- 현재 `freePrayer.tsx`는 UI/타이머 기본 골격은 `lectureDetail`과 유사하지만,
  **중단-복귀(재연결)와 진행 상태 영속화라는 핵심 세션 연속성 기능이 빠져 있다.**
- 추가 검증 결과, background 전환 시 freePrayer 음성 지속 재생도 현재는 미구현 상태다.
- 목표가 “`lectureDetail` 기준으로 freePrayer 누락 기능 추가”라면,
  1차 우선순위는 **`ASYNC_IS_PRAYING` 저장 + `isReconnect` 복구 + `endTimeRef` 기반 시간 보정**이다.
- 본문(text)/voice 계열 기능은 자유기도 정책에 따라 선택 적용이 적절하다.
