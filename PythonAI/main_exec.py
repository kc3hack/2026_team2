import time
import os
from Learning import AlarmGA
import generator  # 先ほど作成した render_audio が入っているファイル

def main_loop():
    engine = AlarmGA()
    input_path = "shared/go2py/input.json"

    print("=== アラーム学習システム 待機中... ===")
    
    while True:
        # 1. Goサーバーからのファイルを監視
        if os.path.exists(input_path):
            print("\n[信号検知] 新しいデータが届きました。")
            
            # 2. データの読み込み
            last_data = engine.load_input_from_go()
            
            if last_data:
                # 3. 学習（進化ロジック）の実行
                print("学習実行中...")
                next_gene = engine.evolve(last_data)
                
                # 4. 音声生成と py2go への書き出し
                print(f"音声生成開始: {next_gene['file']}")
                generator.render_audio(next_gene)
                
                # 5. 処理済みファイルの削除（これが重要！）
                # これを消さないと、同じファイルで無限ループしてしまいます
                try:
                    os.remove(input_path)
                    print("[完了] input.json を処理し、待機モードに戻ります。")
                except Exception as e:
                    print(f"ファイル削除エラー: {e}")
            
        # CPU負荷を下げるための短い待機
        time.sleep(0.5)

if __name__ == "__main__":
    main_loop()