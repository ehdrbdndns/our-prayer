import { moderateScale } from "@/utils/style";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type HeaderProps = {
  prefix?: JSX.Element;
  infix?: JSX.Element;
  suffix?: JSX.Element;
  style?: StyleProp<ViewStyle>;
}

export default function Header({ prefix, infix, suffix, style }: HeaderProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Prefix */}
      {prefix}

      {/* Content */}
      {infix}

      {/* Suffix */}
      {suffix}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: moderateScale(16),
    paddingRight: moderateScale(20),
    paddingVertical: moderateScale(14),
  },
});