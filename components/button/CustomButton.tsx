import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from "react-native";

export interface CustomButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: object;
}

export default function CustomButton({ children, style, ...props }: CustomButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 9,
  }
});