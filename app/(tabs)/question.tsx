import BackgroundWithImage from "@/components/BackgroundWithImage";
import { Text, View } from "react-native";

export default function QuestionPage() {
  return (
    <BackgroundWithImage>
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Text>Question Page</Text>
      </View>
    </BackgroundWithImage>
  )
}