import TabBar from '@/components/TabBar';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: '#161B29',
        },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="plan" />
      <Tabs.Screen name="prayer" />
      <Tabs.Screen name="question" />
      <Tabs.Screen name="mypage" />
    </Tabs>
  );
}