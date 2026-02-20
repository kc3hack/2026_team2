 import { analyzeFullNightSleep } from './sleepAnalysis';
import { saveCsvToCache } from './csvCache';

/**
 * 睡眠データを解析し、CSV文字列に変換してキャッシュに保存する
 * @param rawLogs フックから取得した生の睡眠データ
 * @returns 成功した場合はファイルのURI、失敗した場合は null
 */
export async function processAndCacheSleepData(rawLogs: any[]): Promise<string | null> {
  try {
    // 1. 睡眠データをスコアに変換
    const analyzedData = analyzeFullNightSleep(rawLogs);

    // 2. 必要なデータ（時間とスコア）だけを抽出して配列にする
    const finalLogs = rawLogs.map((raw, index) => ({
      timestamp: raw.timestamp,
      score: analyzedData[index].score
    }));

    // 3. CSV形式の「文字列」を組み立てる
    let csvString = 'timestamp,score\n';
    finalLogs.forEach(log => {
      csvString += `${log.timestamp},${log.score}\n`;
    });

    // 4. CSVCashe.ts を使ってキャッシュに保存！
    const savedUri = await saveCsvToCache(csvString, "sleep_data");

    return savedUri;

  } catch (error) {
    console.error("データの解析・保存中にエラーが発生しました:", error);
    return null;
  }
}