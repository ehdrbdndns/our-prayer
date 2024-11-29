import { moderateScale } from "@/utils/style";
import { ImageBackground } from "expo-image";
import { LinearGradient } from 'expo-linear-gradient';
import { FlatList, StyleSheet, View } from "react-native";
import CustomButton from "./button/CustomButton";
import { BoldText } from "./text/BoldText";
import { RegularText } from "./text/RegularText";

const DefaultCardImage = require("@/assets/images/card/default-background.png");

export default function PrayerPlan() {
  return (
    <View style={styles.container}>
      {/* Title */}
      <BoldText
        style={styles.title}
        fontSize={16}
        lineHeight={24}
        letterSpacingPercent={-1}
      >
        기도 플랜
      </BoldText>

      {/* SubTitle */}
      <BoldText
        style={styles.subTitle}
        fontSize={14}
        lineHeight={22}
        letterSpacingPercent={-1}
      >
        나의 기도 플랜 목록
      </BoldText>

      {/* CardList */}
      <FlatList
        data={[1, 2, 3, 4]}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardList}
        renderItem={() => (
          <ImageBackground
            style={styles.card}
            source={DefaultCardImage}
          >
            <LinearGradient
              colors={["rgba(0, 0, 0, 0)", "#161B29"]}
              style={styles.cardFilter}
            />
            <BoldText
              fontSize={12}
              lineHeight={20}
            >
              50분 기도
            </BoldText>

            <RegularText
              fontSize={10}
              lineHeight={17}
            >
              처음 시작하는 기도
            </RegularText>
          </ImageBackground>
        )}
        horizontal
      />
      {/* Button */}
      <View style={{ paddingRight: moderateScale(24) }}>
        <CustomButton style={styles.button}>
          <BoldText
            color="#FFFFFF"
            fontSize={14}
            lineHeight={22}
            letterSpacingPercent={-1}
          >
            더 많은 기도 플랜 둘러보기
          </BoldText>
        </CustomButton>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateScale(40),
  },
  title: {
    marginBottom: moderateScale(16),
  },
  subTitle: {
    marginBottom: moderateScale(12),
  },
  card: {
    width: moderateScale(105),
    height: moderateScale(105),
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(12),

    justifyContent: "flex-end"
  },
  cardList: {
    marginBottom: moderateScale(16),
    gap: moderateScale(8)
  },
  cardFilter: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: moderateScale(8),
    opacity: 0.6
  },
  button: {
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(24),
  }
})