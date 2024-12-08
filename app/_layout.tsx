import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
  useFonts,
} from '@expo-google-fonts/noto-sans-kr';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { setStatusBarStyle } from "expo-status-bar";
import { useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {

  let [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
    Inter_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
    IBMPlexMono_400Regular
  });

  const [isAppReady, setAppReady] = useState(false);

  // Set the status bar style to light
  useEffect(() => {
    setTimeout(() => {
      setStatusBarStyle('light');
    }, 0)
  }, [])

  // Hide the splash screen when the app is ready
  useEffect(() => {
    if (fontsLoaded) {
      setTimeout(() => {
        SplashScreen.hideAsync();
        setAppReady(true);
      }, 2000);
    }
  }, [fontsLoaded])

  if (!isAppReady) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="(stacks)" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
