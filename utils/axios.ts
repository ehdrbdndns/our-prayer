import axios, { AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL });
api.defaults.headers.common['Content-Type'] = 'application/json';
api.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

const handleTokenUpdate = async (accessToken: string, refreshToken: string, originalRequest: any) => {
  await SecureStore.setItemAsync('accessToken', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);

  axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  originalRequest.headers.Authorization = `Bearer ${accessToken}`;

  return axios(originalRequest); // api 재요청 함수
};

// 추후 개선 필요, 토큰 삭제시 로컬 이용자는 계정이 삭제되는 것과 같기에 다른 방법을 찾아야 함
const handleTokenDeletion = async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
};

const onSuccess = (response: AxiosResponse<any, any>) => response;

const onError = async (error: any) => {
  try {
    const originalRequest = error.config;
    console.log(error);
    console.log(originalRequest);
    if (error.response.status === 401) {
      const { expiredType, accessToken, refreshToken } = error.response.data;

      switch (expiredType) {
        case "access":
          return await handleTokenUpdate(accessToken, refreshToken, originalRequest);
        case "refresh":
        case "wrong":
          // await handleTokenDeletion();
          return new Error('예기치 못한 오류가 발생했습니다. 다시 로그인해주세요.');
        default:
          console.error(`Unexpected expiredType: ${expiredType}`);
          // await handleTokenDeletion();
          return new Error('예기치 못한 오류가 발생했습니다. 다시 로그인해주세요.');
      }
    }
    return Promise.reject(error);
  } catch (error) {
    console.error(error);
    return new Error('예기치 못한 오류가 발생했습니다. 다시 로그인해주세요.');
  }
}

api.interceptors.response.use(onSuccess, onError);

export default api;