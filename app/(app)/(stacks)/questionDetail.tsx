import Chat from '@/assets/images/icon/chat.svg';
import Edit from '@/assets/images/icon/edit.svg';
import Left from '@/assets/images/icon/leftArrow.svg';
import Trash from '@/assets/images/icon/trash.svg';
import Header from "@/components/Header";
import InputButton from '@/components/InputButton';
import CustomText from '@/components/text/CustomText';
import { MediumText } from '@/components/text/MediumText';
import { RegularText } from '@/components/text/RegularText';
import { moderateScale } from '@/utils/style';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DefaultAuthor = require('@/assets/images/plan/default-author.png');

export default function QuestionDetail() {

  const datas = [1, 2, 3, 4];

  const onPressBack = () => {
    router.back();
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
            >
              <Left
                width={moderateScale(24)}
                height={moderateScale(24)}
              />
            </TouchableOpacity>
            <MediumText
              color='#FFF'
              fontSize={16}
            >
              나의 질문
            </MediumText>
          </View>
        }
      />

      {/* Content */}
      <View style={styles.container}>
        <MediumText
          fontSize={14}
          lineHeight={26}
          color='#B3B3B3'
          style={{ marginBottom: moderateScale(4) }}
        >
          2024년 10월 19일
        </MediumText>
        <RegularText
          fontSize={16}
          lineHeight={28}
          style={{ marginBottom: moderateScale(16) }}
        >
          {"안녕하세요, 목사님\n제가 현재 삶의 방향을 찾고 싶어서 기도하고 있습니다. 여러 가지 선택지가 있어 혼란스러운 마음이 드는데, 어떻게 주님의 뜻을 분별할 수 있을까요? 제가 내리는 결정이 하나님께서 원하시는 길인지 알 수 있도록 기도하는 방법이나 조언이 필요합니다. 목사님의 지혜를 나눠주시면 감사하겠습니다."}
        </RegularText>
        <View style={styles.cardIconList}>
          {/* Chat */}
          <View style={{ flexDirection: 'row', gap: moderateScale(4), alignItems: 'center' }}>
            <Chat width={moderateScale(24)} height={moderateScale(24)} />
            <CustomText
              style={{ fontFamily: 'Inter_600SemiBold' }}
              fontSize={16}
              lineHeight={28}
              color='#959FFF'
            >
              1
            </CustomText>
          </View>

          <View style={{ flexDirection: 'row', gap: moderateScale(24) }}>
            {/* Edit */}
            <Edit width={moderateScale(24)} height={moderateScale(24)} />

            {/* Trash */}
            <TouchableOpacity>
              <Trash width={moderateScale(24)} height={moderateScale(24)} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Reply List */}
      <ScrollView
        style={{ paddingHorizontal: moderateScale(24) }}
        contentContainerStyle={{ gap: moderateScale(12) }}
      >
        {datas.map((_, index) => (
          <View style={styles.card} key={index}>
            {/* Team */}
            <View style={{
              flexDirection: 'row',
              gap: moderateScale(10),
              alignItems: 'center',
              marginBottom: moderateScale(10)
            }}>
              <Image
                style={{
                  width: moderateScale(28),
                  height: moderateScale(28)
                }}
                source={DefaultAuthor}
              />
              <MediumText
                fontSize={14}
                color='#B3B3B3'
              >
                홍길동
              </MediumText>
            </View>

            {/* Content */}
            <RegularText
              style={{ marginBottom: moderateScale(10) }}
              fontSize={16}
              lineHeight={28}
            >
              {"사랑하는 성도님, 고민을 나누어 주셔서 감사합니다. 방향을 잃은 기분은 많은 이들이 겪는 일입니다. 먼저, 하나님께서는 우리 각자를 사랑하시고, 우리가 그분께 나아가기를 원하십니다. "}
            </RegularText>

            {/* date */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end'
              }}
            >
              <MediumText
                fontSize={12}
                lineHeight={26}
                color='#B3B3B3'
              >
                2024년 10월 19일
              </MediumText>
            </View>
          </View>
        ))}
      </ScrollView>

      <InputButton />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    marginBottom: moderateScale(24)
  },
  headerPrefix: {
    flexDirection: 'row',
    gap: moderateScale(16)
  },
  container: {
    paddingHorizontal: moderateScale(24),
    marginBottom: moderateScale(40)
  },
  cardIconList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    padding: moderateScale(16),
    borderRadius: moderateScale(10),
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  }
})