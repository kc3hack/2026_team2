import { File, Paths } from "expo-file-system";
import { AlarmData } from "@/types/alarm";

/**
 * キャッシュディレクトリとファイル名の定義
 */
const METADATA_FILENAME = "alarm-metadata.json";
const AUDIO_FILENAME = "alarm-audio.wav";

/**
 * メタデータ（ベース音声ファイル名、ピッチ、スピード）をキャッシュに保存
 * @param metadata - 保存するメタデータ
 */
export async function saveMetadata(metadata: AlarmData): Promise<void> {
  try {
    const metadataFile = new File(Paths.cache, METADATA_FILENAME);
    await metadataFile.create({ overwrite: true });
    await metadataFile.write(JSON.stringify(metadata));
    console.log("Metadata saved:", metadata);
  } catch (error) {
    console.error("Failed to save metadata:", error);
    throw error;
  }
}

/**
 * キャッシュからメタデータを取得
 * @returns メタデータ、または存在しない場合はnull
 */
export async function getMetadata(): Promise<AlarmData | null> {
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
    console.error("Failed to get metadata:", error);
    return null;
  }
}

/**
 * Base64エンコードされた音声データをデコードして.wavファイルとして保存
 * @param base64Audio - Base64エンコードされた音声データ
 */
export async function saveAudioFile(base64Audio: string): Promise<void> {
  try {
    const audioFile = new File(Paths.cache, AUDIO_FILENAME);

    // Base64データをデコード
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // ファイルを作成して書き込む
    await audioFile.create({ overwrite: true });
    await audioFile.write(bytes);

    console.log("Audio file saved to:", audioFile.uri);
  } catch (error) {
    console.error("Failed to save audio file:", error);
    throw error;
  }
}

/**
 * キャッシュに保存された音声ファイルのURIを取得
 * @returns 音声ファイルのURI、または存在しない場合はnull
 */
export async function getAudioFileUri(): Promise<string | null> {
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
