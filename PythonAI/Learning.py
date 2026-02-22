import os
import random
import json

# 設定
SOUNDS_DIR = "raw_sounds/"

class AlarmGA:
    def __init__(self):
        if not os.path.exists(SOUNDS_DIR):
            os.makedirs(SOUNDS_DIR)
        self.available_sounds = [f for f in os.listdir(SOUNDS_DIR) if f.endswith('.wav')]
        if not self.available_sounds:
            self.available_sounds = ["default.wav"]
            
        self.performance_history = {
            f: {"best_time": float('inf'), "speed": 1.0, "pitch": 0.0} 
            for f in self.available_sounds
        }
        # main_exec.pyのグラフ表示に合わせたキー名
        self.history_log = {
            f: {"times": [], "best_pitches": [], "best_speeds": []} 
            for f in self.available_sounds
        }
    
    def load_input_from_go(self, file_path):
        if not os.path.exists(file_path):
            return None
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            fname = data["last-base-music"]
            if not fname.endswith('.wav'):
                fname += ".wav"
            return {
                "file": fname,
                "speed": float(data["last-speed"]),
                "pitch": float(data["last-pitch"]),
                "wake_up_time": int(data["wake_up_time"])
            }
        except Exception as e:
            print(f"Error reading JSON: {e}")
            return None

    def evolve(self, last_result):
        fname = last_result["file"]
        wake_time = last_result["wake_up_time"]

        # 1. 最速記録の更新判定
        if wake_time < self.performance_history[fname]["best_time"]:
            self.performance_history[fname] = {
                "best_time": wake_time,
                "speed": last_result["speed"],
                "pitch": last_result["pitch"]
            }
            print(f"   >>> Record Updated for {fname}! (Time: {wake_time}s)")

        # 2. 履歴の記録（変数名を cur に統一して修正）
        for f in self.available_sounds:
            cur = self.performance_history[f]
            self.history_log[f]["times"].append(cur["best_time"] if cur["best_time"] != float('inf') else None)
            self.history_log[f]["best_pitches"].append(cur["pitch"])
            self.history_log[f]["best_speeds"].append(cur["speed"])
        
        # 3. 進化した探索ロジック
        # 全体の中で最も成績が良い音源を特定
        best_overall_file = min(self.performance_history, key=lambda k: self.performance_history[k]["best_time"])
        
        # 基本的には成績の良い音源を選ぶが、時々他の音源も試す
        if random.random() < 0.7 and self.performance_history[best_overall_file]["best_time"] < 100:
            target_file = best_overall_file
        else:
            target_file = random.choice(self.available_sounds)
            
        best_cfg = self.performance_history[target_file]

        # --- 効率化のポイント：動的ノイズと突然変異 ---
        if random.random() < 0.15:  # 15%の確率で突然変異（局所解からの脱出）
            next_pitch = random.uniform(0.0, 8.0)
            next_speed = random.uniform(1.0, 2.0)
            print(f"   [Mutation] 大胆な探索を実行: {target_file}")
        else:
            # 正規化された歩幅（ピッチは範囲8、速度は範囲1に対して5%ずつ動かす）
            p_step = 8.0 * 0.05 
            s_step = 1.0 * 0.05
            
            # 前回の起床時間が遅い場合は、少し強めに変化させる（ブースト）
            multiplier = 2.0 if wake_time > 50 else 1.0
            
            next_pitch = best_cfg["pitch"] + random.uniform(-p_step * multiplier, p_step * multiplier)
            next_speed = best_cfg["speed"] + random.uniform(-s_step * multiplier, s_step * multiplier)

        return {
            "file": target_file,
            "speed": max(1.0, min(next_speed, 2.0)),
            "pitch": max(0.0, min(next_pitch, 8.0))
        }