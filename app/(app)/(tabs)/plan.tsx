import Archive from "@/assets/images/icon/archive.svg";
import LeftArrow from "@/assets/images/icon/leftArrow.svg";
import Search from "@/assets/images/icon/search.svg";
import Header from "@/components/Header";
import PlanCard from "@/components/PlanCard";
import { BoldText } from "@/components/text/BoldText";
import { MediumText } from "@/components/text/MediumText";
import { RegularText } from "@/components/text/RegularText";
import api from "@/utils/axios";
import { PlanType } from "@/utils/dataType";
import { moderateScale, normalizeFontSize } from "@/utils/style";
import { useQuery } from "@tanstack/react-query";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FetchedPlanType {
  currentPlan: { plan_id: string } | null,
  plans: PlanType[];
}

export default function PlanPage() {

  const textInputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const insets = useSafeAreaInsets();

  // fetch Plan data
  const { data: plan, isSuccess: isPlanSuccess } = useQuery<FetchedPlanType>({
    queryKey: ["plan"],
    queryFn: async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const res = await api.get<FetchedPlanType>("/plan", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "RefreshToken": refreshToken
        }
      });

      return res.data;
    },
    placeholderData: {
      currentPlan: null,
      plans: []
    },
    staleTime: 12 * 60 * 60 * 1000, // 12시간
    gcTime: 12 * 60 * 60 * 1000, // 12시간
  });

  const currentPlan = plan?.currentPlan
    ? plan.plans.filter((row) => row.plan_id === plan.currentPlan?.plan_id)[0]
    : null;

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
    desc: string;
    banner: string;
  }) => {
    const { id, title, desc, banner } = params;
    router.push(`/planDetail?id=${id}&title=${title}&desc=${desc}&banner=${banner}`);
  }

  return (
    <FlatList
      data={plan ? plan.plans : []}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={(
        <View style={{ paddingTop: insets.top }}>
          {/* Header */}
          <Header
            style={styles.header}
            prefix={
              <Pressable
                onPress={onPressLeftArrow}
                style={[styles.headerPrefix, !isSearchActive && styles.hidden]}
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
              <Pressable onPress={onPressArchive}>
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
                    desc: currentPlan.description,
                    banner: currentPlan.thumbnail
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
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
    />
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