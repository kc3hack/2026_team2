import { View, Text } from "react-native";
import ScreenTitle from "@/components/ScreenTitle";
import { MAINCOLORS } from "@/constants/colors";
import { useSerialPort } from "@/hooks/useSerialPort";
import Button from "@/components/ui/Button";

export default function Connect() {
  const { trySendData, serialState } = useSerialPort();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: MAINCOLORS.Background,
        padding: 16,
      }}
    >
      <ScreenTitle title="iot接続" />
      <Text>{serialState}</Text>
      <Button
        text="データ送信"
        onPress={async () => await trySendData("0x31")}
      />
    </View>
  );
}
