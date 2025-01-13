import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
  useFonts,
} from '@expo-google-fonts/noto-sans-kr';
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { setStatusBarStyle } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { SessionProvider } from '../ctx';

const queryClient = new QueryClient()

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

// This handler determines how your app handles notifications that come in while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  let [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
    Inter_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
    IBMPlexMono_400Regular
  });

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  const [isAppReady, setAppReady] = useState(false);

  // Set the status bar style to light and set the audio mode
  useEffect(() => {
    const setAudioMode = async () => {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    };

    setAudioMode();

    setTimeout(() => {
      setStatusBarStyle('light');
    }, 0);
  }, [])

  // Hide the splash screen when the app is ready
  useEffect(() => {
    if (fontsLoaded) {
      setTimeout(() => {
        SplashScreen.hideAsync();
        setAppReady(true);
      }, 2000);
    }
  }, [fontsLoaded, isAppReady])

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <Slot initialRouteName='(app)' />
      </SessionProvider>
    </QueryClientProvider>
  );
}