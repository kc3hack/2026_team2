import { View } from "react-native";
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
      <TimeBox
        onConfirm={(t) => {
          setTargetTime(t);
        }}
      />
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
