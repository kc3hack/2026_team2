import { File, Paths } from "expo-file-system";

/**
 * キャッシュディレクトリとファイル名の定義
 */
const METADATA_FILENAME = "alarm-metadata.json";
const AUDIO_FILENAME = "alarm-audio.wav";

/**
 * アラームデータの型定義
 */
export type AlarmData = {
  baseMusic: string;
  pitch: number;
  speed: number;
};

/**
 * APIレスポンスの型定義
 */
type AlarmDataResponse = {
  "base-music": string;
  pitch: number;
  speed: number;
  audio?: string; // Base64エンコードされた音声データ
};

/**
 * サーバーからアラームデータを取得し、キャッシュに保存する
 * @throws {Error} ネットワークエラーまたはファイルシステムエラー
 */
export async function setData(): Promise<void> {
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

    // メタデータファイルを作成して保存
    const metadataFile = new File(Paths.cache, METADATA_FILENAME);
    await metadataFile.create({ overwrite: true });
    await metadataFile.write(JSON.stringify(metadata));

    console.log("Metadata saved:", metadata);

    // Base64エンコードされた音声データをデコードして.wavファイルとして保存
    if (data.audio) {
      const audioFile = new File(Paths.cache, AUDIO_FILENAME);

      // Base64データをデコード
      const binaryString = atob(data.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // ファイルを作成して書き込む
      await audioFile.create({ overwrite: true });
      await audioFile.write(bytes);

      console.log("Audio file saved to:", audioFile.uri);
    }

    console.log("Alarm data saved successfully");
  } catch (error) {
    console.error("Failed to set alarm data:", error);
    throw error;
  }
}

/**
 * キャッシュからアラームデータ（メタデータ）を取得する
 * @returns {Promise<AlarmData | null>} アラームデータ、または存在しない場合はnull
 */
export async function getData(): Promise<AlarmData | null> {
  try {
    const metadataFile = new File(Paths.cache, METADATA_FILENAME);

    if (!metadataFile.exists) {
      console.log("Metadata file does not exist");
      return null;
    }

    const content = await metadataFile.text();
    const data = JSON.parse(content) as AlarmData;
    console.log("Metadata loaded:", data);

    return data;
  } catch (error) {
    console.error("Failed to get alarm data:", error);
    return null;
  }
}

/**
 * キャッシュに保存された音声ファイルのURIを取得する
 * @returns {Promise<string | null>} 音声ファイルのURI、または存在しない場合はnull
 */
export async function getMusicUri(): Promise<string | null> {
  try {
    const audioFile = new File(Paths.cache, AUDIO_FILENAME);

    if (!audioFile.exists) {
      console.log("Audio file does not exist");
      return null;
    }

    console.log("Music URI:", audioFile.uri);
    return audioFile.uri;
  } catch (error) {
    console.error("Failed to get music URI:", error);
    return null;
  }
}
