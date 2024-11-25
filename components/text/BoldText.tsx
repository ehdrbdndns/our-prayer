import CustomText, { CustomTextProps } from "./CustomText";

export const BoldText = (props: CustomTextProps) => (
  <CustomText {...props} fontFamily="NotoSansKR_700Bold" />
);