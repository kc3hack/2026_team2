import { AlarmData, AlarmDataResponse } from "@/types/alarm";
import { saveMetadata, saveAudioFile } from "@/utils/fileCache";

/**
 * サーバーからアラームデータを取得し、キャッシュに保存する
 * @throws {Error} ネットワークエラーまたはファイルシステムエラー
 */
export async function fetchAndSaveAlarmData(): Promise<void> {
  try {
    // 環境変数からホスト名を取得（デフォルト: 192.168.0.21）
    const hostname =
      process.env.REACT_NATIVE_PACKAGER_HOSTNAME || "192.168.0.21";
    const url = `http://${hostname}:8080/get`;

    console.log(`Fetching alarm data from: ${url}`);

    // POSTリクエストを送信
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AlarmDataResponse = await response.json();

    // メタデータ（ベース音声ファイル名、ピッチ、スピード）をキャッシュに保存
    const metadata: AlarmData = {
      baseMusic: data["base-music"],
      pitch: data.pitch,
      speed: data.speed,
    };

    await saveMetadata(metadata);

    // Base64エンコードされた音声データをデコードして.wavファイルとして保存
    if (data.audio) {
      await saveAudioFile(data.audio);
    }

    console.log("Alarm data saved successfully");
  } catch (error) {
    console.error("Failed to fetch and save alarm data:", error);
    throw error;
  }
}
