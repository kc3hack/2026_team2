import { useState, useEffect, useRef } from "react";
import { Audio } from "expo-av";
import { getMusicUri } from "@/utils/alarm";

/**
 * アラーム音声の再生を管理するカスタムフック
 * 音量を0-100の範囲で設定でき、音量が0の場合は再生を停止し、0以外の場合はループ再生します
 * @returns {Object} setVolume - 音量を設定する関数
 */
export function useAlarm() {
  const [volume, setVolume] = useState<number>(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const isLoadingRef = useRef<boolean>(false);

  // サウンドをロードする関数
  const loadSound = async () => {
    // 既に読み込み中の場合はスキップ
    if (isLoadingRef.current) {
      console.log("Sound loading already in progress");
      return;
    }

    isLoadingRef.current = true;

    try {
      // 音声ファイルのURIを取得
      const uri = await getMusicUri();
      if (!uri) {
        console.log("No music file available yet");
        isLoadingRef.current = false;
        return;
      }

      console.log("Loading sound from:", uri);

      // 既存のサウンドがあればアンロード
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsReady(false);
      }

      // サウンドオブジェクトを作成（初期状態は停止、音量0）
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: false,
          isLooping: true,
          volume: 0,
        },
      );

      soundRef.current = sound;
      setIsReady(true);
      console.log("Sound loaded successfully");
    } catch (error) {
      console.error("Failed to load sound:", error);
    } finally {
      isLoadingRef.current = false;
    }
  };

  // 初期化時にサウンドをロード
  useEffect(() => {
    loadSound();

    // クリーンアップ: コンポーネントのアンマウント時にサウンドをアンロード
    return () => {
      if (soundRef.current) {
        console.log("Unloading sound");
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // 音量変更時の処理
  useEffect(() => {
    const handleVolumeChange = async () => {
      // サウンドが準備できていない場合は再度読み込みを試みる
      if (!soundRef.current || !isReady) {
        if (volume > 0) {
          console.log("Sound not ready, attempting to load...");
          await loadSound();
        }
        return;
      }

      try {
        if (volume === 0) {
          // 音量が0の場合は再生を停止
          console.log("Stopping playback (volume = 0)");
          await soundRef.current.stopAsync();
        } else {
          // 音量を設定（0-100を0.0-1.0に変換）
          const normalizedVolume = volume / 100;
          console.log(`Setting volume to: ${normalizedVolume} (${volume}%)`);
          await soundRef.current.setVolumeAsync(normalizedVolume);

          // 再生状態を確認
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded && !status.isPlaying) {
            // 停止中の場合は再生を開始
            console.log("Starting playback");
            await soundRef.current.playAsync();
          }
        }
      } catch (error) {
        console.error("Failed to change volume:", error);
      }
    };

    handleVolumeChange();
  }, [volume, isReady]);

  return {
    /**
     * 音量を設定する関数
     * @param {number} newVolume - 0-100の範囲の音量値
     */
    setVolume: (newVolume: number) => {
      // 音量を0-100の範囲にクランプ
      const clampedVolume = Math.max(0, Math.min(100, newVolume));
      setVolume(clampedVolume);
    },
  };
}
