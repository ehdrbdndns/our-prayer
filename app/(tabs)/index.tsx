import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>왜 이미지가 적용이 안될까??</Text>
      <Link href={"/login"} asChild>
        <Pressable>
          <Text>로그인 페이지로 이동</Text>
        </Pressable>
      </Link>
    </View>
  );
}
