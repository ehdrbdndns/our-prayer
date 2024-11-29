import { moderateScale } from "@/utils/style";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import CustomButton from "./button/CustomButton";
import { BoldText } from "./text/BoldText";
import { MediumText } from "./text/MediumText";
import { RegularText } from "./text/RegularText";

const ShareImage = require("@/assets/images/share.png");

export default function ShareCard() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* sub title */}
        <BoldText
          color="#858585"
          fontSize={12}
          lineHeight={20}
        >
          Send Our Prayer
        </BoldText>

        <View style={styles.row}>
          {/* Title */}
          <BoldText
            fontSize={16}
            lineHeight={24}
          >
            {
              "Our Pray 앱을 공유하고\n함께 기도의 힘을 경험해보세요"
            }
          </BoldText>

          {/* Image */}
          <Image style={styles.image} source={ShareImage} />
        </View>

        {/* Description */}
        <RegularText
          color="#FEFEFE"
          fontSize={12}
          lineHeight={20}
        >
          {
            "Our Pray 앱은 이단이나 사이비와 전혀 관련이 없는,\n신뢰할 수 있는 기도 환경을 제공합니다."
          }
        </RegularText>

        {/* button */}
        <CustomButton
          style={styles.button}
        >
          <MediumText
            color="#FFFFFF"
            fontSize={14}
            lineHeight={21}
            letterSpacingPercent={-1}
          >
            공유하기
          </MediumText>
        </CustomButton>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: moderateScale(24),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScale(12),
  },
  card: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(14),
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: moderateScale(12),
  },
  image: {
    width: moderateScale(48),
    height: moderateScale(48),
  },
  button: {
    width: 'auto',
    alignSelf: 'flex-start',
    backgroundColor: '#0F141A',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(24),
    marginTop: moderateScale(14),
  },
})