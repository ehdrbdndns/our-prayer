import ScreenLayout from "@/components/ScreenLayout";
import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false
      }}
      screenLayout={ScreenLayout}
    >
      <Stack.Screen name="historyDetail/[history_id]" />
      <Stack.Screen name="planDetail/[plan_id]" />
      <Stack.Screen name="prayerTime" />
      <Stack.Screen name="editNickname" />
      <Stack.Screen name="editQuestion/[question_id]" />
      <Stack.Screen name="questionDetail/[question_id]" />
      <Stack.Screen name="questionGuide" />
      <Stack.Screen name="archivePlan" />
      <Stack.Screen name="supportersList" />
      <Stack.Screen name="lectureDetail/[lecture_id]" options={{ animation: 'fade' }} />
      <Stack.Screen name="prayerRecord" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="requestQuestion" />
      <Stack.Screen name="introducePastor" />
    </Stack>
  )
}