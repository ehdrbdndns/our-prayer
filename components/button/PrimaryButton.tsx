import CustomButton, { CustomButtonProps } from "./CustomButton";

export default function PrimaryButton({ children, style, ...props }: CustomButtonProps) {
  return (
    <CustomButton
      style={[{ backgroundColor: '#4F5FFF' }, style]}
      {...props}
    >
      {children}
    </CustomButton>
  );
}