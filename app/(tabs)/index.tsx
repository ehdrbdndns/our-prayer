import Search from "@/assets/images/search.svg";
import Logo from "@/assets/images/text-s-logo.svg";
import Header from "@/components/Header";
import { moderateScale } from "@/utils/style";
import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        prefix={
          <Link href="/login">
            <Logo
              style={{ marginLeft: moderateScale(4) }}
              width={moderateScale(82)}
              height={moderateScale(18)}
            />
          </Link>
        }
        suffix={
          <Search
            width={moderateScale(24)}
            height={moderateScale(24)}
          />
        }
      />

      {/* Hello! */}

      {/* 연속 기도일수 & 오늘의 기도 시간 */}

      {/* 오늘의 말씀 */}

      {/* 나의 기도 기록 */}

      {/* 기도 플랜 */}

      {/* 공유 카드 */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
