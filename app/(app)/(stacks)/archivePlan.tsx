import LeftArrow from "@/assets/images/icon/leftArrow.svg";
import Header from "@/components/Header";
import PlanCard from "@/components/PlanCard";
import { MediumText } from "@/components/text/MediumText";
import { moderateScale } from "@/utils/style";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ArchivePlan() {
  const insets = useSafeAreaInsets();

  const onPressLeftArrow = () => {
    router.back();
  }

  return (
    <FlatList
      data={[1, 2, 3, 4, 5]}
      showsHorizontalScrollIndicator={false}
      ListHeaderComponent={(
        <View style={{ paddingTop: insets.top }}>
          {/* Header */}
          <Header
            style={styles.header}
            prefix={
              <View style={styles.headerPrefix}>
                <Pressable onPress={onPressLeftArrow}>
                  <LeftArrow />
                </Pressable>
                <MediumText
                  fontSize={16}
                  lineHeight={24}
                >
                  보관함
                </MediumText>
              </View>
            }
            suffix={<View />}
          />
        </View>
      )}
      renderItem={() => <PlanCard />}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
    />
  )
}

const styles = StyleSheet.create({
  header: {
    marginBottom: moderateScale(24),
  },
  headerPrefix: {
    flexDirection: 'row',
    gap: moderateScale(16),
  },
  columnWrapper: {
    paddingHorizontal: moderateScale(24),
    gap: moderateScale(8),
    marginBottom: moderateScale(8)
  }
})