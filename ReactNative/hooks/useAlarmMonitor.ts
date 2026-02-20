import { useState, useEffect, useCallback } from "react";
import { useAccelerometer } from "./useAccelerometer";
import { useAlarmAudio } from "./useAlarmAudio";

/**
 * アラーム監視のビジネスロジックを管理するカスタムフック
 *
 * - 目標時間の30分前から監視開始
 * - 加速度センサーで寝返りを検知
 * - 検知時に音量を段階的に増加
 *
 * @param targetTimeStr - 目標時間の文字列（Date型に変換可能な形式）
 */
export const useAlarmMonitor = (targetTimeStr: string) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const { magnitude } = useAccelerometer();
  const { volume, setVolume, isReady } = useAlarmAudio();

  /**
   * 30分前判定タイマー
   * 1分ごとに目標時間との差分をチェックし、30分前になったら監視を開始
   */
  useEffect(() => {
    const checkTime = setInterval(() => {
      const now = new Date();
      const target = new Date(targetTimeStr);
      const diffMin = (target.getTime() - now.getTime()) / (1000 * 60);

      if (diffMin <= 30 && diffMin > 0) {
        setIsMonitoring(true);
      }
    }, 60000); // 1分ごとにチェック

    return () => clearInterval(checkTime);
  }, [targetTimeStr]);

  /**
   * 音量を段階的に増加させる関数
   * 0.1ずつアップ（最大100）
   */
  const increaseVolume = useCallback(() => {
    setVolume(Math.min(volume + 10, 100)); // 0-100スケールで10ずつ増加
  }, [setVolume, volume]);

  /**
   * 寝返り検知
   * magnitude が 1.05 を超えたらアラーム作動状態をONにする
   */
  useEffect(() => {
    // 1.05を超えたら「アラーム作動状態」をONにする
    if (magnitude > 1.05 && !isAlarmActive && isMonitoring) {
      console.log("🚨 寝返り検知！音量を上げ始めます");
      setIsAlarmActive(true);
    }

    // アラームが作動中なら、揺れるたびに音量を上げる
    if (isAlarmActive && isReady) {
      increaseVolume();
    }
  }, [magnitude, isAlarmActive, isMonitoring, isReady, increaseVolume]);

  return {
    /** 監視中かどうか（30分前になったらtrue） */
    isMonitoring,
    /** 現在の音量 (0-100) */
    volume,
    /** 加速度センサーの振動値 */
    magnitude,
    /** アラームが作動中かどうか */
    isAlarmActive,
  };
};
