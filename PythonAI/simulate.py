import random
from Learning import AlarmGA

def simulate_user_behavior(gene):
    """
    仮想ユーザー：音が激しい（Speed/Pitchが高い）ほど早く起きる
    """
    # 基礎起床時間（秒）
    base_time = 100 
    
    # 補正：スピード1.0上がるごとに20秒短縮、ピッチ1.0上がるごとに3秒短縮と仮定
    performance = (gene['speed'] * 20) + (gene['pitch'] * 3)
    
    # 10秒〜15秒のランダムなノイズ（体調など）
    noise = random.uniform(-10, 15)
    
    wake_up_time = base_time - performance + noise
    return max(3, wake_up_time) # 最低でも3秒はかかるとする

def run_test(days=30):
    engine = AlarmGA()
    
    # 初期状態
    current_gene = {
        "file": "emergency.wav",
        "speed": 1.0,
        "pitch": 0.0
    }
    
    print(f"{'日目':<4} | {'起床時間':<6} | {'Speed':<5} | {'Pitch':<5} | {'ファイル'}")
    print("-" * 50)

    for day in range(1, days + 1):
        # 1. ユーザーが起きる（シミュレート）
        wake_time = simulate_user_behavior(current_gene)
        
        # 結果を表示
        print(f"{day:<5} | {wake_time:>6.1f}秒 | {current_gene['speed']:>5.2f} | {current_gene['pitch']:>5.1f} | {current_gene['file']}")
        
        # 2. 学習（次の日の設定を決定）
        # Goから返ってくる形式に合わせて辞書を作る
        last_result = {
            "file": current_gene["file"],
            "speed": current_gene["speed"],
            "pitch": current_gene["pitch"],
            "wake_up_time": wake_time
        }
        current_gene = engine.evolve(last_result)

if __name__ == "__main__":
    run_test(days=30)