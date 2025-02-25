import { moderateScale } from "@/utils/style";
import { Image } from "expo-image";
import { View } from "react-native";
import BackgroundWithImage from "./BackgroundWithImage";
import { BoldText } from "./text/BoldText";
import { RegularText } from "./text/RegularText";

export default function NetworkErrorPage({ isShow }: { isShow: boolean }) {
  return (
    <BackgroundWithImage style={{
      display: isShow ? 'flex' : 'none',
      position: 'absolute',
      width: '100%',
      height: '100%',
    }}>
      <View style={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={{
            width: moderateScale(96),
            height: moderateScale(104),
          }}
          contentFit="fill"
        />
        <BoldText
          fontSize={24}
          style={{
            marginTop: moderateScale(32),
          }}>
          네트워크 문제 발생
        </BoldText>
        <RegularText
          style={{
            fontSize: moderateScale(14),
            marginTop: moderateScale(16),
          }}
        >
          네트워크가 다시 연결되면 원래 화면으로 돌아갑니다.
        </RegularText>
      </View>
    </BackgroundWithImage>
  )
}