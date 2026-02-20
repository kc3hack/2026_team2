import { useState, useEffect } from "react";
import { useAccelerometer } from "./useAccelerometer";

export const useAlarmMonitor = (targetTimeStr: string) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const magnitude = useAccelerometer();

  useEffect(() => {
    setIsReset(false);
  }, [targetTimeStr]);

  // 目標時間の30分前から監視を開始
  useEffect(() => {
    const checkTime = setInterval(() => {
      if (isReset) {
        setIsMonitoring(false);
        setIsAlarmActive(false);
        return;
      }
      const now = new Date();
      const [hours, minutes] = targetTimeStr.split(":").map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);

      // 既に過ぎている場合は翌日に設定
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }
      const diffMin = (target.getTime() - now.getTime()) / (1000 * 60);
      // console.log(
      //   `現在時刻: ${now.toLocaleTimeString()}, 目標時刻: ${target.toLocaleTimeString()} -> 差分: ${diffMin.toFixed(2)}分`,
      // );
      if (diffMin <= 30 && diffMin > 0) {
        setIsMonitoring(true);
      }
    }, 1000);

    return () => clearInterval(checkTime);
  }, [targetTimeStr, isReset]);

  // 寝返り検知
  useEffect(() => {
    if (!isMonitoring) return;

    if (magnitude > 1.05 && !isAlarmActive) {
      setIsAlarmActive(true);
    }
  }, [magnitude, isAlarmActive, isMonitoring]);

  return {
    isMonitoring,
    isAlarmActive,
    setIsReset,
  };
};
