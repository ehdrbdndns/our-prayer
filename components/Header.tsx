import { moderateScale } from "@/utils/style";
import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type HeaderProps = PropsWithChildren<{
  prefix: JSX.Element;
  suffix: JSX.Element;
  style?: StyleProp<ViewStyle>;
}>;

export default function Header({ prefix, children, suffix, style }: HeaderProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Prefix */}
      <View>
        {prefix}
      </View>

      {/* Content */}
      <View>
        {children}
      </View>

      {/* Suffix */}
      <View>
        {suffix}
      </View>
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