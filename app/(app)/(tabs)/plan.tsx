import LeftArrow from "@/assets/images/icon/leftArrow.svg";
import DownloadModal from "@/components/DownloadModal";
import Header from "@/components/Header";
import PlanCard from "@/components/PlanCard";
import ScreenLayout from "@/components/ScreenLayout";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import { ModalProvider } from "@/contexts/ModalContext";
import { PlanType } from "@/utils/dataType";
import { usePlanListQuery } from "@/utils/queries";
import { moderateScale, normalizeFontSize, scaleHeight } from "@/utils/style";
import { useQueryClient } from "@tanstack/react-query";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tabs = [
  { label: "전체보기", value: "" },
  { label: "주제별 기도", value: "topic" },
  { label: "자유 기도", value: "free" },
];

export default function PlanPage() {

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [planType, setPlanType] = useState('');

  // fetch Plan data
  const { data: plan, isFetching: isPlanFetching } = usePlanListQuery();

  const currentPlan = plan?.currentPlan
    ? plan.plans.filter((row) => row.plan_id === plan.currentPlan?.plan_id)[0]
    : null;

  const filteredPlans = plan ? plan.plans.filter((item) => {
    if (isSearchActive) {
      return item.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return planType === '' || item.type === planType;
  }) : [];

  const handleRefresh = async () => {
    setRefreshing(true);

    await queryClient.refetchQueries({ queryKey: ["plan"] });

    setRefreshing(false);
  }

  const handlePressLeftArrow = () => {
    setIsSearchActive(false);
    setSearchQuery("");
  }

  const handlePressPlan = (params: {
    id: string;
    title: string;
    banner: string;
    isLiked: boolean;
  }) => {
    const { id, banner, isLiked } = params;

    router.navigate({
      pathname: `/planDetail/[plan_id]`,
      params: {
        plan_id: id,
        title: "기도 플랜",
        banner,
        isLiked: String(isLiked),
      },
    });
  }

  const handlePressTab = (type: string) => {
    setPlanType(type);
  }

  return (
    <ScreenLayout>
      <ModalProvider>
        <FlatList
          numColumns={2}
          data={filteredPlans}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          extraData={refreshing}
          keyExtractor={(item) => item.plan_id}
          columnWrapperStyle={styles.columnWrapper}
          refreshing={refreshing}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Platform.OS === "ios" ? "#FFFFFF" : "#000000"]}
              tintColor={"#FFFFFF"}
              progressViewOffset={scaleHeight(50)}
            />
          }
          ListHeaderComponent={(
            <View style={{ paddingTop: insets.top }}>
              {/* Header */}
              <Header
                style={styles.header}
                prefix={
                  <Pressable
                    onPress={handlePressLeftArrow}
                    style={[styles.headerPrefix, !isSearchActive && styles.hidden]}
                    hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
                  >
                    <LeftArrow />
                  </Pressable>
                }
              />

              {/* 현재 진행중인 기도 */}
              {
                currentPlan && (
                  <View style={[styles.container, isSearchActive && styles.hidden]}>
                    {/* Title */}
                    <BoldText
                      style={styles.title}
                      fontSize={18}
                    >
                      진행 중인 기도
                    </BoldText>

                    {/* Card */}
                    <TouchableOpacity
                      onPress={() => handlePressPlan({
                        id: currentPlan.plan_id,
                        title: currentPlan.title,
                        banner: currentPlan.thumbnail,
                        isLiked: currentPlan.is_liked
                      })}
                    >
                      <View style={styles.opacityBackground}>
                        {/* Image */}
                        <ImageBackground
                          style={styles.image}
                          imageStyle={{ borderRadius: moderateScale(8) }}
                          source={currentPlan.s_thumbnail}
                        >
                          <LinearGradient
                            colors={["rgba(0, 0, 0, 0)", "#161B29"]}
                            style={styles.imageFilter}
                          />
                        </ImageBackground>

                        <View style={{
                          width: moderateScale(228)
                        }}>
                          {/* SubTitle */}
                          <BoldText
                            fontSize={16}
                            lineHeight={24}
                          >
                            {currentPlan.title}
                          </BoldText>

                          {/* Content */}
                          <RegularText
                            numberOfLines={1}
                            fontSize={14}
                            lineHeight={22}
                          >
                            {currentPlan.description}
                          </RegularText>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                )
              }

              {/* 기도 플랜 찾기 */}
              <View style={isSearchActive && styles.hidden}>
                {/* Title */}
                <BoldText
                  style={[styles.title, { paddingHorizontal: moderateScale(24) }]}
                  fontSize={18}
                >
                  기도 플랜 찾기
                </BoldText>

                {/* Tabs (전체보기, 시간별 기도, 주제별 기도, 자유 기도) */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tabList}
                >
                  {
                    Tabs.map(tab => (
                      <TouchableOpacity
                        key={tab.value}
                        onPress={() => handlePressTab(tab.value)}
                        style={planType === tab.value ? styles.activeTab : styles.tab}
                      >
                        <MediumText fontSize={14} lineHeight={22}>
                          {tab.label}
                        </MediumText>
                      </TouchableOpacity>
                    ))
                  }
                </ScrollView>

                {/* Card List */}
              </View>
            </View>
          )}
          renderItem={({ item }: { item: PlanType }) => <PlanCard refreshing plan={item} />}
        />
        {/* Audio Download Modal */}
        <DownloadModal />
      </ModalProvider>
      <View style={{ height: moderateScale(60) }} />
    </ScreenLayout>
  )
}

const styles = StyleSheet.create({
  headerPrefix: {
    marginRight: moderateScale(16),
  },
  searchText: {
    paddingHorizontal: moderateScale(24),
    marginBottom: moderateScale(16),
  },
  hidden: {
    display: "none",
  },
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
    fontSize: normalizeFontSize(16),
    padding: 0,
    textAlignVertical: "center",
  },
  container: {
    paddingHorizontal: moderateScale(24),
    marginBottom: moderateScale(40),
  },
  image: {
    width: moderateScale(60),
    height: moderateScale(60),
    resizeMode: "cover"
  },
  imageFilter: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: moderateScale(8),
    opacity: 0.6
  },
  opacityBackground: {
    width: '100%',
    overflow: "hidden",
    borderRadius: moderateScale(10),
    padding: moderateScale(8),
    backgroundColor: "rgba(255, 255, 255, 0.05)",

    flexDirection: "row",
    gap: moderateScale(16),
    alignItems: "center"
  },
  tabList: {
    marginLeft: moderateScale(24),
    marginBottom: moderateScale(12),
    gap: moderateScale(4)
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
    marginBottom: moderateScale(8),
  }
});