import BackgroundWithImage from '@/components/BackgroundWithImage';
import NetworkErrorPage from '@/components/NetworkErrorPage';
import { useSession } from '@/ctx';
import { useUserMutation } from '@/utils/mutation';
import { registerForPushNotificationsAsync } from '@/utils/notification';
import NetInfo from '@react-native-community/netinfo';
import { setBadgeCountAsync } from 'expo-notifications';
import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';

export default function AppLayout() {
  const { session, isLoading, setSession } = useSession();
  const [isAppReady, setAppReady] = useState(false);
  const [isNetworkErrorShown, setIsNetworkErrorShown] = useState(false);
  const { mutate: userMutate } = useUserMutation();

  // Reset badge count
  useEffect(() => {
    // TODO fix, when user show reply, badge count should be reset
    setBadgeCountAsync(0);
  }, []);

  // GET expo push token and save it to the server
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
          userMutate({ expoPushToken, alarm: expoPushToken !== '' });
          setSession(JSON.stringify({ ...JSON.parse(session), expo_push_token: expoPushToken }))
        }

        setAppReady(true);
      }
    }

    registorExpoPushToken();
  }, [session, isLoading])

  // 네트워크 상태 변경 시 알림 및 Stack 전환
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsNetworkErrorShown(!state.isConnected)
    });

    return () => unsubscribe();
  }, []);

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
        <Stack.Screen name="(stacks)" options={{ headerShown: false, animation: "fade" }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <NetworkErrorPage isShow={isNetworkErrorShown} />
    </>
  );
}