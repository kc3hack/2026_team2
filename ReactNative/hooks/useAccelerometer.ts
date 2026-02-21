import { useState, useEffect } from "react";
import { Accelerometer } from "expo-sensors";

export const useAccelerometer = () => {
  const [magnitude, setMagnitude] = useState(0);

  useEffect(() => {
    // センサーの更新頻度を設定（100ms = 0.1秒）
    Accelerometer.setUpdateInterval(100);

    // センサーの監視を開始
    const subscription = Accelerometer.addListener((accelerometerData) => {
      // 3軸の合成加速度を計算（静止状態で約 1.0 になる）
      const m = Math.sqrt(
        accelerometerData.x ** 2 +
          accelerometerData.y ** 2 +
          accelerometerData.z ** 2,
      );
      setMagnitude(m);
    });

    // クリーンアップ関数（画面を離れたら止める）
    return () => {
      subscription && subscription.remove();
    };
  }, []);

  // オブジェクトじゃなくて、直接数値を返す
  return magnitude;
};
