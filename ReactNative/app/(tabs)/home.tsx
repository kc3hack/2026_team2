import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

import { useSleepTracker } from '../../hooks/useSleepTracker';
import { processAndCacheSleepData } from '../../utils/sleepDataProcessor'; 

export default function HomeScreen() {
  const { isRecording, startTracking, stopTracking } = useSleepTracker();
  const [isProcessing, setIsProcessing] = useState(false);

  // ■ 計測開始
  const handleStart = () => {
    startTracking();
  };

  // ■ 計測終了とCSV出力
  const handleStop = async () => {
    setIsProcessing(true);
    
    // 1. フックから生データを受け取る
    const rawLogs = stopTracking();

    if (rawLogs.length === 0) {
      Alert.alert("エラー", "データがありません。もう少し計測してください。");
      setIsProcessing(false);
      return;
    }

    try {
      // 2. データの分析からCSV保存まで、全部プロセッサーに丸投げ！
      // 返ってくるのは保存されたファイルのURI（またはnull）
      const savedUri = await processAndCacheSleepData(rawLogs);

      // 3. 保存に成功していたらシェア画面を立ち上げるだけ！
      if (savedUri) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(savedUri);
        } else {
          Alert.alert('エラー', 'この端末ではファイルの共有機能が使えません');
        }
      } else {
        Alert.alert('エラー', 'データの処理または保存に失敗しました');
      }

    } catch (error) {
      Alert.alert("エラー", "予期せぬ問題が発生しました。");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Tracker (Data Mode)</Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusText}>
          {isRecording ? "🌙 データ収集＆分析中..." : "☀️ 待機中"}
        </Text>
      </View>

      {isProcessing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ffcc" />
          <Text style={styles.loadingText}>データを処理しています...</Text>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          {!isRecording ? (
            <TouchableOpacity style={[styles.button, styles.startButton]} onPress={handleStart}>
              <Text style={styles.buttonText}>計測スタート</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStop}>
              <Text style={styles.buttonText}>計測終了 ＆ CSVシェア</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 40,
  },
  statusCard: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  statusText: {
    fontSize: 18,
    color: '#00ffcc',
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingText: {
    color: '#00ffcc',
    marginTop: 15,
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
  },
  startButton: {
    backgroundColor: '#4e54c8',
  },
  stopButton: {
    backgroundColor: '#ff4b2b',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});