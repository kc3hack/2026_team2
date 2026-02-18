// components/ui/Button.tsx
import { Pressable, Text } from "react-native";
import { BtnColors } from "@/constants/colors";

type Props = {
    text: string;
    onPress?: () => void;
};

export default function Button({ text, onPress }: Props) {
    return (
        <Pressable
        onPress={onPress}
        style={{
            backgroundColor: BtnColors.maincolors,
            position: "absolute",
            bottom: 80, 
            alignSelf: "center", 
            paddingVertical: 14,
            paddingHorizontal: 40,
            borderRadius: 15,
            alignItems: "center",
            width: 170,
        }}
        >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            {text}
        </Text>
        </Pressable>
    );
}
