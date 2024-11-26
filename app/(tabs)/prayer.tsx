import BackgroundWithImage from "@/components/BackgroundWithImage";
import { Text, View } from "react-native";

export default function PrayerPage() {
  return (
    <BackgroundWithImage>
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Text>Prayer Page</Text>
      </View>
    </BackgroundWithImage>
  )
}