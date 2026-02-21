export async function sendWakeUpData(
    targetTime: string, 
    audioUri: string | null, 
    diffSeconds: number,
    currentMusic: string, // 追加
    currentPitch: number, // 追加
    currentSpeed: number  // 追加
) {
    try {
        const hostname = "192.168.10.120";
        const url = `http://${hostname}:8080/alarm/wakeUp`;

        const formData = new FormData();
        
        // Goサーバーの c.FormValue("key") と一致させる
        formData.append('last-base-music', currentMusic);
        formData.append('last-pitch', currentPitch.toString());
        formData.append('last-speed', currentSpeed.toString());
        formData.append('diffSeconds', diffSeconds.toString()); // 引数名に合わせる

        if (audioUri) {
            console.log("🎙 音声ファイルを添付します:", audioUri);
            
            const fileData = {
                uri: audioUri,
                name: "wakeup_audio.wav",
                type: "audio/wav",
            };

            // @ts-ignore
            formData.append("audio", fileData);
        }

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