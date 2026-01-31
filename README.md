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
### 2.1 Frontend
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

  ### 2.2 Backend

  | Category | Stack | Description |
  |---------|-------|-------------|
  | API | API Gateway + AWS Lambda (Node.js) | REST API 엔드포인트 및 비즈니스 로직 |
  | DB | EC2 (MySQL) | 데이터베이스 운영 |
  | Storage | S3 | 파일/정적 리소스 저장 |
  | Messaging | SQS / SNS | 비동기 처리 및 알림 |
  | Deployment | AWS SAM | 자동 배포 |
  | Auth | JWT | 인증 토큰 기반 |
  | Notification | Expo Push Token | 푸시 알림 연동 |

## 3. 아키텍처
