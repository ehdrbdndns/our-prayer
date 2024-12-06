import BackgroundWithImage from '@/components/BackgroundWithImage';
import TabBar from '@/components/TabBar';
import { Tabs } from 'expo-router';
import { PropsWithChildren } from 'react';

export default function TabLayout() {
  const ScreenLayout = ({ children }: PropsWithChildren) => (
    <BackgroundWithImage animation='fade'>
      {children}
    </BackgroundWithImage>
  );

  return (
    <Tabs
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
      }}
      screenLayout={ScreenLayout}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="plan" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="question" />
      <Tabs.Screen name="mypage" />
    </Tabs>
  );
}