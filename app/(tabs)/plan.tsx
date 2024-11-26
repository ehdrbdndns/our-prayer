import BackgroundWithImage from "@/components/BackgroundWithImage";
import { Text, View } from "react-native";

export default function PlanPage() {
  return (
    <BackgroundWithImage>
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Text>Plan Page</Text>
      </View>
    </BackgroundWithImage>
  )
}