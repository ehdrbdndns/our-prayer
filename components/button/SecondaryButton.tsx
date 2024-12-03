import { TouchableOpacityProps } from "react-native";
import CustomButton from "./CustomButton";

interface SecondaryButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: object;
}

export default function SecondaryButton({ children, style, ...props }: SecondaryButtonProps) {
  return (
    <CustomButton
      style={[{ backgroundColor: '#0F141A' }, style]}
      {...props}
    >
      {children}
    </CustomButton>
  );
};