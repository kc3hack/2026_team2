import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  UsbSerialManager,
  UsbSerial,
  Parity,
} from "react-native-usb-serialport-for-android";

export type SerialPortState =
  | "connected"
  | "disconnected"
  | "error"
  | "unsupported";

interface SerialPortContextType {
  serialState: SerialPortState;
  trySendData: (data: string) => Promise<void>;
}

export const SerialPortContext = createContext<SerialPortContextType | null>(
  null,
);

export const SerialPortProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const [serialState, setSerialState] =
    useState<SerialPortState>("disconnected");
  const isInitializingRef = useRef(false);
  const usbSerialRef = useRef<UsbSerial | null>(null);

  // シリアルポートの初期化
  const initSerialPort = useCallback(async (): Promise<UsbSerial | null> => {
    if (isInitializingRef.current || deviceList.length === 0) {
      return null;
    }

    try {
      isInitializingRef.current = true;

      // 既存の接続をクローズ
      if (usbSerialRef.current) {
        try {
          await usbSerialRef.current.close();
        } catch (e) {
          console.warn("Failed to close existing connection:", e);
        }
        usbSerialRef.current = null;
      }

      // 最初のデバイスに対してパーミッションをリクエスト
      const granted = await UsbSerialManager.tryRequestPermission(
        deviceList[0].deviceId,
      );

      if (!granted) {
        setSerialState("disconnected");
        return null;
      }

      // シリアルポートを開く
      const usbSerialport = await UsbSerialManager.open(
        deviceList[0].deviceId,
        {
          baudRate: 9600,
          parity: Parity.None,
          dataBits: 8,
          stopBits: 1,
        },
      );

      usbSerialRef.current = usbSerialport;
      setSerialState("connected");
      console.log("Serial port connected successfully");
      return usbSerialport;
    } catch (err) {
      console.warn("Failed to initialize serial port:", err);
      setSerialState("error");
      return null;
    } finally {
      isInitializingRef.current = false;
    }
  }, [deviceList]);

  // データ送信（内部用）
  const sendData = useCallback(
    async (data: string) => {
      const serial = usbSerialRef.current;

      // 初期化中または接続されていない場合は送信しない
      if (isInitializingRef.current || !serial || serialState !== "connected") {
        return;
      }

      try {
        await serial.send(data);
      } catch (e) {
        console.warn("Failed to send data:", e);
        setSerialState("error");
      }
    },
    [serialState],
  );

  // 外部から呼び出すデータ送信関数（必要に応じて再接続を試みる）
  const trySendData = useCallback(
    async (data: string) => {
      let serial = usbSerialRef.current;

      // 接続されていない場合は初期化を試みる
      if (!serial || serialState !== "connected") {
        serial = await initSerialPort();
      }

      // データ送信
      if (serial) {
        try {
          await serial.send(data);
          console.log("Data sent successfully:", data);
        } catch (e) {
          console.warn("Failed to send data:", e);
          setSerialState("error");
        }
      } else {
        console.warn("Cannot send data: serial port not available");
      }
    },
    [serialState, initSerialPort],
  );

  // デバイスリストを定期的に取得（3秒おき）
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const devices = await UsbSerialManager.list();
        setDeviceList(devices);
      } catch (err) {
        console.warn("Failed to list USB devices:", err);
        setDeviceList([]);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // デバイスリストが更新されたら自動的に初期化（エラー状態からも回復）
  useEffect(() => {
    if (deviceList.length > 0 && serialState !== "connected") {
      // disconnected または error 状態の場合、再初期化を試みる
      initSerialPort();
    } else if (deviceList.length === 0 && serialState !== "disconnected") {
      // デバイスが見つからない場合は切断状態にする
      setSerialState("disconnected");
    }
  }, [deviceList, serialState, initSerialPort]);

  // 1秒おきに0x30を送信
  useEffect(() => {
    const interval = setInterval(() => {
      sendData("0x30");
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [sendData]);

  const value: SerialPortContextType = {
    serialState,
    trySendData,
  };

  return (
    <SerialPortContext.Provider value={value}>
      {children}
    </SerialPortContext.Provider>
  );
};
