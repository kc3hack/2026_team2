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
      const [hours, minutes] = time.split(":").map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);

      let diffSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);
      if (diffSeconds < -43200) { 
        diffSeconds += 86400; 
      }

      console.log("--- 送信処理開始 ---");
      
      // 💡 Contextから取得した現在の設定値を引数に渡す
      await sendWakeUpData(
        time, 
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