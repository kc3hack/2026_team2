import os
import random
import json


# 設定
SOUNDS_DIR = "raw_sounds/"
INPUT_JSON_PATH = "shared/go2py/input.json"


class AlarmGA:
    def __init__(self):
        # フォルダがない場合のエラー回避
        if not os.path.exists(SOUNDS_DIR):
            os.makedirs(SOUNDS_DIR)
        self.available_sounds = [f for f in os.listdir(SOUNDS_DIR) if f.endswith('.wav')]
        if not self.available_sounds:
            self.available_sounds = ["default.wav"] # 予備
        self.performance_history = {
            f: {"best_time": float('inf'), "speed": 1.0, "pitch": 0.0} 
            for f in self.available_sounds
        }
        
    def get_initial_gene(self):
        """初回用のランダムな遺伝子を生成"""
        return {
            "file": random.choice(self.available_sounds),
            "speed": 1.0,
            "pitch": 0.0
        }
    
    def load_input_from_go(self):
        """shared/go2py 内のJSONを読み込んで、Pythonで扱いやすい形式に変換する"""
        if not os.path.exists(INPUT_JSON_PATH):
            print(f"Waiting for input file at {INPUT_JSON_PATH}...")
            return None
        
        try:
            with open(INPUT_JSON_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # JSONのキーを内部ロジック用にマッピング
            # 注意: ファイル名に .wav が付いていない場合は補完が必要
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
        """
        last_result: Goから返ってくるデータ
        {
            "file": "emergency.wav",
            "speed": 1.2,
            "pitch": 2.0,
            "wake_up_time": 45  # 秒
        }
        """

        fname = last_result["file"]
        wake_time = last_result["wake_up_time"]
        # 1. 最速記録の更新判定
        if wake_time < self.performance_history[fname]["best_time"]:
            self.performance_history[fname] = {
                "best_time": wake_time,
                "speed": last_result["speed"],
                "pitch": last_result["pitch"]
            }
            print(f"   >>> Record Updated for {fname}!")

        best_file = min(self.performance_history, key=lambda k: self.performance_history[k]["best_time"])
        if random.random() < 0.5 and self.performance_history[best_file]["best_time"] < 100:
            target_file = best_file
        else:
            target_file = random.choice(self.available_sounds)
        

        # 1. 適応度の計算 (早いほど高い)
        
        border=30
        pitch_learning_noise_min=-0.3
        pitch_learning_noise_max=0.3
        speed_learning_noise_min=-0.1
        speed_learning_noise_max=0.1

        # 3. パラメータの決定（そのファイルのベストを基準にノイズを加える）
        best_cfg = self.performance_history[target_file]
        
        # 基本ノイズ（音の質を変える）
        noise_s = random.uniform(-speed_learning_noise_min, speed_learning_noise_max)
        noise_p = random.uniform(pitch_learning_noise_min, pitch_learning_noise_max)

        # もし起きるのが遅かったら、さらに過激に振る
        boost = 0.2 if wake_time > border else 0.0
       
        # 2. 突然変異ロジック
        new_gene = {
            "file": target_file,
            "speed": max(1.0, min(best_cfg["speed"] + noise_s + boost, 2.0)),
            "pitch": max(0.0, min(best_cfg["pitch"] + noise_p + (boost * 5), 8.0))
           
        }
        


        return new_gene
# GoからのJSONを監視し、設計図を吐き出すメインループをここに記述