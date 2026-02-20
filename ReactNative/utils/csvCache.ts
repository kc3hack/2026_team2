import { File, Paths } from "expo-file-system";

/**
 * CSV文字列をキャッシュディレクトリに保存する
 * @param csvContent 保存するCSV形式の文字列
 * @param prefix ファイル名の先頭につける文字
 * @returns 保存に成功した場合はファイルのURI、失敗した場合はnull
 */
export async function saveCsvToCache(
  csvContent: string,
  prefix: string = "sleep_data"
): Promise<string | null> {
  try {
    const fileName = `${prefix}_${Date.now()}.csv`;
    
    // Paths.cache を使ってキャッシュディレクトリ内のファイルオブジェクトを作成
    const csvFile = new File(Paths.cache, fileName);

    // ファイルを作成（上書き許可）して書き込む
    await csvFile.create({ overwrite: true });
    await csvFile.write(csvContent);

    console.log("CSV Cached to:", csvFile.uri);
    return csvFile.uri;
  } catch (error) {
    console.error("CSVキャッシュ保存失敗:", error);
    return null;
  }
}

/**
 * キャッシュ（指定されたURI）からCSVを読み込む
 * @param fileUri 読み込むファイルのURI
 * @returns 成功した場合はファイルの中身（テキスト）、失敗した場合はnull
 */
export async function loadCsvFromCache(fileUri: string): Promise<string | null> {
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
  }
}