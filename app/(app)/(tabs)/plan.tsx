import Archive from "@/assets/images/icon/archive.svg";
import LeftArrow from "@/assets/images/icon/leftArrow.svg";
import Search from "@/assets/images/icon/search.svg";
import DownloadModal from "@/components/DownloadModal";
import Header from "@/components/Header";
import PlanCard from "@/components/PlanCard";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import { ModalProvider } from "@/ctx";
import { PlanType } from "@/utils/dataType";
import { usePlanListQuery } from "@/utils/queries";
import { moderateScale, normalizeFontSize, scaleHeight } from "@/utils/style";
import { useQueryClient } from "@tanstack/react-query";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tabs = [
  { label: "전체보기", value: "" },
  { label: "시간별 기도", value: "time" },
  { label: "주제별 기도", value: "topic" },
  { label: "자유 기도", value: "free" },
];

export default function PlanPage() {

  const insets = useSafeAreaInsets();

  const textInputRef = useRef<TextInput>(null);
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

  useFocusEffect(useCallback(() => {
    queryClient.refetchQueries({ queryKey: ["plan"] });
  }, []))

  const handleSearchPress = () => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery !== "") {
      setIsSearchActive(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    await queryClient.refetchQueries({ queryKey: ["plan"] });

    setRefreshing(false);
  }

  const onPressArchive = () => {
    router.push("/archivePlan");
  }

  const onPressLeftArrow = () => {
    setIsSearchActive(false);
    setSearchQuery("");
  }

  const onPressPlan = (params: {
    id: string;
    title: string;
    banner: string;
    isLiked: boolean;
  }) => {
    const { id, title, banner, isLiked } = params;

    router.push({
      pathname: `/planDetail/[plan_id]`,
      params: {
        plan_id: id,
        title,
        banner,
        isLiked: String(isLiked),
      },
    });
  }

  const onPressTab = (type: string) => {
    setPlanType(type);
  }

  return (
    <ModalProvider>
      {
        !isPlanFetching && (
          <FlatList
            numColumns={2}
            data={filteredPlans}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.plan_id}
            columnWrapperStyle={styles.columnWrapper}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#FFFFFF"]}
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
                      onPress={onPressLeftArrow}
                      style={[styles.headerPrefix, !isSearchActive && styles.hidden]}
                      hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
                    >
                      <LeftArrow />
                    </Pressable>
                  }
                  infix={
                    <View style={styles.searchBar}>
                      <Pressable onPress={handleSearchPress}>
                        <Search />
                      </Pressable>
                      <TextInput
                        ref={textInputRef}
                        style={styles.searchInput}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearchSubmit}
                        value={searchQuery}
                        placeholder="더 많은 기도 플랜을 찾아보세요"
                        placeholderTextColor={"#B3B3B3"}
                      />
                    </View>
                  }
                  suffix={
                    <Pressable onPress={onPressArchive} hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}>
                      <Archive />
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
                        fontSize={16}
                        lineHeight={24}
                      >
                        현재 진행 중인 기도
                      </BoldText>

                      {/* Card */}
                      <TouchableOpacity
                        onPress={() => onPressPlan({
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
                    {
                      Tabs.map(tab => (
                        <TouchableOpacity
                          key={tab.value}
                          onPress={() => onPressTab(tab.value)}
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

                <View style={[styles.searchText, !isSearchActive && styles.hidden]}>
                  <RegularText
                    fontSize={16}
                    lineHeight={24}
                  >
                    '{searchQuery}'에 대한 검색결과입니다.
                  </RegularText>
                </View>
              </View>
            )}
            renderItem={({ item }: { item: PlanType }) => <PlanCard plan={item} />}
          />
        )
      }
      {/* Audio Download Modal */}
      <DownloadModal />
    </ModalProvider>
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
    marginBottom: moderateScale(8),
  }
});