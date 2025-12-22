import { Platform } from "react-native";
import CustomText, { CustomTextProps } from "./CustomText";

export const BoldText = (props: CustomTextProps) => (
  <CustomText {...props} fontFamily={Platform.OS === 'ios' ? "NotoSansKR_700Bold" : "Inter_700Bold"} />
);