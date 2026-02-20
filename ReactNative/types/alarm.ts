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
export type AlarmDataResponse = {
  "base-music": string;
  pitch: number;
  speed: number;
  audio?: string; // Base64エンコードされた音声データ
};
