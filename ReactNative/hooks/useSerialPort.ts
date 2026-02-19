import { useContext } from "react";
import { SerialPortContext } from "../contexts/SerialPortContext";

/**
 * シリアルポートの状態とデータ送信機能にアクセスするためのカスタムフック
 *
 * このフックは SerialPortProvider 内で使用する必要があります。
 * アプリ全体で単一のシリアルポート接続を共有します。
 *
 * @throws {Error} SerialPortProvider の外で使用された場合
 * @returns {Object} シリアルポートの状態と送信関数
 */
export const useSerialPort = () => {
  const context = useContext(SerialPortContext);

  if (!context) {
    throw new Error(
      "useSerialPort must be used within a SerialPortProvider. " +
        "Make sure to wrap your app with <SerialPortProvider>.",
    );
  }

  return context;
};

// 型のエクスポート（後方互換性のため）
export type { SerialPortState } from "../contexts/SerialPortContext";
