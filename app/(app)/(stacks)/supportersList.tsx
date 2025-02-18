import LeftArrow from '@/assets/images/icon/leftArrow.svg';
import RightShortArrow from '@/assets/images/icon/rightShortArrow.svg';
import Header from "@/components/Header";
import { BoldText } from '@/components/text/BoldText';
import { MediumText } from '@/components/text/MediumText';
import { RegularText } from '@/components/text/RegularText';
import { moderateScale } from "@/utils/style";
import { Image } from 'expo-image';
import { router } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function supportersList() {

  const onPressBack = () => {
    router.back();
  }

  const onPressJesusMedicalCenter = async () => {
    await WebBrowser.openBrowserAsync("https://www.youtube.com/@TV-xe6vi");
  }

  const onPressJuJunMo = async () => {
    await WebBrowser.openBrowserAsync("https://www.instagram.com/junm0_sah");
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <Header
        style={styles.header}
        prefix={
          <View style={styles.headerPrefix}>
            <TouchableOpacity
              onPress={onPressBack}
              hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
            >
              <LeftArrow
                width={moderateScale(24)}
                height={moderateScale(24)}
              />
            </TouchableOpacity>
            <MediumText
              color="#FFF"
              fontSize={16}
            >
              도움 주신 분들
            </MediumText>
          </View>
        }
      />
      <View style={styles.container}>
        {/* 기도 강의 제공 */}
        <View>
          <View style={{ marginBottom: moderateScale(12) }}>
            <BoldText>
              기도 강의 제공
            </BoldText>
          </View>
          <TouchableOpacity
            onPress={onPressJesusMedicalCenter}
          >
            <View style={[styles.card, styles.author]}>
              {/* Profile */}
              <View style={styles.profile}>
                <Image
                  style={styles.profileImage}
                  source={{ uri: "https://our-prayer.s3.ap-northeast-2.amazonaws.com/plan/author_profile/m4tlxmoazr25wde75xd" }}
                />
                <View style={styles.profileName}>
                  <RegularText
                    fontSize={12}
                    lineHeight={18}
                    color={"#B3B3B3"}
                  >
                    더 보기
                  </RegularText>
                  <RegularText
                    fontSize={16}
                    lineHeight={22}
                  >
                    가슴으로 품는 교회
                  </RegularText>
                </View>
                <Pressable>
                  <RightShortArrow />
                </Pressable>
              </View>
              {/* Content */}
              <RegularText
                style={styles.profileContent}
                fontSize={12}
                lineHeight={22}
              >
                기도 강의를 제공해 주신 ‘가슴으로 품는 교회’에 감사드립니다. 더 많은 정보를 확인하려면 카드를 클릭해주세요.
              </RegularText>

              <RegularText
                fontSize={12}
                lineHeight={22}
                color="#B3B3B3"
              >
                출판자 소개
              </RegularText>
            </View>
          </TouchableOpacity>
        </View>

        {/* 찬송가 제공 */}
        <View>
          <View style={{ marginBottom: moderateScale(12) }}>
            <BoldText>
              찬송가 제공
            </BoldText>
          </View>
          <TouchableOpacity
            onPress={onPressJuJunMo}
          >
            <View style={[styles.card, styles.author]}>
              {/* Profile */}
              <View style={styles.profile}>
                <Image
                  style={styles.profileImage}
                  source={{ uri: "https://our-prayer.s3.ap-northeast-2.amazonaws.com/custom/jujunmo.jpeg" }}
                />
                <View style={styles.profileName}>
                  <RegularText
                    fontSize={12}
                    lineHeight={18}
                    color={"#B3B3B3"}
                  >
                    더 보기
                  </RegularText>
                  <RegularText
                    fontSize={16}
                    lineHeight={22}
                  >
                    주준모
                  </RegularText>
                </View>
                <Pressable>
                  <RightShortArrow />
                </Pressable>
              </View>
              {/* Content */}
              <RegularText
                style={styles.profileContent}
                fontSize={12}
                lineHeight={22}
              >
                찬송가를 제공해 주신 ‘주준모’ 선생님께 감사드립니다. 더 많은 정보를 확인하려면 카드를 클릭해주세요.
              </RegularText>

              <RegularText
                fontSize={12}
                lineHeight={22}
                color="#B3B3B3"
              >
                출판자 소개
              </RegularText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    marginBottom: moderateScale(20),
  },
  headerPrefix: {
    gap: moderateScale(16),
    flexDirection: 'row',
  },
  container: {
    paddingHorizontal: moderateScale(24),
    flex: 1,
    marginBottom: moderateScale(24),
  },
  card: {
    paddingVertical: moderateScale(14),
    paddingLeft: moderateScale(12),
    paddingRight: moderateScale(16),
    borderRadius: moderateScale(10),
    backgroundColor: 'rgba(255, 255, 255, .04)',
  },
  description: {
    marginBottom: moderateScale(24),
  },
  author: {
    marginBottom: moderateScale(40),
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  profileImage: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(100),
  },
  profileName: {
    flex: 1
  },
  profileContent: {
    marginVertical: moderateScale(10),
  },
  lectureTitle: {
    marginBottom: moderateScale(8),
  },
  lectureIndicator: {
    marginBottom: moderateScale(8),
    width: '100%',
    textAlign: 'right'
  },
  lecture: {
    flexDirection: 'row',
    gap: moderateScale(14),
    alignItems: 'center',
    marginBottom: moderateScale(16)
  },
  lectureContent: {
    flex: 1,
    gap: moderateScale(2),
  }
});