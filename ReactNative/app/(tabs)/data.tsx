import { View, Text } from "react-native";
import { useState, useEffect } from "react";
import { MAINCOLORS } from "@/constants/colors";
import SleepChart from "@/components/ui/SleepChart";
import { Dimensions } from "react-native";
import Title from "@/components/ui/title";
import { mockData } from "@/constants/mock";

export default function Data() {
  const screenWidth = Dimensions.get("window").width;
  const [sleepData, setSleepData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    setLabels(mockData.map(item => item.time));
    setSleepData(mockData.map(item => item.score));
    }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: MAINCOLORS.Background,
        // justifyContent: "center",
        alignItems: "center",
        paddingTop: 108,
        gap: 24,
      }}
    >
      <Title>睡眠データ</Title>

      {sleepData.length > 0 && labels.length > 0 && (
        <SleepChart labels={labels} data={sleepData} />
      )}

    </View>
  );
}
