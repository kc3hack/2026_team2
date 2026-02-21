import { View } from "react-native";
import { useEffect, useContext } from "react";
import Button from "@/components/ui/Button";
import TimeBox from "@/components/ui/TimeBox";
import { MAINCOLORS } from "@/constants/colors";
import Title from "@/components/ui/title";
import { AlarmMonitorContext } from "@/contexts/AlarmMonitorContext";
import { useAlarmAudio } from "@/hooks/useAlarmAudio";
import { sendWakeUpData } from "@/services/sendWakeUpDataService";

export default function Home() {
  // 💡 Contextから監視状態を取得
  const alarmMonitor = useContext(AlarmMonitorContext);

  // 💡 AI設定値（Music, Pitch, Speed）と音量制御を取得
  const { 
    setVolume, 
    audioUri, 
    currentMusic, 
    currentPitch, 
    currentSpeed 
  } = useAlarmAudio();

  // Contextが存在しない場合のガード
  if (!alarmMonitor) {
    throw new Error(
      "AlarmMonitorContext must be used within AlarmMonitorProvider",
    );
  }

  // Contextから必要な値を抽出
  const { isMonitoring, isAlarmActive, reset, setTargetTime } = alarmMonitor;

  const handleWakeUp = async () => {
    // 💡 Contextのreset関数を使用してアラームを停止
    reset(); 
    console.log("アラームを停止しました");

    try {
      const now = new Date();
      
      // 💡 ターゲットを「現在時刻の30分前」にする
      const target = new Date(now.getTime() - 30 * 60 * 1000); 

      // 文字列としての時刻（HH:mm）をターゲットから作る
      const targetTimeStr = `${target.getHours().toString().padStart(2, '0')}:${target.getMinutes().toString().padStart(2, '0')}`;

      // diffSeconds は 1800 秒になる
      let diffSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

      console.log(`--- 送信処理開始 (ターゲット: ${targetTimeStr}) ---`);
      
      // Context/Hookから取得した現在の設定値を引数に渡す
      await sendWakeUpData(
        targetTimeStr, 
        audioUri, 
        diffSeconds,
        currentMusic, 
        currentPitch, 
        currentSpeed
      );
      
      console.log("--- 送信完了！ ---");
    } catch (error) {
      console.error("送信に失敗しました:", error);
    }
  };

  useEffect(() => {
    if (isAlarmActive && isMonitoring) {
      setVolume(100);
    } else if (isMonitoring) {
      setVolume(10);
    } else {
      setVolume(0);
    }
  }, [isMonitoring, isAlarmActive, setVolume]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: MAINCOLORS.Background,
        alignItems: "center",
        paddingTop: 108,
        gap: 84,
      }}
    >
      <Title>Home</Title>
      <TimeBox
        onConfirm={(t) => {
          setTargetTime(t);
        }}
      />
      <Button
        disabled={!isMonitoring}
        onPress={() => {
          handleWakeUp();
        }}
      >
        stop
      </Button>
    </View>
  );
}