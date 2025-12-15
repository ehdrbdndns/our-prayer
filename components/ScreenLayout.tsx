import { PropsWithChildren } from "react";
import { StyleProp, ViewStyle } from "react-native";
import BackgroundWithImage from "./BackgroundWithImage";

export default function ScreenLayout({ children, style }: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>) {
  return (
    <BackgroundWithImage animation='fade' style={style}>
      {children}
    </BackgroundWithImage>
  )
}