import BackgroundWithImage from "@/components/BackgroundWithImage";
import { Text, View } from "react-native";

export default function MyPage() {
  return (
    <BackgroundWithImage>
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Text>My Page</Text>
      </View>
    </BackgroundWithImage>
  )
}