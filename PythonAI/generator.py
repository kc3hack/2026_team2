import librosa
import soundfile as sf
from Learning import AlarmGA
import os
import json
import uuid

DATA_OUT_DIR = "shared/py2go/data"
MUSIC_OUT_DIR = "shared/py2go/music"

def render_audio(gene):

    os.makedirs(DATA_OUT_DIR, exist_ok=True)
    os.makedirs(MUSIC_OUT_DIR, exist_ok=True)

    unique_id = str(uuid.uuid4())[:8]  # 短めのUUID
    output_filename = f"alarm_{unique_id}.wav"
    music_output_path = os.path.join(MUSIC_OUT_DIR, output_filename)
    data_output_path = os.path.join(DATA_OUT_DIR, f"result_{unique_id}.json")


    input_path = os.path.join("raw_sounds", gene["file"])
    print(f"--- 音声処理開始: {gene['file']} ---")
    
    y, sr = librosa.load(input_path)
    
    # 信号処理（重い処理）
    y = librosa.effects.pitch_shift(y, sr=sr, n_steps=gene['pitch'])
    y = librosa.effects.time_stretch(y, rate=gene['speed'])
    
    sf.write(music_output_path, y, sr)
    base_music_name = os.path.splitext(gene["file"])[0]

    result_data = {
        "base-music": base_music_name,
        "pitch": gene['pitch'],
        "speed": gene['speed'],
        "file-name": output_filename
    }

    with open(data_output_path, 'w', encoding='utf-8') as f:
        json.dump(result_data, f, indent=4, ensure_ascii=False)

    print(f"--- 処理完了 ---")
    print(f"Audio: {music_output_path}")
    print(f"JSON:  {data_output_path}")

    
    return data_output_path

# --- メイン処理の流れ ---
if __name__ == "__main__":
    engine = AlarmGA()
    
    # 【修正ポイント】直接ファイル名を指定せず、今あるファイルから取得する
    last_data_from_go = engine.load_input_from_go()
    if last_data_from_go:
        # 2. 次の遺伝子（設定値）を計算
        print("次のアラーム設定を計算中...")
        next_gene = engine.evolve(last_data_from_go)
        print(f"新しい設定: {next_gene}")

        # 3. 音声生成とデータ保存を実行
        render_audio(next_gene)
    else:
        print("Goからの入力データ待ち、またはファイルが見つかりません。")
   
