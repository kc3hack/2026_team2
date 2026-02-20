import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

/**
 * 指定されたURIのファイルをシステムの共有ダイアログで開く
 * @param uri 共有するファイルのURI
 */
export async function shareFile(uri: string) {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert("共有エラー", "ご利用の端末では共有機能がサポートされていません。");
    }
  } catch (error) {
    console.error("ファイル共有エラー:", error);
    Alert.alert("エラー", "ファイルの保存には成功しましたが、共有画面の表示に失敗しました。");
  }
}