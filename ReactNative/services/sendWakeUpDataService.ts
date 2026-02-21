export async function sendWakeUpData(
    targetTime: string, 
    audioUri: string | null, 
    diffSeconds: number // 追加
): Promise<void> {
    try {
        const hostname = process.env.REACT_NATIVE_PACKAGER_HOSTNAME || "192.168.0.21";
        const url = `http://${hostname}:8080/wakeup`;

        const formData = new FormData();
        formData.append("targetTime", targetTime);
        formData.append("wakeUpTime", new Date().toISOString());
        formData.append("diffSeconds", diffSeconds.toString()); // 差分を送信

        if (audioUri) {
        formData.append("audio", {
            uri: audioUri,
            name: "recorded_audio.wav",
            type: "audio/wav",
        } as any);
        }

        const response = await fetch(url, {
        method: "POST",
        body: formData,
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
        console.error("Failed to send wakeup data:", error);
        throw error;
    }
}