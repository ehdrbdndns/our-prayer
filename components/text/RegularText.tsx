import CustomText, { CustomTextProps } from './CustomText';

export const RegularText = (props: CustomTextProps) => (
  <CustomText {...props} fontFamily="NotoSansKR_400Regular" />
);