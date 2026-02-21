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
  const { setVolume } = useAlarmAudio();

  // Contextが存在しない場合のガード
  if (!alarmMonitor) {
    throw new Error(
      "AlarmMonitorContext must be used within AlarmMonitorProvider",
    );
  }

  // Contextから必要な値を抽出
  const { isMonitoring, isAlarmActive, reset, setTargetTime, targetTime } =
    alarmMonitor;

  const handleWakeUp = async () => {
    // 💡 Contextのreset関数を使用してアラームを停止
    reset();
    console.log("アラームを停止しました");

    try {
      const startDate = new Date();
      const [targetHour, targetMinute] = targetTime.split(":").map(Number);
      startDate.setHours(targetHour);
      startDate.setMinutes(targetMinute - 30); // 30分前に設定
      startDate.setSeconds(0);

      const wakeUpDate = new Date();
      let wakeUpSeconds = Math.floor(
        (wakeUpDate.getTime() - startDate.getTime()) / 1000,
      );

      console.log(`起床までの時間: ${wakeUpSeconds} 秒`);

      // Context/Hookから取得した現在の設定値を引数に渡す
      await sendWakeUpData(wakeUpSeconds);

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
        initialTime={targetTime}
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
