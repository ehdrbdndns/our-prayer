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
      <Stack.Screen name="planDetail/[plan_id]" />
      <Stack.Screen name="prayerTime" />
      <Stack.Screen name="editNickname" />
      <Stack.Screen name="questionDetail" />
      <Stack.Screen name="questionGuide" />
      <Stack.Screen name="archivePlan" />
      <Stack.Screen name="lecture/[lecture_id]" options={{ animation: 'fade' }} />
      <Stack.Screen name="prayerRecord" />
    </Stack>
  )
}