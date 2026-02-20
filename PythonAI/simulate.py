import os
import json
import time
import random

# パス設定
GO2PY_DIR = "shared/go2py"
PY2GO_DATA_DIR = "shared/py2go/data"
INPUT_JSON = os.path.join(GO2PY_DIR, "input.json")

def simulate_go_server_lifecycle(turn, last_pitch, last_speed):
    """
    1. input.json を作成して Python に合図を送る
    2. Python がファイルを処理して消すまで待機する
    """
    os.makedirs(GO2PY_DIR, exist_ok=True)

    # 起床時間のシミュレーション（音の設定が良いほど早く起きる数式）
    # スピードが速い(2.0)・ピッチが高い(8.0)ほど improvement が大きくなる
    base_time = 100
    improvement = (last_speed * 15) + (last_pitch * 3)
    wake_up_time = max(5, int(base_time - improvement + random.randint(-5, 5)))
    
    # 1. データを書き出す
    data = {
        "last-base-music": "目覚まし時計のアラーム",
        "last-pitch": last_pitch,
        "last-speed": last_speed,
        "wake_up_time": wake_up_time
    }
    
    with open(INPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    print(f"\n[Turn {turn}] Go: input.json を配置しました。 (WakeTime: {wake_up_time}s)")

    # 2. Python がファイルを消すまで待つ（処理完了の合図）
    timeout = 30  # 30秒待っても反応なければエラー
    start_time = time.time()
    while os.path.exists(INPUT_JSON):
        time.sleep(0.5)
        if time.time() - start_time > timeout:
            print("Timeout: Pythonが反応していません。main_watcher.py は動いていますか？")
            return None, None

    # 3. py2go/data に書き出された最新の JSON から次のパラメータを取得
    # 一番新しいファイルを探す
    files = [os.path.join(PY2GO_DATA_DIR, f) for f in os.listdir(PY2GO_DATA_DIR) if f.endswith('.json')]
    latest_file = max(files, key=os.path.getmtime)
    
    with open(latest_file, 'r', encoding='utf-8') as f:
        res = json.load(f)
        print(f"[Turn {turn}] Go: Pythonの結果を確認しました。 次回設定 -> Pitch: {res['pitch']:.2f}, Speed: {res['speed']:.2f}")
        return res['pitch'], res['speed']

if __name__ == "__main__":
    p, s = 0.0, 1.0  # 初期値
    for i in range(1, 11): # まずは10回テスト
        p, s = simulate_go_server_lifecycle(i, p, s)
        if p is None: break
        time.sleep(1) # 次の朝まで待機するイメージ