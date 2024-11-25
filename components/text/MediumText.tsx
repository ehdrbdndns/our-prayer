import CustomText, { CustomTextProps } from "./CustomText";

export const MediumText = (props: CustomTextProps) => (
  <CustomText {...props} fontFamily="NotoSansKR_500Medium" />
);