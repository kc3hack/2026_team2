FROM golang:1.25-alpine

WORKDIR /GoServer

# ソースコードのコピー（開発時はvolumeでマウント）
COPY . .

# UID 1000のユーザーとグループを作成
RUN addgroup -g 1000 go && \
adduser -D -u 1000 -G go go

# ディレクトリの所有権を変更
RUN chown -R go:go /GoServer

# ユーザーを切り替え
USER go

RUN go mod download

# ポートの公開
EXPOSE 8080

# go runでCompileDaemonを実行（go.modで管理）
CMD ["go", "run", "github.com/githubnemo/CompileDaemon@latest", "-build=go build -o tmp/main .", "-command=./tmp/main"]