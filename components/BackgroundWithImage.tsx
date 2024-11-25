
import { moderateScale } from "@/utils/style";
import { ImageBackground } from "expo-image";
import { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";

const backgroundImage = require("@/assets/images/background.png");

export default function BackgroundWithImage({ children }: PropsWithChildren) {
  return (
    <ImageBackground
      style={styles.image}
      source={backgroundImage}
    >
      {children}
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    paddingHorizontal: moderateScale(26),
    width: "100%",
    height: "100%",
  }
})