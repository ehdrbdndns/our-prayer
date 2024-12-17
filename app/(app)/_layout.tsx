import BackgroundWithImage from '@/components/BackgroundWithImage';
import { useSession } from '@/ctx';
import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const [isAppReady, setAppReady] = useState(false);


  useEffect(() => {
    setAppReady(true);
  }, [isLoading])

  if (!isAppReady) {
    return <BackgroundWithImage animation='fade' />;
  }

  if (!isLoading && !session) {
    return <Redirect href="/login" />
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="(stacks)" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
