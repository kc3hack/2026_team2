import { Pressable, View } from "react-native";
import { useEffect, useContext } from "react";
import Button from "@/components/ui/Button";
import TimeBox from "@/components/ui/TimeBox";
import { MAINCOLORS } from "@/constants/colors";
import Title from "@/components/ui/title";
import { AlarmMonitorContext } from "@/contexts/AlarmMonitorContext";
import { useAlarmAudio } from "@/hooks/useAlarmAudio";

export default function Home() {
  const alarmMonitor = useContext(AlarmMonitorContext);
  const { setVolume } = useAlarmAudio();

  if (!alarmMonitor) {
    throw new Error(
      "AlarmMonitorContext must be used within AlarmMonitorProvider",
    );
  }

  // useEffect(() => {
  //   // 現在時刻の20分後を5分刻みに切り捨てて設定
  //   const now = new Date();
  //   const target = new Date(now.getTime() + 20 * 60 * 1000); // 20分後
  //   const minutes = Math.floor(target.getMinutes() / 5) * 5; // 5分刻みに切り捨て
  //   target.setMinutes(minutes);
  //   const timeStr = `${String(target.getHours()).padStart(2, "0")}:${String(target.getMinutes()).padStart(2, "0")}`;
  //   setTargetTime(timeStr);
  // }, []);

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
          // 現在時刻の20分後を5分刻みに切り捨てて設定
          const now = new Date();
          const target = new Date(now.getTime() + 20 * 60 * 1000); // 20分後
          const minutes = Math.floor(target.getMinutes() / 5) * 5; // 5分刻みに切り捨て
          target.setMinutes(minutes);
          const timeStr = `${String(target.getHours()).padStart(2, "0")}:${String(target.getMinutes()).padStart(2, "0")}`;
          setTargetTime(timeStr);
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
        }}
      >
        stop
      </Button>
    </View>
  );
}
