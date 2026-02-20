import { useContext } from "react";
import { AlarmAudioContext } from "@/contexts/AlarmAudioContext";

/**
 * AlarmAudioContextを使用するためのカスタムフック
 * @throws {Error} AlarmAudioProvider外で使用された場合
 */
export function useAlarmAudio() {
  const context = useContext(AlarmAudioContext);

  if (!context) {
    throw new Error("useAlarmAudio must be used within AlarmAudioProvider");
  }

  return context;
}
