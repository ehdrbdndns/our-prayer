import Archive from "@/assets/images/icon/archive.svg";
import Search from "@/assets/images/icon/search.svg";
import Header from "@/components/Header";
import PlanCard from "@/components/PlanCard";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import { moderateScale } from "@/utils/style";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DefaultCardImage = require("@/assets/images/card/default-background.png");

export default function PlanPage() {
  const textInputRef = useRef<TextInput>(null);

  const handleSearchPress = () => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  return (
    <FlatList
      data={[1, 2, 3, 4, 5]}
      showsHorizontalScrollIndicator={false}
      ListHeaderComponent={(
        <SafeAreaView>
          {/* Header */}
          <Header
            style={styles.header}
            infix={
              <View style={styles.searchBar}>
                <Pressable onPress={handleSearchPress}>
                  <Search />
                </Pressable>
                <TextInput
                  ref={textInputRef}
                  style={styles.searchInput}
                  placeholder="더 많은 기도 플랜을 찾아보세요"
                  placeholderTextColor={"#B3B3B3"}
                />
              </View>
            }
            suffix={<Archive />}
          />

          {/* 현재 진행중인 기도 */}
          <View style={styles.container}>
            {/* Title */}
            <BoldText
              style={styles.title}
              fontSize={16}
              lineHeight={24}
            >
              현재 진행 중인 기도
            </BoldText>

            {/* Card */}
            <TouchableOpacity>
              <View style={styles.opacityBackground}>
                {/* Image */}
                <ImageBackground
                  style={styles.image}
                  source={DefaultCardImage}
                >
                  <LinearGradient
                    colors={["rgba(0, 0, 0, 0)", "#161B29"]}
                    style={styles.imageFilter}
                  />
                </ImageBackground>

                <View>
                  {/* SubTitle */}
                  <BoldText
                    fontSize={16}
                    lineHeight={24}
                  >
                    50분 기도
                  </BoldText>

                  {/* Content */}
                  <RegularText
                    fontSize={14}
                    lineHeight={22}
                  >
                    처음 시작하는 기도
                  </RegularText>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* 기도 플랜 찾기 */}
          <View>
            {/* Title */}
            <BoldText
              style={[styles.title, { paddingHorizontal: moderateScale(24) }]}
              fontSize={16}
              lineHeight={24}
            >
              기도 플랜 찾기
            </BoldText>

            {/* Tabs (전체보기, 시간별 기도, 주제별 기도, 자유 기도) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabList}
            >
              <TouchableOpacity style={styles.activeTab}>
                <MediumText
                  fontSize={14}
                  lineHeight={22}
                >
                  전체보기
                </MediumText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <MediumText
                  fontSize={14}
                  lineHeight={22}
                >
                  시간별 기도
                </MediumText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <MediumText
                  fontSize={14}
                  lineHeight={22}
                >
                  주제별 기도
                </MediumText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <MediumText
                  fontSize={14}
                  lineHeight={22}
                >
                  자유 기도
                </MediumText>
              </TouchableOpacity>
            </ScrollView>

            {/* Card List */}
          </View>
        </SafeAreaView>
      )}
      renderItem={() => <PlanCard />}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
    >

    </FlatList>
  )
}

const styles = StyleSheet.create({
  header: {
    marginBottom: moderateScale(24),
  },
  title: {
    marginBottom: moderateScale(16),
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(14),
    backgroundColor: "#262624",
    borderRadius: moderateScale(12),
    marginRight: moderateScale(16),
    gap: moderateScale(12),
    height: moderateScale(44)
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",

    fontFamily: "NotoSansKR_400Regular",
    fontSize: moderateScale(16),
    padding: 0,
    textAlignVertical: "center"
  },
  container: {
    paddingHorizontal: moderateScale(24),
    marginBottom: moderateScale(40),
  },
  image: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(8),
  },
  imageFilter: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: moderateScale(8),
    opacity: 0.6
  },
  opacityBackground: {
    borderRadius: moderateScale(10),
    padding: moderateScale(8),
    backgroundColor: "rgba(255, 255, 255, 0.05)",

    flexDirection: "row",
    gap: moderateScale(16),
    alignItems: "center"
  },
  tabList: {
    marginLeft: moderateScale(24),
    gap: moderateScale(8)
  },
  tab: {
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(14),
  },
  activeTab: {
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: moderateScale(100),
  },
  columnWrapper: {
    paddingHorizontal: moderateScale(24),
    gap: moderateScale(8),
    marginBottom: moderateScale(8)
  }
});