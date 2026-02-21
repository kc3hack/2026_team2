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
  
  // 💡 Contextから現在のAI設定値（Music, Pitch, Speed）も取得するように追加
  const { 
    setVolume, 
    audioUri, 
    currentMusic, 
    currentPitch, 
    currentSpeed 
  } = useAlarmAudio();

  const handleWakeUp = async () => {
    setIsReset(true); 
    console.log("アラームを停止しました");

    try {
      const now = new Date();
      
      // 💡 1. ターゲットを「現在時刻の30分前」にする
      const target = new Date(now.getTime() - 30 * 60 * 1000); 

      // 💡 2. 文字列としての時刻（HH:mm）をターゲットから作る
      // これをしないと、sendWakeUpDataに渡す時間が TimeBox の値とズレてしまいます
      const targetTimeStr = `${target.getHours().toString().padStart(2, '0')}:${target.getMinutes().toString().padStart(2, '0')}`;

      // 💡 3. diffSeconds は単純に 1800 (30分) になる
      let diffSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

      console.log("--- 送信処理開始 ---");
      
      // 💡 Contextから取得した現在の設定値を引数に渡す
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