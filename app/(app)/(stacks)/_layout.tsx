import BackgroundWithImage from "@/components/BackgroundWithImage";
import { Stack } from "expo-router";
import { PropsWithChildren } from "react";

export default function StackLayout() {
  const ScreenLayout = ({ children }: PropsWithChildren) => (
    <BackgroundWithImage animation='fade'>
      {children}
    </BackgroundWithImage>
  );

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
      }}
      screenLayout={ScreenLayout}
    >
      <Stack.Screen name="prayerTime" />
      <Stack.Screen name="editNickname" />
      <Stack.Screen name="questionDetail" />
      <Stack.Screen name="questionGuide" />
      <Stack.Screen name="archivePlan" />
      <Stack.Screen name="prayer" options={{ animation: 'fade' }} />
      <Stack.Screen name="planDetail" />
      <Stack.Screen name="prayerRecord" />
      {/* <Stack.Screen name="login" /> */}
    </Stack>
  )
}