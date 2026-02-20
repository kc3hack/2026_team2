import { View, Text, StyleSheet } from "react-native";
import { useAlarmMonitor } from "../hooks/useAlarmMonitor";

export default function HomeScreen() {
  // テスト用に1分後を設定
  const testTarget = new Date(Date.now() + 1 * 60 * 1000).toISOString();

  // isAlarmActive（アラーム作動中フラグ）も受け取るように追加！
  const { isMonitoring, volume, magnitude, isAlarmActive } =
    useAlarmMonitor(testTarget);

  return (
    <View style={[styles.container, isAlarmActive && styles.containerAlert]}>
      <Text style={styles.title}>アラーム実験中 ⏰</Text>

      <View style={styles.card}>
        <Text style={styles.label}>監視状態:</Text>
        <Text
          style={[
            styles.value,
            { color: isMonitoring ? "#4CAF50" : "#F44336" },
          ]}
        >
          {isMonitoring ? "ON (30分前)" : "待機中"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>スマホの揺れ (Magnitude):</Text>
        <Text style={styles.value}>{magnitude.toFixed(3)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>現在のアラーム音量:</Text>
        <Text style={styles.value}>{volume.toFixed(0)} %</Text>
      </View>

      {/* magnitude > 1.2 だけでなく、
         一度でも検知した(isAlarmActive)なら、ずっと表示し続けるように変更！
      */}
      {isAlarmActive && (
        <View style={styles.alertContainer}>
          <Text style={styles.alert}>⚡️ 寝返りを検知しました！</Text>
          <Text style={styles.subAlert}>起きるまで爆音ループ中！🔥</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f7",
  },
  // アラーム作動時に背景色を変えるとかっこいい
  containerAlert: { backgroundColor: "#FFEBEE" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    width: "80%",
    marginBottom: 15,
    elevation: 3,
  },
  label: { fontSize: 14, color: "#888" },
  value: { fontSize: 24, fontWeight: "bold", marginTop: 5 },
  alertContainer: { alignItems: "center", marginTop: 20 },
  alert: { color: "#FF5252", fontSize: 26, fontWeight: "bold" },
  subAlert: { color: "#FF5252", fontSize: 16, marginTop: 5 },
});
