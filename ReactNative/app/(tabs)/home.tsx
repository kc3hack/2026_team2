import { View } from "react-native";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import TimeBox from "@/components/ui/TimeBox";
import { MAINCOLORS } from "@/constants/colors";
import Title from "@/components/ui/title";
import { useAlarmMonitor } from "@/hooks/useAlarmMonitor";
import { useAlarmAudio } from "@/hooks/useAlarmAudio";
import { sendWakeUpData } from "@/services/sendWakeUpDataService";

export default function Home() {
  const [time, setTime] = useState("09:00");
  const { isMonitoring, isAlarmActive, setIsReset } = useAlarmMonitor(time);
  const { setVolume, audioUri } = useAlarmAudio();

  const handleWakeUp = async () => {
    setIsReset(true);
    try {
      // 1. 現在時刻を取得
      const now = new Date();

      // 2. 設定時刻（HH:mm）を今日の Date オブジェクトに変換
      const [hours, minutes] = time.split(":").map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);

      // 3. 差分を計算（ミリ秒単位）
      // target - now が正なら「予定より早い」、負なら「寝坊（予定より遅い）」
      const diffMs = target.getTime() - now.getTime() ;
      const diffSeconds = Math.floor(diffMs / 1000);

      console.log(`設定時刻との差分: ${diffSeconds}秒`);

      // 4. サーバーに送信（差分も引数に含める）
      await sendWakeUpData(time, audioUri, diffSeconds);
      
      console.log("送信成功！");
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
        // justifyContent: "center",
        alignItems: "center",
        paddingTop: 108,
        gap: 84,
      }}
    >
      <Title>Home</Title>
      <TimeBox
        onConfirm={(t) => {
          setTime(t);
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
