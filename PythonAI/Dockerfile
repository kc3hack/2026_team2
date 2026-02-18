FROM python:3.14-alpine

WORKDIR /PythonAI

COPY . .

# UID 1000のユーザーとグループを作成
RUN addgroup -g 1000 python && \
adduser -D -u 1000 -G python python

# ディレクトリの所有権を変更
RUN chown -R python:python /PythonAI

# ユーザーを切り替え
USER python