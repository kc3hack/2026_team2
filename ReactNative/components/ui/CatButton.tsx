// components/ui/CatButton.tsx
import { Pressable, Text } from "react-native";
import { BtnColors, FontColors } from "@/constants/colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Props = {
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
};

export default function CatButton({ children, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: "#FFFFFF",
        opacity: disabled ? 0.5 : 1,
        alignSelf: "center",
        width: 180,
        height: 180,
        borderRadius: 90,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        marginTop: -70
      }}
    >
      <Text
        style={{
          color: FontColors.title,
          fontSize: 32,
          fontWeight: "bold",
        }}
      >
        {children}
      </Text>
      <MaterialCommunityIcons name="paw" size={90} color="#fa9ada" />
    </Pressable>
  );
}
