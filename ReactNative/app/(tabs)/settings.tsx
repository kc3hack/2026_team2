import { View, Text } from "react-native";
import { MAINCOLORS } from "@/constants/colors";
import Title from "@/components/ui/title";

export default function Settings() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: MAINCOLORS.Background,
        // justifyContent: "center",
        alignItems: "center",
        paddingTop: 108,
        gap: 24,
      }}
    >
      <Title>設定</Title>
    </View>
  );
}
