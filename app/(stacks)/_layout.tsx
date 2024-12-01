import BackgroundWithImage from "@/components/BackgroundWithImage";
import { Stack } from "expo-router";
import { PropsWithChildren } from "react";

export default function RootLayout() {
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
      <Stack.Screen name="archive" />
      <Stack.Screen name="login" />
    </Stack>
  )
}