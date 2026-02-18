import { useState, useCallback } from "react";
import { File, Paths } from "expo-file-system";

/**
 * CSVファイルのキャッシュ保存・読み込みを管理するカスタムフック
 */
export function useCsvCache() {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastCachedUri, setLastCachedUri] = useState<string | null>(null);

  /**
   * CSV文字列をキャッシュに保存する
   */
  const saveToCache = useCallback(async (csvContent: string, prefix: string = "sleep_data"): Promise<string | null> => {
    if (isProcessing) return null;
    setIsProcessing(true);

    try {
      const fileName = `${prefix}_${Date.now()}.csv`;
      
      // Paths.cache を使ってキャッシュディレクトリ内のファイルオブジェクトを作成
      const csvFile = new File(Paths.cache, fileName);

      // ファイルを作成（上書き許可）して書き込む
      await csvFile.create({ overwrite: true });
      await csvFile.write(csvContent);

      console.log("CSV Cached to:", csvFile.uri);
      setLastCachedUri(csvFile.uri);
      return csvFile.uri;
    } catch (error) {
      console.error("CSVキャッシュ保存失敗:", error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  /**
   * キャッシュからCSVを読み込む
   */
  const loadFromCache = useCallback(async (fileUri: string): Promise<string | null> => {
    setIsProcessing(true);
    try {
      // 既存のURIからファイルオブジェクトを作成
      const file = new File(fileUri);

      // 存在チェック
      if (!file.exists) {
        console.log("ファイルが存在しません:", fileUri);
        return null;
      }

      // 中身をテキストとして取得
      return await file.text();
    } catch (error) {
      console.error("CSVキャッシュ読み込み失敗:", error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    lastCachedUri,
    saveToCache,
    loadFromCache,
  };
}