import os
import json
import time
import shutil
import random
from Learning import AlarmGA
import generator  # generator.py をモジュールとしてインポート

# パス設定
GO2PY_DIR = "shared/go2py"
PY2GO_DATA_DIR = "shared/py2go/data"
PY2GO_MUSIC_DIR = "shared/py2go/music"
INPUT_JSON = os.path.join(GO2PY_DIR, "input.json")

def setup_directories():
    """必要なディレクトリをすべて初期化する"""
    for path in [GO2PY_DIR, PY2GO_DATA_DIR, PY2GO_MUSIC_DIR, "raw_sounds"]:
        os.makedirs(path, exist_ok=True)
    
    # テスト用のダミー音声ファイルがない場合、エラーになるので警告
    if not os.listdir("raw_sounds"):
        print("![注意] raw_sounds フォルダに .wav ファイルを1つ以上入れてください。")
        return False
    return True

def simulate_go_server(turn, last_pitch=0, last_speed=1.0):
    """Goサーバーの挙動を模倣して input.json を書き出す"""
    # raw_soundsにあるファイル名を取得（拡張子なし）
    sounds = [os.path.splitext(f)[0] for f in os.listdir("raw_sounds") if f.endswith('.wav')]
    base_music = random.choice(sounds)
    
    # ユーザーが起きるまでの時間をシミュレート（回を追うごとに短くなるか試す）
    wake_up_time = random.randint(10, 100)
    
    data = {
        "last-base-music": base_music,
        "last-pitch": last_pitch,
        "last-speed": last_speed,
        "wake_up_time": wake_up_time
    }
    
    with open(INPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)
    
    print(f"\n[Turn {turn}] --- Goサーバーがデータを送信しました ---")
    print(f"送信内容: {data}")
    return data

def run_simulation(iterations=3):
    if not setup_directories():
        return

    engine = AlarmGA()
    current_pitch = 0.0
    current_speed = 1.0

    for i in range(1, iterations + 1):
        # 1. Goサーバーが入力ファイルを作成
        sim_data = simulate_go_server(i, current_pitch, current_speed)
        
        # 2. Python側のメインロジックを実行
        print(f"[Turn {i}] --- Pythonが学習と生成を開始します ---")
        
        # input.jsonを読み込んで学習
        next_input = engine.load_input_from_go()
        if next_input:
            next_gene = engine.evolve(next_input)
            
            # 音声生成と結果の書き出し
            output_json_path = generator.render_audio(next_gene)
            
            # 3. 生成された結果を確認して、次のターンの入力に備える
            with open(output_json_path, 'r', encoding='utf-8') as f:
                res = json.load(f)
                current_pitch = res["pitch"]
                current_speed = res["speed"]
                print(f"[Turn {i}] --- 完了。生成ファイル: {res['file-name']}")
        
        time.sleep(1) # 動作確認しやすくするために少し待機

if __name__ == "__main__":
    run_simulation(150)