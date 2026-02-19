import { useState, useEffect, useRef } from 'react';
import { useAccelerometer } from './useAccelerometer';
import { useAudioLevel } from './useAudioLevel';

// 1分ごとのパケットの型定義
export type MinuteLog = {
  timestamp: string;
  accelMax: number;
  audioMax: number;
};

export const useSleepTracker = () => {
  const [isRecording, setIsRecording] = useState(false);

  // リアルタイムセンサーデータ
  const currentAccel = useAccelerometer();
  const currentAudio = useAudioLevel();

  // 記録を保持する配列
  const history = useRef<MinuteLog[]>([]);

  // 1分間の「最大値」だけを一時的に保持しておくバッファ（メモリ節約のため配列ではなく数値で保持）
  const tempMax = useRef({
    accel: 1.0, // 加速度の基本値は約1.0G
    audio: 0.0
  });

  // ■ センサーの値が更新されるたびに、最大値を更新する
  useEffect(() => {
    if (!isRecording) return;

    // 現在の値がバッファの最大値を超えていたら上書き
    if (currentAccel > tempMax.current.accel) {
      tempMax.current.accel = currentAccel;
    }
    if (currentAudio > tempMax.current.audio) {
      tempMax.current.audio = currentAudio;
    }
  }, [currentAccel, currentAudio, isRecording]);

  // ■ 純粋な時計ベース（setInterval）でのデータ収集ループ
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isRecording) {
      // ※ テスト用に早く回したい場合は、ここの 60000 を 10000 (10秒) などに変更してください
      intervalId = setInterval(() => {
        const now = new Date().toLocaleTimeString('ja-JP', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        });

        // その1分間で見つけた最大値を記録
        history.current.push({
          timestamp: now,
          accelMax: tempMax.current.accel,
          audioMax: tempMax.current.audio
        });

        // 記録が終わったら、次の1分に向けてバッファをリセット
        tempMax.current = { accel: 1.0, audio: 0.0 };

      }, 60000); // ここで「絶対に1分（60000ミリ秒）ごと」を保証します
    }

    // 計測が止まったらタイマーを解除
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRecording]);

  // ■ 記録開始
  const startTracking = () => {
    history.current = [];
    tempMax.current = { accel: 1.0, audio: 0.0 };
    setIsRecording(true);
  };

  /**
   * 記録を止めて、溜まった全データを返す
   */
  const stopTracking = () => {
    setIsRecording(false);
    return history.current;
  };

  return {
    isRecording,
    currentAccel,
    currentAudio,
    startTracking,
    stopTracking
  };
};