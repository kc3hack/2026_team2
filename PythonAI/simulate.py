import os
import json
import librosa
import soundfile as sf
import random
from Learning import AlarmGA  # Learning.pyからクラスをインポート

# --- Generator側の関数を再定義 (整理のため) ---
def render_audio(gene):
    """設計図(gene)を元に実際の音ファイルを生成する"""
    input_path = os.path.join("raw_sounds", gene["file"])
    output_wav_name = "generated_alarm.wav"
    
    # ファイル存在チェック
    if not os.path.exists(input_path):
        print(f"エラー: {input_path} が見つかりません。")
        return None

    print(f"--- 音声処理開始: {gene['file']} ---")
    y, sr = librosa.load(input_path)
    
    # 信号処理
    y_shifted = librosa.effects.pitch_shift(y, sr=sr, n_steps=gene['pitch'])
    y_stretched = librosa.effects.time_stretch(y_shifted, rate=gene['speed'])
    
    sf.write(output_wav_name, y_stretched, sr)
    print(f"--- 生成完了: {output_wav_name} (Pitch: {gene['pitch']:.2f}, Speed: {gene['speed']:.2f}) ---")
    return output_wav_name

# --- テストメイン処理 ---
if __name__ == "__main__":
    # 1. 準備: テスト用の音声ファイルがあるか確認
    if not os.path.exists("raw_sounds"):
        os.makedirs("raw_sounds")
        print("raw_sounds フォルダを作成しました。テスト用の .wav ファイルを入れてください。")
    
    # 2. 学習エンジンの初期化
    engine = AlarmGA()
    
    if not engine.available_sounds or engine.available_sounds == ["default.wav"]:
        print("警告: raw_sounds 内に音声ファイルがないため、処理を中断します。")
    else:
        # --- シミュレーションループ (3回回してみる) ---
        for i in range(1, 4):
            print(f"\n=== ターン {i} ===")
            
            # 3. Goサーバーからデータが送られてきたと仮定 (シミュレーション)
            # 実際はここでWake_up_timeがランダムに変化する
            simulated_go_data = {
                "file": random.choice(engine.available_sounds),
                "speed": round(random.uniform(1.0, 1.5), 2),
                "pitch": round(random.uniform(0.0, 4.0), 2),
                "wake_up_time": random.randint(10, 60) # 秒
            }
            print(f"Goからのデータ: {simulated_go_data}")

            # 4. Learning.py (evolve) を実行して次のパラメータを決定
            print("学習中...")
            next_gene = engine.evolve(simulated_go_data)
            print(f"次回の設計図: {next_gene}")

            # 5. Generator.py (render_audio) を実行して音声生成
            generated_file = render_audio(next_gene)
            
            if generated_file:
                print(f"成功: {generated_file} が更新されました。")