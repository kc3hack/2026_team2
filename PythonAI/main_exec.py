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
    fig, (ax_time, ax_param) = plt.subplots(2, 1, figsize=(10, 8))
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

                    ax_time.cla()
                    ax_param.cla()
                    # グラフ描画更新
                    for fname, data in engine.history_log.items():
                        if not data["times"] or data["times"][-1] is None: continue
                        
                        # 起床時間の推移
                        ax_time.plot(data["times"], label=f"{fname}", marker='.')
                        
                        # 最新のベストパラメータを散布図で表示
                        ax_param.scatter(data["best_pitches"][-1], data["best_speeds"][-1], 
                                         s=100, label=f"{fname} (Current Best)")
                        ax_param.annotate(fname.split('.')[0], (data["best_pitches"][-1], data["best_speeds"][-1]))
                    
                    ax_time.set_title("Best Wake-up Time Trend (Lower is better)")
                    ax_time.set_ylabel("Seconds")
                    ax_time.legend(loc='upper right', fontsize='small')
                    
                    ax_param.set_title("Current Optimal Parameters")
                    ax_param.set_xlabel("Pitch (0.0 - 8.0)")
                    ax_param.set_ylabel("Speed (1.0 - 2.0)")
                    ax_param.set_xlim(-0.5, 8.5)
                    ax_param.set_ylim(0.9, 2.1)
                    ax_param.grid(True, linestyle='--')
                    
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