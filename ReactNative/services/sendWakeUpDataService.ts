import { getAudioFileUri, getMetadata } from "@/utils/fileCache";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export async function sendWakeUpData(diffSeconds: number) {
  try {
    const hostname =
      process.env.REACT_NATIVE_PACKAGER_HOSTNAME || "192.168.0.21";
    const url = `http://${hostname}:8080/alarm/wakeUp`;

    const formData = new FormData();

    const metadata = await getMetadata();

    if (!metadata) {
      console.warn("⚠️ メタデータが見つかりません。");
      return;
    }

    // Goサーバーの c.FormValue("key") と一致させる
    formData.append("last-base-music", metadata.baseMusic.toString());
    formData.append("last-pitch", metadata.pitch.toString());
    formData.append("last-speed", metadata.speed.toString());
    formData.append("diffSeconds", diffSeconds.toString()); // 引数名に合わせる

    console.log("📡 起床データを送信開始...");
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      // Headersは空でOK (fetchが自動生成します)
    });

    if (response.ok) {
      console.log("--- 送信成功！ ---");
      const result = await response.json();
      console.log("サーバー応答:", result);
    } else {
      console.error("--- 送信失敗 --- ステータス:", response.status);
    }
  } catch (error) {
    console.error("❌ 送信中にエラーが発生しました:", error);
  }
}
