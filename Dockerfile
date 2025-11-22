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

# Node.jsをインストール（Next.jsサーバー用）
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    curl \
    && rm -rf /var/lib/apt/lists/*

# publicディレクトリを作成（Next.jsでは通常.nextにコピーされるため、必要に応じて作成）
RUN mkdir -p /app/frontend/public

# 環境変数を設定
ENV FLASK_APP=backend/app.py
ENV PYTHONPATH=/app

# ポートを公開（バックエンド用）
EXPOSE 5000

# 起動スクリプトを作成（バックエンドとフロントエンドを同時に起動）
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# フロントエンドをバックグラウンドで起動\n\
echo "Starting frontend..."\n\
cd /app/frontend\n\
PORT=3000 npm start > /tmp/frontend.log 2>&1 &\n\
FRONTEND_PID=$!\n\
echo "Frontend started with PID: $FRONTEND_PID"\n\
\n\
# フロントエンドの起動を待つ（最大30秒）\n\
echo "Waiting for frontend to be ready..."\n\
for i in {1..30}; do\n\
  if curl -s http://localhost:3000 > /dev/null 2>&1; then\n\
    echo "Frontend is ready!"\n\
    break\n\
  fi\n\
  if [ $i -eq 30 ]; then\n\
    echo "Warning: Frontend did not start within 30 seconds"\n\
    echo "Frontend logs:"\n\
    tail -20 /tmp/frontend.log || true\n\
  fi\n\
  sleep 1\n\
done\n\
\n\
# バックエンドを起動（フォアグラウンド）\n\
echo "Starting backend..."\n\
cd /app/backend\n\
python app.py\n\
' > /app/start.sh && chmod +x /app/start.sh

# 統合起動スクリプトを使用
CMD ["/app/start.sh"]
