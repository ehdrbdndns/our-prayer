<img width="1920" height="1080" alt="export" src="https://github.com/user-attachments/assets/4433f3fd-69d6-458b-929e-8c8154919062" />

## 배포
- ios : https://apple.co/4qQupBh
- andorid : http://bit.ly/49RsfLu

## 1. 프로젝트 소개
**우리의 기도**는 기독교 신앙을 기반으로,  
사용자가 **기도를 배우고 이를 일상의 습관으로 만들 수 있도록 돕는 서비스**입니다.

기도는 **타이머 기반**으로 제공되며,  
사용자는 **기도 강의를 들으며 기도하거나**, 혹은 **강의 없이 자유롭게 기도**할 수 있습니다.

기도 강의는 **음성 중심의 가이드형 콘텐츠**로,  
기도 방법에 익숙하지 않더라도 안내되는 흐름을 따라가며 부담 없이 기도에 집중할 수 있도록 돕습니다.

또한 기도 기록, 연속 기도(streak) 관리 기능을 통해  
기도를 일회성 행위가 아닌 **지속 가능한 신앙의 루틴**으로 만드는 것을 목표로 합니다.

본 프로젝트는 **React Native 기반의 개인 프로젝트**로,  
iOS와 Android에 실제 배포되어 운영되고 있습니다.

## 2. 개발 환경
### 1) Frontend
#### Core Stack
| Library | Version | Description |
|-------|---------|-------------|
| Expo | ^54.0.0 | React Native 기반 앱 프레임워크 및 빌드 플랫폼 |
| React Native | ^0.81.5 | 모바일 앱 프레임워크 |
| React | 19.1.0 | UI 구성 라이브러리 |
| TypeScript | ~5.9.2 | 정적 타입을 통한 안정성 확보 |
| Expo Router | ~6.0.15 | 파일 기반 라우팅 |

#### Expo Ecosystem
| Library | Version | Description |
|-------|---------|-------------|
| Expo Router | ~6.0.15 | 파일 기반 라우팅 |
| expo-notifications | ~0.32.13 | 푸시 알림 |
| expo-av | ~16.0.7 | 오디오/비디오 처리 |
| expo-file-system | ~19.0.19 | 로컬 파일 접근 |
| expo-secure-store | ~15.0.7 | 보안 저장소 |

#### 3rd‑party
| Library | Version | Description |
|-------|---------|-------------|
| axios | ^1.7.9 | HTTP 클라이언트 |
| @tanstack/react-query | ^5.62.7 | 서버 상태 관리/캐싱 |
| @react-native-async-storage/async-storage | 2.2.0 | 로컬 저장소 |
| react-native-calendars | ^1.1313.0 | 캘린더 UI |
| react-native-countdown-circle-timer | ^3.2.1 | 타이머 UI |
| @react-native-community/netinfo | ^11.4.1 | 네트워크 상태 감지 |

### 2) Backend
| Category | Stack | Description |
|---------|-------|-------------|
| API | API Gateway + AWS Lambda (Node.js) | REST API 엔드포인트 및 비즈니스 로직 |
| DB | EC2 (MySQL) | 데이터베이스 운영 |
| Storage | S3 | 파일/정적 리소스 저장 |
| Messaging | SQS / SNS | 비동기 처리 및 알림 |
| Deployment | AWS SAM | 자동 배포 |
| Auth | JWT | 인증 토큰 기반 |
| Notification | Expo Push Token | 푸시 알림 연동 |

## 3. 주요 기능
### 1) 기도 플랜 탐색
https://github.com/user-attachments/assets/527dadec-4f93-4367-bfa5-ecbede7b8e63

**페이지 설명**
- 전체/주제/자유 분류로 플랜을 빠르게 탐색

**기술적 포인트**
- TanStack Query로 플랜 목록 캐싱 및 갱신
- 필터/검색 UI에서 로컬 상태로 빠른 탐색 제공

### 2) 강의 기반 기도 진행
https://github.com/user-attachments/assets/773587ad-f1a3-43e8-9dc1-b40792a4c5be

**페이지 설명**
- 오디오로 나오는 기도 가이드를 듣고, 따라가며 부담 없이 기도에 집중

**기술적 포인트**
- `expo-av` + FileSystem 캐시로 오디오 재생 안정화 (`classes/Amp.ts`, `utils/audioFile.ts`)
- 타이머 진행 상태를 로컬에 저장해 중단/복귀 흐름 제공 (`ASYNC_IS_PRAYING`)

### 3) 기도 기록/통계
https://github.com/user-attachments/assets/062fc8ff-5763-4f7b-8c52-74a646af53df

**페이지 설명**
- 연속 기도, 오늘/누적 기도 시간을 캘린더로 확인
  
**기술적 포인트**
- 기록 API 조회 후 클라이언트 계산 로직으로 통계 집계 (`utils/date.ts`)
- TanStack Query 캐싱으로 화면 전환 시 로딩 최소화

### 4) 상담/질문 기능

| 질문 등록 | 관리자 답변 |
|----------|------------|
| ![](https://github.com/user-attachments/assets/1f544a73-b1a6-4a71-b050-6f4baeca9f3e) | ![](https://github.com/user-attachments/assets/4ac71053-5f56-4113-b5e1-3adfdb9943db) |

#### 질문 등록
https://github.com/user-attachments/assets/1f544a73-b1a6-4a71-b050-6f4baeca9f3e

#### 관리자 답변
https://github.com/user-attachments/assets/4ac71053-5f56-4113-b5e1-3adfdb9943db

**페이지 설명**
- 질문 등록/조회/삭제 및 답변 확인
- 관리자 답변 시 사용자에게 알림
  
**기술적 포인트**
- TanStack Query + Mutation으로 목록 동기화 및 낙관적 업데이트
- 상세 화면은 라우트 파라미터 기반으로 데이터 로딩
- 사용자의 Expo Push Token을 통해 관리자 답변 알림 수신
