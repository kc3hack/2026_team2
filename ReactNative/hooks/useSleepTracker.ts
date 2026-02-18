import { useState, useEffect, useRef } from 'react';
import { useAccelerometer } from './useAccelerometer';
import { useAudioLevel } from './useAudioLevel';

// 1分ごとのパケットの型定義）
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

  // 内部バッファ
  const accelBuffer = useRef<number[]>([]);
  const audioBuffer = useRef<number[]>([]);
  const history = useRef<MinuteLog[]>([]);

  // ■ 毎秒のデータ収集ループ
  useEffect(() => {
    if (!isRecording) return;

    accelBuffer.current.push(currentAccel);
    audioBuffer.current.push(currentAudio);

    // 1分間(約600サンプル)溜まったら記録
    if (accelBuffer.current.length >= 600) {
      const now = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      
      // 分析はせず、最大値だけを抜き出して記録する
      history.current.push({
        timestamp: now,
        accelMax: Math.max(...accelBuffer.current),
        audioMax: Math.max(...audioBuffer.current)
      });

      // バッファを空にする
      accelBuffer.current = [];
      audioBuffer.current = [];
    }
  }, [currentAccel, currentAudio, isRecording]);

  // ■ 記録開始
  const startTracking = () => {
    history.current = [];
    accelBuffer.current = [];
    audioBuffer.current = [];
    setIsRecording(true);
  };

  /**
   * 記録を止めて、溜まった全データを返す
   */
  const stopTracking = () => {
    setIsRecording(false);
    // 溜まった生データ（配列）をそのまま返す
    return history.current;
  };

  return {
    isRecording,
    currentAccel, // テスト用に残しておく
    currentAudio, // テスト用に残しておく
    startTracking,
    stopTracking
  };
};