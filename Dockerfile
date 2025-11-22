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

# フロントエンドの静的エクスポート成果物をコピー
COPY --from=frontend /app/frontend/out /app/frontend/out
# publicディレクトリもコピー（存在する場合）
COPY --from=frontend /app/frontend/public /app/frontend/public 2>/dev/null || true

# 環境変数を設定
ENV FLASK_APP=backend/app.py
ENV PYTHONPATH=/app

# ポートを公開（バックエンド用）
EXPOSE 5000

# バックエンドのみ起動（フロントエンドは静的ファイルとして配信）
CMD ["python", "backend/app.py"]
