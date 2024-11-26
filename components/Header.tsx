import { moderateScale } from "@/utils/style";
import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

type HeaderProps = PropsWithChildren<{ prefix: JSX.Element, suffix: JSX.Element }>

export default function Header({ prefix, children, suffix }: HeaderProps) {
  return (
    <View style={styles.container}>
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
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingLeft: moderateScale(16),
    paddingRight: moderateScale(20),
  }
})