import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';

export const useAudioLevel = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    async function startRecording() {
      try {
        // 1. マイクの許可をもらう
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') return;

        // 2. 録音の設定（計測を有効にする）
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
          (status) => {
            // 3. ここで音量（metering）を取得
            if (status.metering !== undefined) {
              // meteringは -160(静) 〜 0(爆音) で返ってくる
              // 扱いやすいように 0〜100 に変換
              const normalizedVolume = Math.max(0, (status.metering + 160) / 1.6);
              setVolume(normalizedVolume);
            }
          },
          100 // 0.1秒ごとに更新
        );

        setRecording(recording);
      } catch (err) {
        console.error('Failed to start recording', err);
      }
    }

    startRecording();

    // クリーンアップ（画面を離れたらマイクを止める）
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  return volume;
};