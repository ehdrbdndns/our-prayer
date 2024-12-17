import Kakao from "@/assets/images/kakao-logo.svg";
import BackgroundWithImage from "@/components/BackgroundWithImage";
import CustomButton from "@/components/button/CustomButton";
import PrimaryButton from "@/components/button/PrimaryButton";
import { MediumText } from "@/components/text/MediumText";
import { useSession } from "@/ctx";
import { moderateScale } from "@/utils/style";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function login() {
  const { signIn } = useSession();

  const onPressStart = () => {
    signIn();

    // move to the home page
    router.replace('/');
  }

  const onPressKakao = () => {
    // TODO: save the user's login status

    // move to the home page
    router.replace('/');
  }

  return (
    <BackgroundWithImage animation='fade'>
      <SafeAreaView style={styles.container}>
        {/* TOP Text */}
        <View style={{ marginBottom: moderateScale(26) }}>
          <MediumText style={{
            textAlign: 'center',
            color: '#FFFFFF',
          }}>
            마음을 열어 기도하고, {'\n'}
            응답을 경험하세요
          </MediumText>
        </View>

        {/* LOGO TEXT */}
        <Image
          source={require('@/assets/images/text-logo.png')}
          style={{
            width: moderateScale(156),
            height: moderateScale(34),
          }}
          contentFit="fill"
        />

        {/* LOGO */}
        <View style={{
          marginTop: moderateScale(46),
          marginBottom: moderateScale(126),
        }}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={{
              width: moderateScale(96),
              height: moderateScale(104),
            }}
            contentFit="fill"
          />
        </View>

        {/* BUTTON */}
        <View style={{ width: '100%', gap: moderateScale(18) }}>
          {/* Start Button */}
          <PrimaryButton onPress={onPressStart}>
            <MediumText
              fontSize={15}
              lineHeight={27}
              letterSpacingPercent={-1}
            >
              시작하기
            </MediumText>
          </PrimaryButton>

          {/* KakaoButton */}
          <CustomButton onPress={onPressKakao} style={{ backgroundColor: '#FEE500' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Kakao
                width={18}
                height={18}
                style={{
                  position: 'absolute',
                  left: moderateScale(-28),
                }}
              />
              <MediumText
                fontSize={15}
                lineHeight={27}
                letterSpacingPercent={-1}
                color="#000000"
              >
                카카오로 시작하기
              </MediumText>
            </View>
          </CustomButton>
        </View>
      </SafeAreaView>
    </BackgroundWithImage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
  }
});
