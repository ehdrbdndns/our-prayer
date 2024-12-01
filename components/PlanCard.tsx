import Heart from "@/assets/images/icon/heart.svg";
import { moderateScale } from "@/utils/style";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { BoldText } from "./text/BoldText";
import { RegularText } from "./text/RegularText";

const DefaultCardImage = require("@/assets/images/card/default-background.png");

export default function PlanCard() {

  const [isLiked, setIsLiked] = useState(false);

  const onPressHeart = () => {
    setIsLiked(!isLiked);
  }

  return (
    <ImageBackground
      style={styles.card}
      source={DefaultCardImage}
    >
      <LinearGradient
        colors={["rgba(0, 0, 0, 0)", "#161B29"]}
        style={styles.cardFilter}
      />
      <BoldText
        fontSize={16}
        lineHeight={24}
      >
        50분 기도
      </BoldText>

      <RegularText
        fontSize={14}
        lineHeight={22}
      >
        처음 시작하는 기도
      </RegularText>

      <Heart
        style={styles.heart}
        fill={isLiked ? "#FF7D71" : "transparent"}
        stroke={isLiked ? "#FF7D71" : "white"}
        onPress={onPressHeart}
      />
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  card: {
    width: moderateScale(160),
    height: moderateScale(160),
    borderRadius: moderateScale(8),

    paddingLeft: moderateScale(12),
    paddingBottom: moderateScale(20),
    paddingTop: moderateScale(14),
    paddingRight: moderateScale(14),

    justifyContent: "flex-end"
  },
  cardFilter: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: moderateScale(8),
    opacity: 0.7
  },
  heart: {
    position: "absolute",
    top: moderateScale(14),
    right: moderateScale(14)
  }
});