import { useContext, createContext } from "react";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

// 型定義
export type SerialPortState =
  | "connected"
  | "disconnected"
  | "error"
  | "unsupported";

interface SerialPortContextType {
  serialState: SerialPortState;
  trySendData: (data: string) => Promise<void>;
}

// ダミーコンテキスト（サポートされていない環境用）
const DummySerialPortContext = createContext<SerialPortContextType>({
  serialState: "unsupported",
  trySendData: async () => {
    console.warn("SerialPort is not supported on this platform/environment");
  },
});

// Android かつ非ExpoGo環境でのみ SerialPortContext をインポート
let SerialPortContext: React.Context<SerialPortContextType | null> =
  DummySerialPortContext as any;

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (Platform.OS === "android" && !isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const contextModule = require("../contexts/SerialPortContext");
    SerialPortContext = contextModule.SerialPortContext;
  } catch (error) {
    console.warn("Failed to load SerialPortContext:", error);
  }
}

/**
 * シリアルポートの状態とデータ送信機能にアクセスするためのカスタムフック
 *
 * このフックは SerialPortProvider 内で使用する必要があります。
 * アプリ全体で単一のシリアルポート接続を共有します。
 *
 * Android かつ非ExpoGo環境でのみ実際のシリアルポート機能を提供します。
 * それ以外の環境ではダミー実装を返します。
 *
 * @returns {Object} シリアルポートの状態と送信関数
 */
export const useSerialPort = (): SerialPortContextType => {
  const context = useContext(SerialPortContext);

  // Android かつ非ExpoGo環境の場合、コンテキストが必須
  if (Platform.OS === "android" && !isExpoGo) {
    if (!context) {
      throw new Error(
        "useSerialPort must be used within a SerialPortProvider. " +
          "Make sure to wrap your app with <SerialPortProvider>.",
      );
    }
    return context;
  }

  // それ以外の環境ではダミー実装を返す
  return (
    context || {
      serialState: "unsupported",
      trySendData: async () => {
        console.warn(
          "SerialPort is not supported on this platform/environment",
        );
      },
    }
  );
};
