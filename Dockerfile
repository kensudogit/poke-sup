# Railway用の統合Dockerfile
# バックエンドとフロントエンドを1つのコンテナで実行

# ステージ1: バックエンドのビルド
FROM python:3.11-slim as backend

WORKDIR /app/backend

# バックエンドの依存関係をインストール
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# バックエンドのコードをコピー
COPY backend/ .

# ステージ2: フロントエンドのビルド
FROM node:18-alpine as frontend

WORKDIR /app/frontend

# フロントエンドの依存関係をインストール
COPY frontend/package*.json ./
COPY frontend/package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; else npm install; fi

# フロントエンドのコードをコピーしてビルド
COPY frontend/ .
RUN npm run build

# ステージ3: 本番環境
FROM python:3.11-slim

WORKDIR /app

# バックエンドの依存関係をインストール
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# バックエンドのコードをコピー
COPY --from=backend /app/backend /app/backend

# フロントエンドのビルド成果物をコピー
COPY --from=frontend /app/frontend/.next /app/frontend/.next
COPY --from=frontend /app/frontend/package*.json /app/frontend/
COPY --from=frontend /app/frontend/node_modules /app/frontend/node_modules
# publicディレクトリが存在する場合のみコピー（オプション）
# Next.jsではpublicディレクトリはオプションなので、存在しない場合はスキップ
RUN mkdir -p /app/frontend/public

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# 環境変数を設定
ENV FLASK_APP=backend/app.py
ENV PYTHONPATH=/app

# ポートを公開（バックエンド用）
EXPOSE 5000

# 起動スクリプトを作成
RUN echo '#!/bin/bash\n\
cd /app/backend && python app.py &\n\
cd /app/frontend && npm start &\n\
wait\n\
' > /app/start.sh && chmod +x /app/start.sh

# バックエンドのみ起動（フロントエンドは別サービス推奨）
CMD ["python", "backend/app.py"]
