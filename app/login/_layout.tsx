import BackgroundWithImage from "@/components/BackgroundWithImage";
import { Stack } from "expo-router";
import { PropsWithChildren } from "react";

export default function RootLayout() {

  const ScreenLayout = ({ children }: PropsWithChildren) => (
    <BackgroundWithImage>
      {children}
    </BackgroundWithImage>
  );

  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
      screenLayout={ScreenLayout}
    />
  )
}