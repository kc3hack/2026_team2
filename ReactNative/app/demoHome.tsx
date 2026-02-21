import { Pressable, View } from "react-native";
import { useEffect, useContext } from "react";
import CatButton from "@/components/ui/CatButton";
import TimeBox from "@/components/ui/TimeBox";
import { MAINCOLORS } from "@/constants/colors";
import Title from "@/components/ui/title";
import { AlarmMonitorContext } from "@/contexts/AlarmMonitorContext";
import { useAlarmAudio } from "@/hooks/useAlarmAudio";
import { useSerialPort } from "@/hooks/useSerialPort";

export default function Home() {
  const alarmMonitor = useContext(AlarmMonitorContext);
  const { trySendData } = useSerialPort();
  const { setVolume } = useAlarmAudio();

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
      <CatButton
        disabled={!isMonitoring}
        onPress={() => {
          reset();
          trySendData("0x32");
        }}
      >
        STOP
      </CatButton>
    </View>
  );
}
