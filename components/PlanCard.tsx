import Heart from "@/assets/images/icon/heart.svg";
import { PlanType } from "@/utils/dataType";
import { moderateScale } from "@/utils/style";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { BoldText } from "./text/BoldText";
import { RegularText } from "./text/RegularText";

const DefaultCardImage = require("@/assets/images/card/default-background.png");

export default function PlanCard({ plan }: { plan: PlanType }) {

  const [isLiked, setIsLiked] = useState(plan.is_liked);

  const onPressHeart = () => {
    setIsLiked(!isLiked);
  }

  const onPressPlan = (params: {
    id: string;
    title: string;
    desc: string;
    banner: string;
  }) => {
    const { id, title, desc, banner } = params;
    router.push(`/planDetail?id=${id}&title=${title}&desc=${desc}&banner=${banner}`);
  }


  return (
    <TouchableOpacity
      onPress={() => onPressPlan({
        id: plan.plan_id,
        title: plan.title,
        desc: plan.description,
        banner: plan.thumbnail
      })}
    >
      <ImageBackground
        style={styles.card}
        source={plan.s_thumbnail}
      >
        <LinearGradient
          colors={["rgba(0, 0, 0, 0)", "#161B29"]}
          style={styles.cardFilter}
        />
        <BoldText
          fontSize={16}
          lineHeight={24}
        >
          {plan.title}
        </BoldText>

        <RegularText
          numberOfLines={1}
          fontSize={14}
          lineHeight={22}
        >
          {plan.description}
        </RegularText>

        <Heart
          style={styles.heart}
          fill={isLiked ? "#FF7D71" : "transparent"}
          stroke={isLiked ? "#FF7D71" : "white"}
          onPress={onPressHeart}
        />
      </ImageBackground>
    </TouchableOpacity>
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