import os
import random
import json

# 設定
SOUNDS_DIR = "raw_sounds/"
GENE_FILE = "current_population.json" # 遺伝子プールを保存しておく場所

class AlarmGA:
    def __init__(self):
        # フォルダがない場合のエラー回避
        if not os.path.exists(SOUNDS_DIR):
            os.makedirs(SOUNDS_DIR)
        self.available_sounds = [f for f in os.listdir(SOUNDS_DIR) if f.endswith('.wav')]
        if not self.available_sounds:
            self.available_sounds = ["default.wav"] # 予備
        
    def get_initial_gene(self):
        """初回用のランダムな遺伝子を生成"""
        return {
            "file": random.choice(self.available_sounds),
            "speed": 1.0,
            "pitch": 0.0
        }

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
        # 1. 適応度の計算 (早いほど高い)
        wake_up_time = last_result.get("wake_up_time", 60)
        border=30
        pitch_learning_rate_min=0.1
        pitch_learning_rate_max=0.3
        speed_learning_rate_min=0.1
        speed_learning_rate_max=0.3
       
        # 2. 突然変異ロジック
        new_gene = {
            "file": last_result.get("file", self.available_sounds[0]),
            "speed": last_result.get("speed", 1.0),
            "pitch": last_result.get("pitch", 0.0)
        }
        new_gene = last_result.copy()
       

        # 起きるのが遅かったら(適応度が低い)、より過激に変化させる
        if wake_up_time > border: # 30秒以上かかったら
            new_gene["speed"] += random.uniform(speed_learning_rate_min, speed_learning_rate_max)
            new_gene["pitch"] += random.uniform(pitch_learning_rate_min, pitch_learning_rate_max)
            # 10%の確率でファイル自体を変える（突然変異）
            if random.random() < 0.1:
                new_gene["file"] = random.choice(self.available_sounds)
        else:
            # 【報酬】すぐ起きられた：少しだけ値を下げて、耳への優しさを探る
            new_gene["speed"] -= random.uniform(speed_learning_rate_min, speed_learning_rate_max)
            new_gene["pitch"] -= random.uniform(pitch_learning_rate_min, pitch_learning_rate_max)
        
        # 値の制限 (速度2倍まで、とか)
        new_gene["speed"] = min(new_gene["speed"], 2.0)
        new_gene["pitch"] = min(new_gene["pitch"], 8.0)

        return new_gene
# GoからのJSONを監視し、設計図を吐き出すメインループをここに記述