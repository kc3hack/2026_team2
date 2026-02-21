import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Audio } from "expo-av";
import { getAudioFileUri } from "@/utils/fileCache";

/**
 * AlarmAudioContextの型定義
 */
type AlarmAudioContextType = {
  /** 現在の音量 (0-100) */
  volume: number;
  /** 音量を設定する関数 */
  setVolume: (volume: number) => void;
  /** 音声をロードする関数 */
  loadAudio: () => Promise<void>;
  /** 音声を再生する関数 */
  play: () => Promise<void>;
  /** 音声を停止する関数 */
  stop: () => Promise<void>;
  /** 音声が準備できているかどうか */
  isReady: boolean;
  /** 音声が再生中かどうか */
  isPlaying: boolean;
  /** キャッシュされた音声を使用しているかどうか */
  isUsingCachedAudio: boolean;
  /** 現在ロードされている音声のURI */
  audioUri: string | null; // ← 追加
};

/**
 * AlarmAudioContext
 */
export const AlarmAudioContext = createContext<AlarmAudioContextType | null>(
  null,
);

/**
 * AlarmAudioProvider
 * アプリ全体で音声再生の状態を管理する
 */
export const AlarmAudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [volume, setVolumeState] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isUsingCachedAudio, setIsUsingCachedAudio] = useState<boolean>(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  /**
   * 音声をロードする関数
   */
  const loadAudio = useCallback(async () => {
    // 既に読み込み中の場合はスキップ
    if (isLoadingRef.current) {
      console.log("Sound loading already in progress");
      return;
    }

    isLoadingRef.current = true;

    try {
      // 音声ファイルのURIを取得
      const cachedUri = await getAudioFileUri();

      //AudioUriをset
      setAudioUri(cachedUri);

      // デフォルトの音声ファイル（require形式）
      const defaultAudio = require("@/assets/music/default.wav");

      // キャッシュされたファイルがあればそれを使用、なければデフォルト
      const audioSource = cachedUri ? { uri: cachedUri } : defaultAudio;
      const usingCache = !!cachedUri;

      console.log("Loading sound from:", cachedUri || "default.wav");

      // 既存のサウンドがあればアンロード
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsReady(false);
        setIsPlaying(false);
      }

      // サウンドオブジェクトを作成（初期状態は停止、音量0）
      const { sound } = await Audio.Sound.createAsync(audioSource, {
        shouldPlay: false,
        isLooping: true,
        volume: 0,
      });

      // OSレベルで確実にループさせる
      await sound.setIsLoopingAsync(true);

      soundRef.current = sound;
      setIsReady(true);
      setIsUsingCachedAudio(usingCache);
      console.log("Sound loaded successfully");
    } catch (error) {
      console.error("Failed to load sound:", error);
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  /**
   * 音声を再生する関数
   */
  const play = useCallback(async () => {
    if (!soundRef.current || !isReady) {
      console.log("Sound not ready for playback");
      return;
    }

    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        console.log("Starting playback");
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Failed to play sound:", error);
    }
  }, [isReady]);

  /**
   * 音声を停止する関数
   */
  const stop = useCallback(async () => {
    if (!soundRef.current) {
      return;
    }

    try {
      console.log("Stopping playback");
      await soundRef.current.stopAsync();
      setIsPlaying(false);
    } catch (error) {
      console.error("Failed to stop sound:", error);
    }
  }, []);

  /**
   * 音量を設定する関数
   */
  const setVolume = useCallback((newVolume: number) => {
    // 音量を0-100の範囲にクランプ
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    setVolumeState(clampedVolume);
  }, []);

  /**
   * 音量変更時の処理
   */
  useEffect(() => {
    const handleVolumeChange = async () => {
      // サウンドが準備できていない場合
      if (!soundRef.current || !isReady) {
        return;
      }

      try {
        if (volume === 0) {
          // 音量が0の場合は再生を停止
          await stop();
        } else {
          // 音量を設定（0-100を0.0-1.0に変換）
          const normalizedVolume = volume / 100;
          console.log(`Setting volume to: ${normalizedVolume} (${volume}%)`);
          await soundRef.current.setVolumeAsync(normalizedVolume);

          // 停止中の場合は再生を開始
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded && !status.isPlaying) {
            await play();
          }
        }
      } catch (error) {
        console.error("Failed to change volume:", error);
      }
    };

    handleVolumeChange();
  }, [volume, isReady, play, stop]);

  /**
   * 初期化時にサウンドをロード
   */
  useEffect(() => {
    loadAudio();

    // クリーンアップ: コンポーネントのアンマウント時にサウンドをアンロード
    return () => {
      if (soundRef.current) {
        console.log("Unloading sound");
        soundRef.current.unloadAsync();
      }
    };
  }, [loadAudio]);

  const value: AlarmAudioContextType = {
    volume,
    setVolume,
    loadAudio,
    play,
    stop,
    isReady,
    isPlaying,
    isUsingCachedAudio,
    audioUri,
  };

  return (
    <AlarmAudioContext.Provider value={value}>
      {children}
    </AlarmAudioContext.Provider>
  );
};
