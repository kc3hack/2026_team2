import React, { createContext, useState, useEffect, useCallback } from "react";
import { useAccelerometer } from "@/hooks/useAccelerometer";

/**
 * AlarmMonitorContextの型定義
 */
type AlarmMonitorContextType = {
  /** 監視中かどうか */
  isMonitoring: boolean;
  /** アラームが有効かどうか */
  isAlarmActive: boolean;
  /** リセットする関数 */
  reset: () => void;
  /** 目標時刻を設定する関数 */
  setTargetTime: (timeStr: string) => void;
  /** 現在の目標時刻 */
  targetTime: string;
  /** 加速度センサーの閾値 */
  threshold: number;
  /** 閾値を設定する関数 */
  setThreshold: (value: number | ((prev: number) => number)) => void;
  /** 監視開始時間（目標時刻の何分前か） */
  monitoringStartMinutes: number;
  /** 監視開始時間を設定する関数 */
  setMonitoringStartMinutes: (
    minutes: number | ((prev: number) => number),
  ) => void;
};

/**
 * AlarmMonitorContext
 */
export const AlarmMonitorContext =
  createContext<AlarmMonitorContextType | null>(null);

/**
 * AlarmMonitorProvider
 * アラームの監視状態を管理する
 */
export const AlarmMonitorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [targetTime, setTargetTimeState] = useState<string>("09:00");
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(false);
  const [isReset, setIsReset] = useState<boolean>(false);
  const [threshold, setThresholdState] = useState<number>(1.05);
  const [monitoringStartMinutes, setMonitoringStartMinutesState] =
    useState<number>(30);
  const magnitude = useAccelerometer();

  /**
   * 目標時刻を設定する関数
   */
  const setTargetTime = useCallback((timeStr: string) => {
    setTargetTimeState(timeStr);
    setIsReset(false);
  }, []);

  /**
   * リセットする関数
   */
  const reset = useCallback(() => {
    setIsReset(true);
  }, []);

  /**
   * 閾値を設定する関数
   */
  const setThreshold = useCallback(
    (value: number | ((prev: number) => number)) => {
      setThresholdState((prev) => {
        const newValue = typeof value === "function" ? value(prev) : value;
        return Math.max(1.0, Math.min(2.0, newValue));
      });
    },
    [],
  );

  /**
   * 監視開始時間を設定する関数
   */
  const setMonitoringStartMinutes = useCallback(
    (minutes: number | ((prev: number) => number)) => {
      setMonitoringStartMinutesState((prev) => {
        const newValue =
          typeof minutes === "function" ? minutes(prev) : minutes;
        return Math.max(0, Math.min(120, newValue));
      });
    },
    [],
  );

  /**
   * リセット時の処理
   */
  useEffect(() => {
    if (isReset) {
      setIsMonitoring(false);
      setIsAlarmActive(false);
    }
  }, [isReset]);

  /**
   * 目標時間の監視
   * 目標時間の指定分前から監視を開始
   */
  useEffect(() => {
    const checkTime = setInterval(() => {
      if (isReset) {
        return;
      }
      const now = new Date();
      const [hours, minutes] = targetTime.split(":").map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);

      // 既に過ぎている場合は翌日に設定
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }
      const diffMin = (target.getTime() - now.getTime()) / (1000 * 60);

      if (diffMin <= monitoringStartMinutes && diffMin > 0) {
        setIsMonitoring(true);
      } else {
        setIsMonitoring(false);
      }
    }, 1000);

    return () => clearInterval(checkTime);
  }, [targetTime, isReset, monitoringStartMinutes]);

  /**
   * 加速度センサーによる寝返り検知
   */
  useEffect(() => {
    if (!isMonitoring) return;

    if (magnitude > threshold && !isAlarmActive) {
      console.log(
        `Alarm triggered: magnitude ${magnitude.toFixed(2)} > threshold ${threshold}`,
      );
      setIsAlarmActive(true);
    }
  }, [magnitude, isAlarmActive, isMonitoring, threshold]);

  const value: AlarmMonitorContextType = {
    isMonitoring,
    isAlarmActive,
    reset,
    setTargetTime,
    targetTime,
    threshold,
    setThreshold,
    monitoringStartMinutes,
    setMonitoringStartMinutes,
  };

  return (
    <AlarmMonitorContext.Provider value={value}>
      {children}
    </AlarmMonitorContext.Provider>
  );
};
