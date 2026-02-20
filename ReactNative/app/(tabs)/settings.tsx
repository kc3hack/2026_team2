import { View, Text, ScrollView } from "react-native";
import { MAINCOLORS } from "@/constants/colors";
import Title from "@/components/ui/title";
import { SettingItem, SettingSection } from "@/components/ui/Setting";
import { useSerialPort } from "@/hooks/useSerialPort";
import { Platform } from "react-native";
import { useAudioLevel } from "@/hooks/useAudioLevel";

export default function Settings() {
  const volume = useAudioLevel();
  const { serialState, trySendData } = useSerialPort();
  const { volume } = useAudioLevel();

  // 接続状態を日本語に変換
  const getConnectionStatusText = () => {
    switch (serialState) {
      case "connected":
        return "接続中";
      case "disconnected":
        return "未接続";
      case "error":
        return "エラー";
      case "unsupported":
        return "非対応";
      default:
        return "不明";
    }
  };

  // 接続状態に応じた色を取得
  const getConnectionStatusColor = () => {
    switch (serialState) {
      case "connected":
        return "#4CAF50"; // 緑
      case "disconnected":
        return "#FF9800"; // オレンジ
      case "error":
        return "#F44336"; // 赤
      case "unsupported":
        return "#9E9E9E"; // グレー
      default:
        return "#9E9E9E"; // グレー
    }
  };

  // 接続テスト（0x31を送信）
  const handleConnectionTest = async () => {
    try {
      await trySendData("0x31");
      console.log("Connection test: 0x31 sent successfully");
    } catch (error) {
      console.error("Connection test failed:", error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: MAINCOLORS.Background,
        // justifyContent: "center",
        alignItems: "center",
        paddingTop: 108,
        paddingHorizontal: 24,
        gap: 24,
      }}
    >
      <Title>設定</Title>
      <ScrollView>
        <SettingSection title="IoT接続">
          <SettingItem title="接続状況">
            <Text
              style={{
                color: getConnectionStatusColor(),
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {getConnectionStatusText()}
            </Text>
          </SettingItem>
          <SettingItem title="接続をテスト" onPress={handleConnectionTest} />
        </SettingSection>
        <SettingSection title="音声ファイル">
          <SettingItem title="ファイル状況状況"></SettingItem>
          <SettingItem title="再生テスト" onPress={() => {}} />
          <SettingItem title="音量">{volume}</SettingItem>
        </SettingSection>
        <SettingSection title="学習データ">
          <SettingItem title="強制再取得" onPress={() => {}} />
        </SettingSection>
        {/* 音量レベルの表示（デバッグ用） */}
        <SettingSection title="音量レベル">
          <SettingItem title="現在の音量レベル">
            <Text
              style={{
                color: getConnectionStatusColor(),
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {volume}
            </Text>
          </SettingItem>
        </SettingSection>
      </ScrollView>
    </View>
  );
}
