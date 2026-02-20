// components/ui/Button.tsx
import { Pressable, Text } from "react-native";
import { BtnColors, FontColors } from "@/constants/colors";

type Props = {
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
};

export default function Button({ children, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? BtnColors.disabled : BtnColors.maincolors,
        alignSelf: "center",
        paddingVertical: 12,
        paddingHorizontal: 60,
        borderRadius: 12,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: FontColors.maincolors,
          fontSize: 24,
          fontWeight: "bold",
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
