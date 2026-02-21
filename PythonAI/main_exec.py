import time
import os
from Learning import AlarmGA
import generator  # 先ほど作成した render_audio が入っているファイル
import glob
import matplotlib.pyplot as plt


def main_loop():
    engine = AlarmGA()
    input_path = "shared/go2py"
    if not os.path.exists(input_path):
        os.makedirs(input_path)
    # --- グラフの初期設定 ---
    plt.ion()
    fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(8, 10))
    plt.subplots_adjust(hspace=0.4) 
    

    print("=== アラーム学習システム 待機中... ===")
    
    while True:
        # 1. Goサーバーからのファイルを監視
        json_files = glob.glob(os.path.join(input_path, "*.json"))
        if json_files:
            for file_path in json_files:
                print("\n[信号検知] 新しいデータが届きました。")
                last_data = engine.load_input_from_go(file_path)
                if last_data:
                    print("学習実行中...")
                    next_gene = engine.evolve(last_data)
                    
                    # 4. 音声生成と py2go への書き出し
                    print(f"音声生成開始: {next_gene['file']}")
                    generator.render_audio(next_gene)
                    # グラフ描画更新
                    ax1.cla(); ax2.cla(); ax3.cla()
                    for fname, data in engine.history_log.items():
                        if not data["times"]: continue
                        ax1.plot(data["times"], label=f"{fname} (Time)", marker='o')
                        ax2.plot(data["pitches"], label=f"{fname} (Pitch)", linestyle='--')
                        ax3.plot(data["speeds"], label=f"{fname} (Speed)", linestyle=':')
                    
                    ax1.set_title("Wake-up Time Trend"); ax1.set_ylabel("Seconds")
                    ax2.set_title("Pitch Trend"); ax2.set_ylabel("Level")
                    ax3.set_title("Speed Trend"); ax3.set_ylabel("Rate")
                    ax1.legend(loc='upper right', fontsize='x-small')
                    plt.draw()
                    plt.pause(0.1)
                


                
                # 5. 処理済みファイルの削除（これが重要！）
                # これを消さないと、同じファイルで無限ループしてしまいます
                    try:
                        os.remove(file_path)
                        print("[完了] input.json を処理し、待機モードに戻ります。")
                    except Exception as e:
                        print(f"ファイル削除エラー: {e}")
            
        # CPU負荷を下げるための短い待機
        time.sleep(0.5)

if __name__ == "__main__":
    main_loop()