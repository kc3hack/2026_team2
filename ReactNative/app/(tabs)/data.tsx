import { View } from "react-native";
import { useState, useEffect } from "react";
import { MAINCOLORS } from "@/constants/colors";
import SleepChart from "@/components/ui/SleepChart";
import Title from "@/components/ui/title";
import Papa from "papaparse";
import * as FileSystem from "expo-file-system";
import { processAndCacheSleepData } from "@/utils/processAndCacheSleepData";

export default function Data() {
  const [sleepData, setSleepData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    const loadSleepData = async () => {
      try {
        // ① 生ログを取得（ここはあなたのフック）
        const rawLogs = []; // ← 実際はフックから取得

        // ② CSVを生成して保存
        const fileUri = await processAndCacheSleepData(rawLogs);

        if (!fileUri) return;

        // ③ 保存されたCSVを読む
        const csvText = await FileSystem.readAsStringAsync(fileUri);

        const result = Papa.parse(csvText, { header: true });
        const parsedData = result.data as any[];

        setLabels(parsedData.map(item => item.timestamp));
        setSleepData(parsedData.map(item => Number(item.score)));

      } catch (error) {
        console.log("CSV読み込みエラー:", error);
      }
    };

    loadSleepData();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: MAINCOLORS.Background,
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