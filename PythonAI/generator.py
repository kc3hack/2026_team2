import librosa
import soundfile as sf
from Learning import AlarmGA
import os

def render_audio(gene):
    input_path = os.path.join("raw_sounds", gene["file"])
    output_wav_name = "generated_alarm.wav"
    n_steps=gene['pitch']
    rate=gene['speed']
    """設計図(JSON)を元に実際の音ファイルを生成する"""
    y, sr = librosa.load(input_path)
    
    # 信号処理（重い処理）
    y = librosa.effects.pitch_shift(y, sr=sr, n_steps=n_steps)
    y = librosa.effects.time_stretch(y, rate)
    
    sf.write(output_wav_name, y, sr)
    print(f"--- 生成完了: {output_wav_name} (Pitch: {gene['pitch']}, Speed: {gene['speed']}) ---")
    return output_wav_name,rate,n_steps,input_path

# --- メイン処理の流れ ---
if __name__ == "__main__":
    engine = AlarmGA()
    
    # 【修正ポイント】直接ファイル名を指定せず、今あるファイルから取得する
    initial_gene = engine.get_initial_gene()
    # 1. Goから届いた想定のデータ (本来はAPIや引数で受け取る)
    #last_data_from_go = {
        #"file": "emergency.wav",
        #"speed": 1.0,
        #"pitch": 0.0,
        #"wake_up_time": 45  # 30秒以上かかったという設定
    #}

    # 2. 学習インスタンスの作成 (カッコが必要！)
   

    # 3. 次の遺伝子（設定値）を計算
    print("次のアラーム設定を計算中...")
    next_gene = engine.evolve(last_data_from_go)
    print(f"新しい設定: {next_gene}")

    # 4. 音声ファイルを生成
    render_audio(next_gene)
