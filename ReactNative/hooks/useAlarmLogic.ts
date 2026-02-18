import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useAccelerometer } from './useAccelerometer'; 

export const useAlarmLogic = (targetTimeStr: string) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [volume, setVolume] = useState(0.1); 
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const { magnitude } = useAccelerometer();

  // 1. 音源準備（ループ設定を徹底）
  useEffect(() => {
    async function setupAudio() {
      try {
        // 既存のサウンドがある場合はアンロード
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }

        const { sound } = await Audio.Sound.createAsync(
          require('../assets/alarm.mp3'),
          { 
            shouldPlay: false, 
            volume: 0.1,
            isLooping: true, // 基本のループ設定
          }
        );
        
        // OSレベルで確実にループさせるための命令
        await sound.setIsLoopingAsync(true); 
        soundRef.current = sound;
        console.log("✅ 音源準備完了（無限ループ設定済）");
      } catch (e) {
        console.log("❌ 音源読み込み失敗:", e);
      }
    }
    setupAudio();
    return () => { 
      soundRef.current?.unloadAsync(); 
    };
  }, []);

  // 2. 30分前判定タイマー（既存のまま）
  useEffect(() => {
    const checkTime = setInterval(() => {
      const now = new Date();
      const target = new Date(targetTimeStr); 
      const diffMin = (target.getTime() - now.getTime()) / (1000 * 60);
      if (diffMin <= 30 && diffMin > 0) {
        setIsMonitoring(true);
      }
    }, 60000); 
    return () => clearInterval(checkTime);
  }, [targetTimeStr]);

  // 3. 寝返り検知（一度検知したらフラグを立てて音量を上げ続ける）
  useEffect(() => {
    // 1.05を超えたら「アラーム作動状態」をONにする
    if (magnitude > 1.05 && !isAlarmActive) { 
      console.log("🚨 寝返り検知！爆音ループを開始します");
      setIsAlarmActive(true);
    }

    // アラームが作動中なら、揺れるたびに音量を上げる処理を呼ぶ
    if (isAlarmActive) {
      startAndIncreaseVolume();
    }
  }, [magnitude, isAlarmActive]);


  // 4. 音量アップ ＆ 連続再生関数
  const startAndIncreaseVolume = async () => {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      
      if (status.isLoaded) {
        // 再生されていなければ再生
        if (!status.isPlaying) {
          await soundRef.current.playAsync();
        }

        // 音量を0.1ずつアップ（最大1.0）
        setVolume(prev => {
          const nextVolume = Math.min(prev + 0.1, 1.0); 
          soundRef.current?.setVolumeAsync(nextVolume);
          return nextVolume;
        });
      }
    } catch (error) {
      console.log("再生エラー:", error);
    }
  };

  return { isMonitoring, volume, magnitude, isAlarmActive };
};