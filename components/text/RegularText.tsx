import { Platform } from 'react-native';
import CustomText, { CustomTextProps } from './CustomText';

export const RegularText = (props: CustomTextProps) => (
  <CustomText {...props} fontFamily={Platform.OS === 'ios' ? "NotoSansKR_400Regular" : "Inter_400Regular"} />
);