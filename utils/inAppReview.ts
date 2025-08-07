
import {
  ASYNC_LAST_REVIEWED_VERSION,
  ASYNC_LAST_REVIEW_REQUEST_TIMESTAMP,
  ASYNC_REVIEW_REQUEST_COUNT
} from "@/storage/asyncStorageKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from 'expo-application';
import * as StoreReview from 'expo-store-review';

const SMART_REVIEW_REQUEST_DELAY = 1000 * 60 * 60 * 24 * 2; // 2일
const MAX_REVIEW_REQUESTS_PER_VERSION = 3;

/**
 * 앱 버전, 요청 횟수, 시간 등을 모두 고려하여 스마트하게 리뷰를 요청하는 함수
 * @param setShouldRequestReview - 리뷰 요청 '의도'를 다시 false로 되돌리기 위한 setter 함수
 */
export const handleSmartReviewRequest = async (
  setShouldRequestReview: (value: boolean) => void
) => {
  try {
    // 1. 필요한 모든 정보 가져오기
    const lastReviewedVersion = await AsyncStorage.getItem(ASYNC_LAST_REVIEWED_VERSION);
    const currentVersion = Application.nativeApplicationVersion || '0.0.0';
    const requestCountStr = await AsyncStorage.getItem(ASYNC_REVIEW_REQUEST_COUNT);
    const requestCount = requestCountStr ? parseInt(requestCountStr, 10) : 0;
    const lastRequestTimestampStr = await AsyncStorage.getItem(ASYNC_LAST_REVIEW_REQUEST_TIMESTAMP);
    const lastRequestTimestamp = lastRequestTimestampStr ? parseInt(lastRequestTimestampStr, 10) : 0;

    // 2. 앱 버전이 바뀌었는지 체크
    if (lastReviewedVersion !== currentVersion) {
      // 버전이 바뀌었다면, 모든 기록을 초기화하고 리뷰 요청
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
        // 새 버전에 대한 기록 저장
        await AsyncStorage.setItem(ASYNC_LAST_REVIEWED_VERSION, currentVersion);
        await AsyncStorage.setItem(ASYNC_REVIEW_REQUEST_COUNT, '1');
        await AsyncStorage.setItem(ASYNC_LAST_REVIEW_REQUEST_TIMESTAMP, Date.now().toString());
      }
    } else {
      // 3. 같은 버전일 경우, 횟수와 시간 제한 체크
      if (
        requestCount < MAX_REVIEW_REQUESTS_PER_VERSION &&
        (Date.now() - lastRequestTimestamp) > SMART_REVIEW_REQUEST_DELAY
      ) {
        if (await StoreReview.isAvailableAsync()) {
          await StoreReview.requestReview();
          // 요청 횟수와 시간 업데이트
          await AsyncStorage.setItem(ASYNC_REVIEW_REQUEST_COUNT, (requestCount + 1).toString());
          await AsyncStorage.setItem(ASYNC_LAST_REVIEW_REQUEST_TIMESTAMP, Date.now().toString());
        }
      }
    }
  } catch (error) {
    console.error("Failed to handle smart review request:", error);
  } finally {
    // 4. 로직이 성공하든 실패하든, 리뷰 요청 '의도'는 항상 초기화
    setShouldRequestReview(false);
  }
};
