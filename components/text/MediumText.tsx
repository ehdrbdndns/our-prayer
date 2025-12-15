import { Platform } from "react-native";
import CustomText, { CustomTextProps } from "./CustomText";

export const MediumText = (props: CustomTextProps) => (
  <CustomText {...props} fontFamily={Platform.OS === 'ios' ? "NotoSansKR_500Medium" : "Inter_500Medium"} />
);