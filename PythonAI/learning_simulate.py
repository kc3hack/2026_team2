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

class LearningSimulate:
    def __init__(self):
        # 1. rawsounds内の全音源を取得
        self.sound_files = [os.path.basename(f) for f in glob.glob(os.path.join(RAW_SOUNDS_DIR, "*.wav"))]
        if not self.sound_files:
            self.sound_files = ["default.wav"]
        
        # 2. 各音源ごとに「正解」をランダムに固定
        self.targets = {}
        for f in self.sound_files:
            self.targets[f] = {
                "target_pitch": random.uniform(0.0, 8.0),
                "target_speed": random.uniform(1.0, 2.0),
                "min_wake_time": random.randint(5, 12)
            }
        
        # 学習管理
        self.current_sound_index = 0
        self.current_file = self.sound_files[self.current_sound_index]
        self.threshold = 0.5  # 誤差がこの値を下回ったら「学習完了」とみなす
        
        print("=== Learning Simulation Started ===")
        self._print_target()

    def _print_target(self):
        t = self.targets[self.current_file]
        print(f"\n[Target for {self.current_file}]")
        print(f" Pitch: {t['target_pitch']:.2f}, Speed: {t['target_speed']:.2f}")

    def calculate_wake_time(self, pitch, speed):
        target = self.targets[self.current_file]
        # 誤差（距離）の計算
        p_diff = abs(target["target_pitch"] - pitch)
        s_diff = abs(target["target_speed"] - speed)
        
        # 判定用スコア
        total_error = p_diff + (s_diff * 10) # 速度の差は影響が大きいため10倍
        
        # 学習完了判定
        is_finished = total_error < self.threshold
        
        # 起床時間の計算 (距離が近いほど短くなる)
        wake_time = int(target["min_wake_time"] + (total_error * 5) + random.randint(-1, 1))
        return max(target["min_wake_time"], wake_time), is_finished

    def run(self):
        p, s = 0.0, 1.0 # 初期値
        turn = 1
        
        os.makedirs(GO2PY_DIR, exist_ok=True)

        while True:
            # 起床時間と完了判定を取得
            wake_time, is_finished = self.calculate_wake_time(p, s)
            
            # 1. input.json 書き出し
            data = {
                "last-base-music": self.current_file.replace(".wav", ""),
                "last-pitch": p,
                "last-speed": s,
                "wake_up_time": wake_time
            }
            with open(INPUT_JSON, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            
            print(f"Turn {turn} | {self.current_file} | Time: {wake_time}s | Error: {abs(p-self.targets[self.current_file]['target_pitch']):.2f}")

            # 2. main_execが消すのを待つ
            while os.path.exists(INPUT_JSON):
                time.sleep(0.05)

            # 3. 次の音源への切り替え判定
            if is_finished:
                print(f"\n✨ 学習完了: {self.current_file} の最適値を見つけました。")
                self.current_sound_index = (self.current_sound_index + 1) % len(self.sound_files)
                self.current_file = self.sound_files[self.current_sound_index]
                self._print_target()
                # 切り替え時は少し待機（グラフで変化を見やすくするため）
                time.sleep(1.0)

            # 4. py2go/data から最新の設定を取得
            files = glob.glob(os.path.join(PY2GO_DATA_DIR, "*.json"))
            if files:
                latest_json = max(files, key=os.path.getmtime)
                with open(latest_json, 'r', encoding='utf-8') as f:
                    res = json.load(f)
                    p, s = res['pitch'], res['speed']
            
            turn += 1
            time.sleep(0.1)

if __name__ == "__main__":
    sim = LearningSimulate()
    sim.run()