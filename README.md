<img width="1920" height="1080" alt="export" src="https://github.com/user-attachments/assets/4433f3fd-69d6-458b-929e-8c8154919062" />

## 배포
- ios : https://apple.co/4qQupBh
- andorid : http://bit.ly/49RsfLu

## 1. 프로젝트 소개
**우리의 기도**는 기독교 신앙을 기반으로,  
사용자가 **기도를 배우고 이를 습관으로 만들 수 있도록 돕는 서비스**입니다.

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
### 1) 🔍 기도 플랜 탐색
https://github.com/user-attachments/assets/527dadec-4f93-4367-bfa5-ecbede7b8e63

**페이지 설명**
- 전체/주제/자유 분류로 플랜을 빠르게 탐색

**기술적 포인트**
- TanStack Query로 플랜 목록 캐싱 및 갱신
- 필터/검색 UI에서 로컬 상태로 빠른 탐색 제공

### 2) 🎧 강의 기반 기도 진행
https://github.com/user-attachments/assets/773587ad-f1a3-43e8-9dc1-b40792a4c5be

**페이지 설명**
- 오디오로 나오는 기도 가이드를 듣고, 따라가며 부담 없이 기도에 집중

**기술적 포인트**
- `expo-av` + FileSystem 캐시로 오디오 재생 안정화 (`classes/Amp.ts`, `utils/audioFile.ts`)
- 타이머 진행 상태를 로컬에 저장해 중단/복귀 흐름 제공 (`ASYNC_IS_PRAYING`)

### 3) 📊 기도 기록/통계
https://github.com/user-attachments/assets/062fc8ff-5763-4f7b-8c52-74a646af53df

**페이지 설명**
- 연속 기도, 오늘/누적 기도 시간을 캘린더로 확인
  
**기술적 포인트**
- 기록 API 조회 후 클라이언트 계산 로직으로 통계 집계 (`utils/date.ts`)
- TanStack Query 캐싱으로 화면 전환 시 로딩 최소화

### 4) ❓ 상담/질문 기능

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

## 4. 트러블 슈팅 및 신경 쓴 부분
### 1) OS별 백그라운드 정책으로 인한 Timer 강제 종료
👉 [문제 분석 및 해결 과정](https://medium.com/@ehdrbdndns/%EC%9A%B0%EB%A6%AC%EC%9D%98-%EA%B8%B0%EB%8F%84-os%EB%B3%84-%EB%B0%B1%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C-%EC%A0%95%EC%B1%85%EC%9C%BC%EB%A1%9C-%EC%9D%B8%ED%95%9C-react-native-countdown-circle-timer-%EA%B0%95%EC%A0%9C-%EC%A2%85%EB%A3%8C-%EC%9D%B4%EC%8A%88-%ED%95%B4%EA%B2%B0-d11e2e62cd7c?postPublishedType=repub)

### 2) Expo Tab을 JS Tab에서 Native Tab으로 전환
👉 [렌더링 방식 차이와 전환 이유](https://medium.com/@ehdrbdndns/expo-native-tab%EA%B3%BC-js-tab%EC%9D%98-%EB%A0%8C%EB%8D%94%EB%A7%81-%EB%B0%A9%EC%8B%9D-%EC%B0%A8%EC%9D%B4%EC%A0%90-d776c671b2d1)

### 3) 기도 강의 파일 크기 최적화
👉 [CBR / VBR 인코딩 비교 및 최적화](https://medium.com/@ehdrbdndns/%EC%9A%B0%EB%A6%AC%EC%9D%98-%EA%B8%B0%EB%8F%84-%EC%9D%8C%EC%84%B1-%ED%8C%8C%EC%9D%BC-%ED%81%AC%EA%B8%B0-%EC%B5%9C%EC%A0%81%ED%99%94-cbr-vbr-%EC%9D%B8%EC%BD%94%EB%94%A9-%EB%B0%A9%EC%8B%9D-f3dc697e3888)

### 4) Expo SDK 52 버전 충돌 해결
👉 [빌드 에러 원인과 해결 과정](https://medium.com/@ehdrbdndns/%EC%9D%B4%EC%8A%88-%ED%95%B4%EA%B2%B0-xcode-16-3%EA%B3%BC-expo-sdk-52-%EB%B2%84%EC%A0%84-%EC%B6%A9%EB%8F%8C-%ED%95%B4%EA%B2%B0%EA%B8%B0-c11cfd699887)

### 5) AWS 클라우드 운영 비용 절감
👉 [AWS 클라우드 비용 36% 줄였던 경험](https://medium.com/@ehdrbdndns/aws-%ED%81%B4%EB%9D%BC%EC%9A%B0%EB%93%9C-%EB%B9%84%EC%9A%A9-36-%EC%A4%84%EC%9D%B4%EA%B8%B0-free-tier-%EC%A2%85%EB%A3%8C-%ED%9B%84-rds%EB%A5%BC-ec2-docker-mysql%EB%A1%9C-%EC%98%AE%EA%B8%B0%EA%B8%B0-418b9f7c1011)
