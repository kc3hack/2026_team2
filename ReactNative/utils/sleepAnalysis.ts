export type AnalyzedSleepData = {
  timestamp: string;
  score: number;
};

// --- ガウシアンカーネル（重み配列）を生成する関数 ---
// radius: 前後何行分を見るか（10なら前後10行＝計21行）
// sigma: 標準偏差（波の滑らかさを決める。radiusの半分程度が目安）
function getGaussianKernel(radius: number, sigma: number): number[] {
  const kernel: number[] = [];
  let sum = 0;
  for (let i = -radius; i <= radius; i++) {
    const val = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(val);
    sum += val;
  }
  // 全体の重み合計が1になるように正規化
  return kernel.map(w => w / sum);
}

export function analyzeFullNightSleep(logs: any[]): AnalyzedSleepData[] {
  if (logs.length === 0) return [];

  // --- 1. 加速度の独立採点 (0〜100点) ---
  const accelValues = logs.map(l => Math.abs(l.accelMax - 1.0));
  const accelMin = Math.min(...accelValues);
  const sortedAccel = [...accelValues].sort((a, b) => a - b);
  // 上位1%の異常値（スマホ落下など）をカット
  const accelMax = sortedAccel[Math.floor(sortedAccel.length * 0.99)] || Math.max(...accelValues);
  const accelRange = (accelMax - accelMin) || 1;

  // --- 2. 音量の独立採点 (0〜100点) と ノイズゲート ---
  const roomAudioBaseline = Math.min(...logs.map(l => l.audioMax));
  const NOISE_THRESHOLD = roomAudioBaseline + 2;

  const audioValues = logs.map(l => {
    return l.audioMax > NOISE_THRESHOLD ? l.audioMax : 0;
  });
  
  const audioMin = Math.min(...audioValues);
  const sortedAudio = [...audioValues].sort((a, b) => a - b);
  // 上位1%の異常値（救急車など）をカット
  const audioMax = sortedAudio[Math.floor(sortedAudio.length * 0.99)] || Math.max(...audioValues);
  const audioRange = (audioMax - audioMin) || 1;

  // --- 3. それぞれを正規化して、8:2 でブレンドする ---
  const combinedRaws = logs.map((log, i) => {
    let aScore = ((accelValues[i] - accelMin) / accelRange) * 100;
    aScore = Math.max(0, Math.min(100, aScore));

    let audScore = ((audioValues[i] - audioMin) / audioRange) * 100;
    audScore = Math.max(0, Math.min(100, audScore));

    return (aScore * 0.8) + (audScore * 0.2);
  });

  // --- 4. ガウシアンスムージングによる超平滑化 ---
  const RADIUS = 10;  // 前後10分（計21分）
  const SIGMA = 5.0;  // なめらかさの度合い
  const kernel = getGaussianKernel(RADIUS, SIGMA);

  const smoothedRaws = combinedRaws.map((_, idx, arr) => {
    let weightedSum = 0;
    let weightTotal = 0;

    for (let i = -RADIUS; i <= RADIUS; i++) {
      const dataIdx = idx + i;
      // 配列の範囲内に収まるデータのみを対象にする（開始直後や終了直前の端っこ処理）
      if (dataIdx >= 0 && dataIdx < arr.length) {
        const weight = kernel[i + RADIUS];
        weightedSum += arr[dataIdx] * weight;
        weightTotal += weight;
      }
    }
    // 端の方で weightTotal が1未満になった場合の補正
    return weightedSum / weightTotal;
  });

  // --- 5. 最終仕上げ（全体の波を0〜100にフィットさせる） ---
  const IGNORE_ROWS = 30; // 入眠時（最初の30分）は最大値の基準から除外
  const validForMax = smoothedRaws.slice(IGNORE_ROWS);
  const minFinal = Math.min(...smoothedRaws);
  
  let maxFinal = minFinal + 1;
  if (validForMax.length > 0) {
    const sorted = [...validForMax].sort((a, b) => a - b);
    // 最終スコアでも上位1%の異常値をカット
    maxFinal = sorted[Math.floor(sorted.length * 0.99)];
  } else {
    maxFinal = Math.max(...smoothedRaws);
  }
  const finalRange = (maxFinal - minFinal) || 1;

  return logs.map((log, index) => {
    let normalized = ((smoothedRaws[index] - minFinal) / finalRange) * 100;
    normalized = Math.max(0, Math.min(100, normalized));

    return {
      timestamp: log.timestamp,
      score: Math.round(normalized * 10) / 10, 
    };
  });
}