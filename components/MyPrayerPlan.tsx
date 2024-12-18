import { PlanType } from "@/utils/dataType";
import { moderateScale } from "@/utils/style";
import { ImageBackground } from "expo-image";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import CustomButton from "./button/CustomButton";
import { BoldText } from "./text/BoldText";
import { RegularText } from "./text/RegularText";

interface MyPrayerPlanProps {
  plans: PlanType[];
}

export default function MyPrayerPlan({ plans }: MyPrayerPlanProps) {

  const onPressBtn = () => {
    router.push("/plan")
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
        data={plans}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardList}
        renderItem={({ item }: { item: PlanType }) => (
          <TouchableOpacity
            onPress={() => onPressPlan({
              id: item.plan_id,
              title: item.title,
              desc: item.description,
              banner: item.thumbnail,
            })}>
            <ImageBackground
              style={styles.card}
              source={item.s_thumbnail}
            >
              <LinearGradient
                colors={["rgba(0, 0, 0, 0)", "#161B29"]}
                style={styles.cardFilter}
              />
              <BoldText
                fontSize={12}
                lineHeight={20}
              >
                {item.title}
              </BoldText>

              <View>
                <RegularText
                  fontSize={10}
                  lineHeight={17}
                  numberOfLines={1}
                >
                  {item.description}
                </RegularText>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}
        horizontal
      />
      {/* Button */}
      <View style={{ paddingRight: moderateScale(24) }}>
        <CustomButton
          onPress={onPressBtn}
          style={styles.button}
        >
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