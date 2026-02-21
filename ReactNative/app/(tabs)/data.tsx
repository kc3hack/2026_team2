import { View, Text } from "react-native";
import { useState, useEffect } from "react";
import { MainColors } from "@/constants/colors";
import SleepChart from "@/components/ui/SleepChart";
import Title from "@/components/ui/title";
import Papa from "papaparse";
import * as FileSystem from "expo-file-system/legacy";

export default function Data() {
  const [sleepData, setSleepData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    const loadSleepDataFromCsv = async () => {
      try {
        let fileUri = `${FileSystem.cacheDirectory}sleep_data.csv`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        // CSVが存在する場合のみ読み込む
        if (fileInfo.exists) {
          const csvText = await FileSystem.readAsStringAsync(fileUri);
          const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
          const parsedData = result.data as any[];

          const safeRows = parsedData.filter(
            row =>
              row.timestamp &&
              row.score !== undefined &&
              row.score !== "" &&
              !isNaN(Number(row.score))
          );

          setLabels(safeRows.map(row => row.timestamp));
          setSleepData(safeRows.map(row => Number(row.score)));
        } else {
          // CSV が存在しない場合 → 仮データは作らずに「データなし」
          setLabels([]);
          setSleepData([]);
        }
      } catch (error) {
        console.log("CSV読み込みエラー:", error);
        setLabels([]);
        setSleepData([]);
      }
    };

    loadSleepDataFromCsv();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        paddingTop: 108,
        gap: 24,
      }}
    >
    <Title>睡眠データ</Title>

    {sleepData.length > 0 && labels.length > 0 ? (
      <SleepChart labels={labels} data={sleepData} />
    ) : (
      <Text style={{ color: "#3CBDF4", fontSize: 12, marginTop: 130 }}>
          データがありません
      </Text>
    )}
    </View>
  );
}