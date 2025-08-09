import BackgroundWithImage from '@/components/BackgroundWithImage';
import NetworkErrorPage from '@/components/NetworkErrorPage';
import { useSession } from '@/contexts/AuthContext';
import { useUserMutation } from '@/utils/mutation';
import { registerForPushNotificationsAsync } from '@/utils/notification';
import { useAppInfoQuery } from '@/utils/queries';
import NetInfo from '@react-native-community/netinfo';
import * as Application from 'expo-application';
import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';

export default function AppLayout() {
  const { session, isLoading, setSession } = useSession();
  const [isTokenRefetched, setIsTokenRefetched] = useState(false);
  const [isVersionChecked, setIsVersionChecked] = useState(false);

  const [isAppReady, setAppReady] = useState(false);
  const [isNetworkErrorShown, setIsNetworkErrorShown] = useState(false);
  const { mutate: updateUserMutate } = useUserMutation();

  const { data: appInfo, isSuccess: isAppInfoSuccess } = useAppInfoQuery();

  // 네트워크 상태 변경 시 알림 및 Stack 전환
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsNetworkErrorShown(!state.isConnected)
    });

    return () => unsubscribe();
  }, []);

  // expo token을 갱신하고 서버에 저장
  useEffect(() => {
    async function registorExpoPushToken() {
      if (!!session && !isLoading) {
        let expoPushToken = '';
        try {
          expoPushToken = await registerForPushNotificationsAsync();
        } catch (e) {
          console.error(e);
          expoPushToken = '';
        }

        const { expo_push_token: existExpoPushToken } = JSON.parse(session);

        if (existExpoPushToken !== expoPushToken) {
          updateUserMutate({ expoPushToken, alarm: expoPushToken !== '' });
          setSession(JSON.stringify({ ...JSON.parse(session), expo_push_token: expoPushToken }))
        }
        setIsTokenRefetched(true);
      }
    }

    registorExpoPushToken();
  }, [session, isLoading])

  // 배포 버전이 아닌 경우 업데이트 알림
  useEffect(() => {

    // 앱 버전이 과거 버전인지 확인하는 함수
    const isPastVersion = (currentVersion: string, latestVersion: string): boolean => {
      const currentVersionParts = currentVersion.split('.').map(Number);
      const latestVersionParts = latestVersion.split('.').map(Number);

      try {
        for (let i = 0; i < currentVersionParts.length; i++) {
          if (Number(currentVersionParts[i]) < Number(latestVersionParts[i])) {
            return true;
          } else if (Number(currentVersionParts[i]) > Number(latestVersionParts[i])) {
            return false;
          }
        }

        return false;
      } catch (e) {
        console.error(e);
        return false;
      }
    }

    if (!isVersionChecked && isAppInfoSuccess) {
      const {
        ios_version,
        android_version,
        ios_app_link,
        android_app_link
      } = appInfo;

      const currentVersion = Application.nativeApplicationVersion;
      const latestVersion = Platform.OS === 'ios' ? ios_version : android_version;

      if (!!currentVersion && isPastVersion(currentVersion, latestVersion)) {

        Alert.alert(
          `새로운 버전이 출시되었습니다. (${latestVersion})`,
          `현재 버전(${currentVersion})을 사용 중입니다. 업데이트 하시겠습니까?`,
          [
            {
              text: "업데이트",
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL(ios_app_link);
                } else {
                  Linking.openURL(android_app_link);
                }
              }
            },
            {
              text: "나중에",
              style: "cancel"
            }
          ]
        );
      }

      setIsVersionChecked(true);
    }
  }, [isAppInfoSuccess, appInfo, isVersionChecked])

  // 앱이 준비되었는지 확인
  useEffect(() => {
    setAppReady(isTokenRefetched && isVersionChecked);
  }, [isTokenRefetched, isVersionChecked])

  if (!isLoading && !session) {
    return <Redirect href="/login" />
  }

  if (!isAppReady) {
    return <BackgroundWithImage animation='fade' />;
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "fade" }} />
        <Stack.Screen name="(stacks)" options={{ headerShown: false, animation: "fade", gestureEnabled: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <NetworkErrorPage isShow={isNetworkErrorShown} />
    </>
  );
}