import { View } from "react-native";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import TimeBox from "@/components/ui/TimeBox";
import { MAINCOLORS } from "@/constants/colors";
import Title from "@/components/ui/title";
import { useAlarmMonitor } from "@/hooks/useAlarmMonitor";
import { useAlarmAudio } from "@/hooks/useAlarmAudio";

export default function Home() {
  const [time, setTime] = useState("09:00");
  const { isMonitoring, isAlarmActive, setIsReset } = useAlarmMonitor(time);
  const { setVolume } = useAlarmAudio();

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
          setIsReset(true);
        }}
      >
        stop
      </Button>
    </View>
  );
}
