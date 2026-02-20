import { View, Text, Alert, ScrollView } from "react-native";
import { useState } from "react";
import { MAINCOLORS } from "@/constants/colors";
import Title from "@/components/ui/title";
import { SettingItem, SettingSection } from "@/components/ui/Setting";
import { useSerialPort } from "@/hooks/useSerialPort";
import { useAlarmAudio } from "@/hooks/useAlarmAudio";
import { useAudioLevel } from "@/hooks/useAudioLevel";
import { useAccelerometer } from "@/hooks/useAccelerometer";
import { fetchAndSaveAlarmData } from "@/services/alarmService";
import { Link } from "expo-router";

export default function Settings() {
  const volume = useAudioLevel();
  const magnitude = useAccelerometer();
  const { serialState, trySendData } = useSerialPort();
  const { setVolume, loadAudio, isReady, isPlaying } = useAlarmAudio();
  const [isLoading, setIsLoading] = useState(false);
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

  // 再生テスト（音量50%で5秒間再生）
  const handlePlaybackTest = async () => {
    if (!isReady) {
      Alert.alert("エラー", "音声ファイルが準備できていません");
      return;
    }

    try {
      if (isPlaying) {
        // 停止
        setVolume(0);
        console.log("Playback test stopped");
      } else {
        // 再生開始（音量50%）
        setVolume(50);
        console.log("Playback test started at 50% volume");

        // 5秒後に自動停止
        setTimeout(() => {
          setVolume(0);
          console.log("Playback test auto-stopped after 5 seconds");
        }, 3000);
      }
    } catch (error) {
      console.error("Playback test failed:", error);
      Alert.alert("エラー", "再生テストに失敗しました");
    }
  };

  // サーバーからデータを再取得
  const handleRefetchData = async () => {
    setIsLoading(true);
    try {
      // サーバーからデータを取得してキャッシュに保存
      await fetchAndSaveAlarmData();

      // 音声ファイルをリロード
      await loadAudio();

      Alert.alert("成功", "データの取得と音声ファイルの更新が完了しました");
      console.log("Data refetched and audio reloaded successfully");
    } catch (error) {
      console.error("Failed to refetch data:", error);
      Alert.alert("エラー", "データの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // ファイル状況の取得
  const getFileStatusText = () => {
    if (isReady) {
      return "準備完了";
    }
    return "未準備";
  };

  const getFileStatusColor = () => {
    return isReady ? "#4CAF50" : "#FF9800";
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
          <SettingItem title="ファイル状況">
            <Text
              style={{
                color: getFileStatusColor(),
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {getFileStatusText()}
            </Text>
          </SettingItem>
          <SettingItem
            title={isPlaying ? "再生停止" : "再生テスト"}
            onPress={handlePlaybackTest}
          />
        </SettingSection>
        <SettingSection title="学習データ">
          <SettingItem
            title={isLoading ? "取得中..." : "強制再取得"}
            onPress={isLoading ? undefined : handleRefetchData}
          />
        </SettingSection>
        {/* 音量レベルの表示（デバッグ用） */}
        <SettingSection title="デバッグ情報">
          <Link href="/alarmDemo" style={{ textDecorationLine: "none" }}>
            <SettingItem title="アラームデモ画面"></SettingItem>
          </Link>
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
          <SettingItem title="現在の加速度の大きさ">
            <Text
              style={{
                color: getConnectionStatusColor(),
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {magnitude.toFixed(2)}
            </Text>
          </SettingItem>
        </SettingSection>
      </ScrollView>
    </View>
  );
}
