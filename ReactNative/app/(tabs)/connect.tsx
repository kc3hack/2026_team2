import { View, Text } from "react-native";
import ScreenTitle from "@/components/ScreenTitle";
import { MAINCOLORS } from "@/constants/colors";
import { useAudioLevel } from "@/hooks/useAudioLevel";

export default function Connect() {
  const volume = useAudioLevel();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: MAINCOLORS.Background,
        padding: 16,
      }}
    >
      <ScreenTitle title="iot接続" />
      <Text>音量: {volume}</Text>
    </View>
  );
}
