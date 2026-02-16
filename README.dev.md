# ReactNativeのDocker環境の立ち上げ方

## 初回準備

### Step1: Docker環境を確認

```
docker --version
```

```
docker compose version
```

コマンドでDockerのバージョン情報が正常に表示されていることを確認する

### Step2: 環境変数を設定する

1. `.env.example` ファイルの名前を`.env`に変更する
2. 端末のIPアドレスを`xxx.xxx.xxx.xxx`に入れる

- Windows

```
> ipconfig
~~~
Wireless LAN adapter Wi-Fi:

   接続固有の DNS サフィックス . ..:
   IPv6 アドレス . . . . . . . . .: 2001:ce8:131:c20e:7434:4c41:cbdb:49c7
   一時 IPv6 アドレス. . . . . . .: 2001:ce8:131:c20e:35eb:b8fa:404c:ceca
   リンクローカル IPv6 アドレス. ..: fe80::17d:cbae:f87:575a%8
   IPv4 アドレス . . . . . . . . .: 192.168.0.21 <-これ!!!!!!
   サブネット マスク . . . .  . . .: 255.255.255.0
```

- Macはよしなに

### Step2.5: セットアップ<追記>

```
docker compose -f ./compose.init.yml up react-native --build
```

コマンドでnode_modulesを埋める

### Step3: 立ち上げ

```
docker compose up --build
```

初回起動は時間がかかります、起動待ち中に次のステップに進もう

### Step4: Expo Goで立ち上げ

1. 動作確認用のスマートフォンに`Expo Go`をインストールする
2. HOME画面真ん中くらいの`Scan QR`でカメラを立ち上げ
3. Step3で立ち上げたターミナルに表示されたQRコードを読み取る
   ![QRコード](/Document/image/terminal-qr.png)

## 二回目以降

Step３の立ち上げコマンドは以下を使う

```
docker compose up
```

QRコードをスキャンして準備終了

## ライブラリを追加する時

ターミナルで実行する時は**コンテナ内に入って**コマンドを実行する。
`docker compose up`コマンドは実行を続け、別ウィンドウでターミナルを開く、

```
docker compose exec react-native bash
```

コマンドでコンテナ内に入り、ライブラリ追加等の目的のコマンドを実行する
