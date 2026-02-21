import os
import json
import time
import random
import glob

# パス設定
GO2PY_DIR = "shared/go2py"
PY2GO_DATA_DIR = "shared/py2go/data"
RAW_SOUNDS_DIR = "raw_sounds"
INPUT_JSON = os.path.join(GO2PY_DIR, "input.json")

class WakeUpSimulator:
    def __init__(self):
        # 1. rawsounds内の全音源を取得
        self.sound_files = [os.path.basename(f) for f in glob.glob(os.path.join(RAW_SOUNDS_DIR, "*.wav"))]
        if not self.sound_files:
            # 音源がない場合のフォールバック
            self.sound_files = ["default.wav"]
            print(f"Warning: No wav files found in {RAW_SOUNDS_DIR}. Using default.wav")

        # 2. 各音源ごとに「正解」のパラメータをランダムに設定
        # これが学習の「目標地点」になる
        self.targets = {}
        for f in self.sound_files:
            self.targets[f] = {
                "target_pitch": random.uniform(0.0, 8.0),   # 0~8のどこかが正解
                "target_speed": random.uniform(1.0, 2.0),   # 1~2のどこかが正解
                "min_wake_time": random.randint(5, 15)      # その音源での最速起床時間(5~15秒)
            }
        
        print("=== Simulation Target Settings (Hidden from Learner) ===")
        for f, target in self.targets.items():
            print(f"Sound: {f} | Target Pitch: {target['target_pitch']:.2f}, Speed: {target['target_speed']:.2f}")

    def calculate_wake_time(self, current_file, pitch, speed):
        """現在の設定と正解の距離から起床時間を算出する"""
        target = self.targets.get(current_file)
        if not target:
            # 知らない音源が来たら適当に返す
            return random.randint(30, 60)

        # 正解との「距離」を計算
        pitch_diff = abs(target["target_pitch"] - pitch)
        speed_diff = abs(target["target_speed"] - speed)
        
        # 距離が近いほど起床時間が短くなる計算式
        # ピッチの差(最大8)と速度の差(最大1.0)を考慮
        distance = (pitch_diff * 5.0) + (speed_diff * 40.0)
        
        # 最短時間 + 距離による遅延 + ランダムなゆらぎ
        wake_time = int(target["min_wake_time"] + distance + random.randint(-2, 2))
        
        # 最短時間を下回らないように調整
        return max(target["min_wake_time"], wake_time)

    def run_lifecycle(self, turn, last_pitch, last_speed, current_file):
        os.makedirs(GO2PY_DIR, exist_ok=True)

        # 起床時間をシミュレート
        wake_up_time = self.calculate_wake_time(current_file, last_pitch, last_speed)

        # 1. input.json を書き出す (拡張子は除いて送るのがこれまでの仕様)
        data = {
            "last-base-music": current_file.replace(".wav", ""),
            "last-pitch": last_pitch,
            "last-speed": last_speed,
            "wake_up_time": wake_up_time
        }
        
        with open(INPUT_JSON, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        
        print(f"\n[Turn {turn}] Simulating: {current_file}")
        print(f"  Result -> Wake-up Time: {wake_up_time}s (Set Pitch: {last_pitch:.2f}, Speed: {last_speed:.2f})")

        # 2. Python(main_exec)がファイルを消すまで待つ
        while os.path.exists(INPUT_JSON):
            time.sleep(0.1)

        # 3. 生成された最新のJSONから次のパラメータを取得
        # shared/py2go/data/ から最新ファイルを取得
        files = glob.glob(os.path.join(PY2GO_DATA_DIR, "*.json"))
        if not files:
            return last_pitch, last_speed, current_file # ファイルがなければ現状維持
            
        latest_json = max(files, key=os.path.getmtime)
        with open(latest_json, 'r', encoding='utf-8') as f:
            res = json.load(f)
            # base-musicに拡張子をつけて戻す
            next_f = res['base-music'] + ".wav"
            return res['pitch'], res['speed'], next_f

if __name__ == "__main__":
    simulator = WakeUpSimulator()
    
    # 初期値
    p, s = 0.0, 1.0
    current_f = simulator.sound_files[0]
    
    print("\nStarting simulation loop...")
    for i in range(1, 101): # 100回試行
        p, s, current_f = simulator.run_lifecycle(i, p, s, current_f)
        time.sleep(0.1) # 描画を見やすくするための微小な待機