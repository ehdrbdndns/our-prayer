import LeftArrow from "@/assets/images/icon/leftArrow.svg";
import Header from "@/components/Header";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import { moderateScale } from "@/utils/style";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Pastor = require('@/assets/images/introducePastor.png')

export default function IntroducePastor() {

  const onPressBack = () => {
    router.back();
  }

  const onPressYouTubeLink = () => {
    Linking.openURL('https://www.youtube.com/@TV-xe6vi/videos');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
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
              목사님 소개
            </MediumText>
          </View>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: moderateScale(40),
        }}
      >
        {/* Image */}
        <Image
          source={Pastor}
          style={{
            width: moderateScale(375),
            height: moderateScale(360)
          }}
          contentFit="cover"
        />
        <View style={styles.container}>
          <MediumText style={styles.pastorName}>
            조형운 목사님
          </MediumText>
          <MediumText style={styles.sectionTitle}>
            연혁
          </MediumText>
          <RegularText style={styles.historyText}>
            ㆍ 아세아연합신학대학교대학원 기독교상담학석사(M.A.){"\n"}
            ㆍ 웨스트민스터신학대학원대학교 철학박사(Ph.D. 기독교상담학)과정을 거쳐 복음신학대학원대학교 철학박사(Ph,D. 상담심리학. 학위논문: 라캉의 정신분석이론에 근거한 강박증 치료에 대한 목회상담학적 고찰) 취득{"\n"}
            ㆍ (전) 라이즈업코리아 전문상담 단체(2008~2010년){"\n"}
            ㆍ CTS기독교TV 인터넷 설교 진행(2007~2010년){"\n"}
            ㆍ KBC뉴스 워싱톤미주방송 치유상담 설교진행(2007~2008년){"\n"}
            ㆍ CTS기독교TV 주관 2008 국제기독엑스포 “치유상담세미나” 진행{"\n"}
            ㆍ GOOD TV 기독교복음방송 특강 “조형운 목사의 다윗의 상담” 진행(2012~2013년){"\n"}
            ㆍ GOOD TV 기독교복음방송 특강 “조형운 박사의 신앙 돋보기” 진행(2015~2016년){"\n"}
            ㆍ 용인시청 “부모의 양육태도와 아동의 성격형성” 특강 다수 진행{"\n"}
            ㆍ (현) 지저스메디칼센터 원장{"\n"}
            ㆍ (현) 가슴으로 품는 교회 담임{"\n"}
            ㆍ 저서는 《의》 《빈 깡통》 {"<아브라함이 얻은 의>"}가 있음
          </RegularText>
          <TouchableOpacity onPress={onPressYouTubeLink} style={styles.youtubeLink}>
            <MediumText style={styles.youtubeLinkText}>
              유튜브 채널로 이동
            </MediumText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    marginBottom: moderateScale(24),
  },
  headerPrefix: {
    gap: moderateScale(16),
    flexDirection: 'row',
  },
  container: {
    paddingHorizontal: moderateScale(24),
  },
  pastorName: {
    fontSize: moderateScale(20),
    color: '#FFF',
    marginTop: moderateScale(16),
    marginBottom: moderateScale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    color: '#FFF',
    marginBottom: moderateScale(8),
  },
  historyText: {
    fontSize: moderateScale(14),
    color: '#FFF',
    lineHeight: moderateScale(30),
  },
  youtubeLink: {
    marginTop: moderateScale(16),
    paddingVertical: moderateScale(12),
    backgroundColor: '#FF0000',
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  youtubeLinkText: {
    color: '#FFF',
    fontSize: moderateScale(16),
  },
})