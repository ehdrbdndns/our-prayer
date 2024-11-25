import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface SecondaryButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: object;
}

export default function SecondaryButton({ children, style, ...props }: SecondaryButtonProps) {
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
    backgroundColor: '#4F5FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 9,
  }
});