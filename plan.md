# freePrayer 필수 이식 구현 계획

## 진행 현황
- [x] 브랜치 생성
- [x] `ASYNC_IS_PRAYING` 타입 확장
- [x] `freePrayer.tsx` 필수 이식(복구/AppState/절대시간/백그라운드 오디오 정책) 구현
- [x] 홈 `index.tsx` free/lecture 복구 분기 구현
- [x] free reconnect E2E 시나리오 파일 추가 및 smoke 묶음 연결
- [ ] E2E 실제 실행 및 결과 기록
- [ ] PR 본문 작성/체크리스트 정리

## 0. 시작: 브랜치 생성 (작업 시작 조건)
1. 작업 시작 전 브랜치 생성
- 명령어: `git checkout -b codex/free-prayer-mandatory-port-plan`
- 목적: `main` 보호 + 구현/리뷰 범위 분리

2. 기준 문서 고정
- 기준: `research.md` 최신 분석 결과
- 목표: `lectureDetail/[lecture_id].tsx` 기준의 **필수 이식 항목 전부 구현**

---

## 1. 구현 목표 요약

1. `freePrayer.tsx`에 필수 이식 5개를 모두 반영한다.
- `ASYNC_IS_PRAYING` 진행 상태 저장
- `isReconnect` 기반 복구 진입
- `endTimeRef` 기반 절대 시간 복구
- background 전환 전 재생 상태 기억/복원
- background 오디오 정책 명시 구현 (계속 재생 or 명시 pause)

2. 홈의 “이어서 기도하기” 복구 동선을 freePrayer까지 확장한다.

3. 기존 freePrayer 고유 기능(ending 효과음)은 유지한다.

4. 선택 이식 중 `planAudit` 삭제 유도 로직은 **불필요로 판단하여 범위에서 제외**한다.
- 즉, `freePrayer`에 `planAudit-{plan_id}` 제거/재다운로드 유도 로직을 추가하지 않는다.

---

## 2. 범위 정의

### In Scope (이번 작업)
- `app/(app)/(stacks)/freePrayer.tsx`
- `app/(app)/(tabs)/index.tsx`
- `storage/asyncStorageKeys.ts` (필요 시 타입 확장)
- `e2e/maestro/*` (free reconnect E2E 추가/수정)

### Out of Scope (이번 작업에서 제외)
- `freePrayer`에 강의 캡션 기반 text 탭 추가
- freePrayer용 voice 트랙 추가/복구 (`playVoiceBy`, `adjustVoiceBy`)
- `planAudit` 삭제 유도 로직 도입

---

## 3. 구현 상세 계획 (파일 단위)

## 3-1. `storage/asyncStorageKeys.ts` 정합성 확장
1. `ASYNC_IS_PRAYING` payload가 freePrayer도 표현할 수 있도록 타입 확장한다.
- 후보 필드: `entryPath` 또는 `prayerMode` (`lecture` | `free`)
- free 복구에 필요한 필드: `prayer_minutes`, `plan_id`, `plan_title`, `lecture_id`, `repeatCount`, `endTime`

2. 하위 호환을 유지한다.
- 기존 lecture 저장 payload를 읽을 수 있게 optional 필드 사용

결과물:
- 타입 선언만 확장하고 기존 키 이름(`is_praying`)은 유지

## 3-2. `freePrayer.tsx` 라우트/상태 축 확장
1. 라우트 파라미터 확장
- 현재: `lecture_id`, `plan_title`, `prayer_minutes`
- 변경: `plan_id`, `lecture_id`, `plan_title`, `prayer_minutes`, `isReconnect?`

2. 복구용 ref 추가
- `endTimeRef`
- `repeatCountRef`
- `elapsedTimeRef`
- `isPlayingRef`
- `wasPlayingBeforeBackgroundRef`

3. ref/state 동기화 effect 추가
- 렌더 타이밍과 무관하게 background 저장 시 최신값 참조 가능하게 구성

## 3-3. `freePrayer.tsx` 시작/재연결 분기 구현
1. `startNewTimer(prayerDurationSeconds)` 구현
- `isPlaying = true`
- `duration/initialRemainingTime` 설정
- `endTimeRef = now + duration*1000`

2. `restoreFromSavedState` 구현
- `ASYNC_IS_PRAYING` 파싱
- 저장 `repeatCount`, `endTime` 기준 총 경과시간 계산
- `handleAdjustElapsedTime(totalElapsedSec, duration)` 적용
- 복구 성공 시 `ASYNC_IS_PRAYING` 제거

3. 복구 실패 폴백
- 파싱 오류/필드 부족 시 저장 키 제거 후 신규 시작
- 사용자에게 blocking alert 없이 자연 폴백 우선

## 3-4. `freePrayer.tsx` AppState 전환 처리 구현
1. background 진입 처리
- background 직전 재생 여부 저장 (`wasPlayingBeforeBackgroundRef`)
- 화면 타이머는 pause 처리 (`setIsPlaying(false)`)로 일관성 유지
- `ASYNC_IS_PRAYING` 저장
  - free 기도임을 식별할 필드 포함
  - 복구 파라미터(`plan_id`, `lecture_id`, `plan_title`, `prayer_minutes`) 포함
  - 타이밍 정보(`repeatCount`, `endTime`) 포함

2. foreground 복귀 처리
- background 직전 재생 상태 복원 (`setIsPlaying(wasPlayingBeforeBackgroundRef.current)`)
- 필요한 경우 오디오 상태 동기화

3. 이벤트 구독/해제 안정화
- 중복 구독 방지
- unmount 시 안전하게 정리

## 3-5. `freePrayer.tsx` 오디오 정책 반영 (필수)
1. 정책 결정
- `lectureDetail` 동작 정렬을 우선하여 background에서도 오디오 지속 재생 방향으로 구현

2. 구현 포인트
- 기존 `shouldPlay`에서 `appStateVisible === "active"` 강제 조건 제거
- pause/play 조건을 `isPlaying` + `isBgmMute` 중심으로 재구성
- background 진입 시 의도치 않게 `pauseBgm()` 되지 않도록 조정

3. ending 효과음 동작 보호
- foreground 복귀 시점 보정으로도 중복 재생되지 않게 기존 guard(`hasPlayedEndingRef`, `isEndingTriggeringRef`) 유지

## 3-6. `freePrayer.tsx` pause/resume 시간 보정
1. pause 시점 기록 유지
- `pausedTime` 저장

2. resume 시 절대 종료 시각 보정
- `endTimeRef += pauseDuration`

3. `handlePressPlay`에서 오디오 동기화 정합성 확인
- `amp.pause()` / `amp.resumeAudio()` 또는 동등 로직으로 일관성 확보

## 3-7. `index.tsx` 이어서 기도하기 라우팅 분기
1. `ASYNC_IS_PRAYING` payload의 식별 필드로 분기
- lecture면 기존 `/lectureDetail/[lecture_id]`
- free면 `/freePrayer`로 이동

2. free 이동 시 파라미터 전달
- `plan_id`, `lecture_id`, `plan_title`, `prayer_minutes`, `isReconnect: 'true'`

3. 기존 3시간 TTL 규칙 유지
- 만료 시 저장 상태 삭제

---

## 4. E2E 검증 계획 (필수 검증)

## 4-1. 기존 E2E 회귀
1. 기본 스모크
- `npm run e2e:smoke`

2. free flow 재확인
- `npm run e2e:ios:smoke` 또는 `npm run e2e:android:smoke` 환경에 맞게 실행

## 4-2. 신규 E2E 시나리오 추가
1. `flow_free_reconnect_smoke.yaml` (신규)
- freePrayer 진입
- 기도 진행 상태를 저장하도록 background/재실행 시나리오 수행
- 홈에서 “이어서 기도하기” 선택
- `/freePrayer` 재진입 검증 (`free-prayer-quit` visible)
- 기존처럼 `/lectureDetail`로 잘못 이동하지 않는지 검증

2. 회귀 묶음 연결
- `smoke.yaml` 또는 별도 reconnect smoke 묶음에 신규 flow 연결

## 4-3. E2E 판정 기준
1. 통과 기준
- free reconnect 경로에서 화면 진입 실패 없음
- alert 분기 후 재개 라우팅 정확
- prayer record 저장 흐름 기존 대비 회귀 없음

2. 실패 시 조치
- AppState 전환 타이밍 로그 추가
- 저장 payload 파싱/필드 누락 점검
- 안정화 후 재실행

---

## 5. 코드 품질/리스크 관리

1. 타입 안정성
- `ASYNC_IS_PRAYING` 파싱은 런타임 가드로 보호

2. 호환성
- 과거 저장 포맷(lecture 전용)도 깨지지 않게 optional 필드 중심 설계

3. 회귀 리스크
- 홈의 “이어서 기도하기”가 lecture/free 모두 정상 분기되는지 집중 확인
- freePrayer에서 ending 효과음 재생 타이밍 회귀 여부 확인

4. 불필요 구현 방지
- `planAudit` 삭제 유도 로직은 이번 범위에서 제외
- 관련 alert/삭제 코드 추가 금지

---

## 6. 커밋 계획

1. Commit 1: 타입/라우팅 계약
- `ASYNC_IS_PRAYING` 타입 확장
- freePrayer 파라미터 확장

2. Commit 2: freePrayer 복구/AppState/오디오 정책
- 필수 이식 5개 구현

3. Commit 3: 홈 복구 분기
- index 이어서 기도하기 free 분기

4. Commit 4: E2E 추가/수정
- reconnect flow + smoke 연결

커밋 메시지 예시:
- `feat: add free prayer reconnect state persistence`
- `test: add free prayer reconnect maestro flow`

---

## 7. 완료 정의 (Definition of Done)

1. `research.md`의 필수 이식 항목 5개가 코드로 반영됨
2. 선택 이식 중 `planAudit` 삭제 유도 로직은 미적용으로 명시됨
3. E2E 시나리오에서 free reconnect 경로가 통과함
4. 기존 smoke/regression 주요 흐름 회귀 없음
5. 린트/타입 오류 없음

---

## 8. 종료: PR 작성 (작업 마무리)

1. PR 본문 구성
- 배경: `research.md` 기반 필수 이식
- 변경점: freePrayer 복구/백그라운드 오디오/홈 분기/E2E
- 제외점: `planAudit` 삭제 유도 로직 미적용 사유
- 검증: 실행한 E2E 명령과 결과 첨부
- 리스크: AppState 타이밍, 구버전 저장 payload 호환

2. PR 체크리스트
- [ ] 필수 이식 5개 반영 확인
- [ ] free reconnect 라우팅 확인
- [ ] E2E 결과 첨부
- [ ] 회귀 포인트(lecture flow, record 저장) 확인

3. PR 생성 명령 예시
- `gh pr create --fill`
