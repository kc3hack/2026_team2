FROM python:3.10

WORKDIR /PythonAI

COPY . .

# UID 1000のユーザーとグループを作成
RUN groupadd -g 1000 python && \
    useradd -u 1000 -g python -m python

# ディレクトリの所有権を変更
RUN chown -R python:python /PythonAI

RUN python -m pip install --no-cache-dir -r requirements.txt

# ユーザーを切り替え
USER python