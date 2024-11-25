import BackgroundWithImage from "@/components/BackgroundWithImage";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {

  return (
    <BackgroundWithImage>
      <SafeAreaView>
        <Text>로그인 페이지</Text>
      </SafeAreaView>
    </BackgroundWithImage>
  );
}
