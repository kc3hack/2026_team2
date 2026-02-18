import { View, Text, Pressable } from "react-native";
import { MAINCOLORS } from "@/constants/colors";

type Props = {
  time: string;
  onPress?: () => void;
};

export default function TimeBox({ time, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          borderWidth: 1,
          marginTop: 271,
          borderColor: MAINCOLORS.border,
          borderRadius: 15,
          paddingVertical: 10,
          paddingHorizontal: 24,
          alignSelf: "center",
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 48,
            fontWeight: "300",
            letterSpacing: 2,
          }}
        >
          {time}
        </Text>
      </View>
    </Pressable>
  );
}
