import { Pressable, View } from "react-native";
import { useEffect, useContext } from "react";
import Button from "@/components/ui/Button";
import TimeBox from "@/components/ui/TimeBox";
import { MAINCOLORS } from "@/constants/colors";
import Title from "@/components/ui/title";
import { AlarmMonitorContext } from "@/contexts/AlarmMonitorContext";
import { useAlarmAudio } from "@/hooks/useAlarmAudio";
import { useSerialPort } from "@/hooks/useSerialPort";
import { sendWakeUpData } from "@/services/sendWakeUpDataService";
import { fetchAndSaveAlarmData } from "@/services/alarmService";

export default function Home() {
  const alarmMonitor = useContext(AlarmMonitorContext);
  const { trySendData } = useSerialPort();
  const { setVolume, loadAudio } = useAlarmAudio();

  if (!alarmMonitor) {
    throw new Error(
      "AlarmMonitorContext must be used within AlarmMonitorProvider",
    );
  }

  const { isMonitoring, isAlarmActive, reset, setTargetTime, targetTime } =
    alarmMonitor;

  useEffect(() => {
    if (isAlarmActive && isMonitoring) {
      setVolume(100);
    } else if (isMonitoring) {
      setVolume(10);
    } else {
      setVolume(0);
    }
  }, [isMonitoring, isAlarmActive, setVolume]);

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

      // サーバーからデータを取得してキャッシュに保存
      await fetchAndSaveAlarmData();

      // 音声ファイルをリロード
      await loadAudio();
    } catch (error) {
      console.error("送信に失敗しました:", error);
    }
  };

  const handleSendData = async () => {
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
        gap: 84,
      }}
    >
      <Title>Home</Title>
      <Pressable
        onPress={() => {
          if (!isMonitoring) {
            // 現在時刻の20分後を5分刻みに切り捨てて設定
            const now = new Date();
            const target = new Date(now.getTime() + 20 * 60 * 1000); // 20分後
            const minutes = Math.floor(target.getMinutes() / 5) * 5; // 5分刻みに切り捨て
            target.setMinutes(minutes);
            const timeStr = `${String(target.getHours()).padStart(2, "0")}:${String(target.getMinutes()).padStart(2, "0")}`;
            setTargetTime(timeStr);
          } else {
            handleSendData();
          }
        }}
      >
        <TimeBox
          disabled={true}
          initialTime={targetTime}
          onConfirm={(t) => {
            setTargetTime(t);
          }}
        />
      </Pressable>
      <Button
        disabled={!isMonitoring}
        onPress={() => {
          reset();
          handleWakeUp();
          trySendData("0x32");
        }}
      >
        stop
      </Button>
    </View>
  );
}
