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

# publicディレクトリをコピー（画像ファイルなど）
COPY frontend/public /app/frontend/public

# Node.jsをインストール（Next.jsサーバー用）
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 環境変数を設定
ENV FLASK_APP=backend/app.py
ENV PYTHONPATH=/app

# ポートを公開（バックエンド用）
EXPOSE 5000

# 起動スクリプトを作成（バックエンドとフロントエンドを同時に起動）
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# ログのバッファリングを無効化\n\
export PYTHONUNBUFFERED=1\n\
\n\
# フロントエンドをバックグラウンドで起動\n\
echo "==========================================="\n\
echo "Starting frontend..."\n\
echo "==========================================="\n\
cd /app/frontend || exit 1\n\
\n\
# フロントエンドの起動ログを出力（バッファリングなし）\n\
PORT=3000 npm start > /tmp/frontend.log 2>&1 &\n\
FRONTEND_PID=$!\n\
echo "Frontend started with PID: $FRONTEND_PID"\n\
echo "Frontend log file: /tmp/frontend.log"\n\
\n\
# プロセスが実際に起動したか確認\n\
sleep 2\n\
if ! kill -0 $FRONTEND_PID 2>/dev/null; then\n\
  echo "ERROR: Frontend process died immediately"\n\
  echo "Frontend logs:"\n\
  cat /tmp/frontend.log || true\n\
  echo "Backend will continue to start"\n\
else\n\
  echo "Frontend process is running (PID: $FRONTEND_PID)"\n\
  \n\
  # フロントエンドの起動を待つ（最大60秒）\n\
  echo "==========================================="\n\
  echo "Waiting for frontend to be ready..."\n\
  echo "==========================================="\n\
  FRONTEND_READY=false\n\
  for i in {1..60}; do\n\
    if curl -s -f http://localhost:3000 > /dev/null 2>&1; then\n\
      echo "✓ Frontend is ready! (after ${i} seconds)"\n\
      FRONTEND_READY=true\n\
      # 起動確認後にログを表示\n\
      sleep 1\n\
      echo "Initial frontend logs:"\n\
      tail -20 /tmp/frontend.log || true\n\
      break\n\
    fi\n\
    # プロセスがまだ生きているか確認\n\
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then\n\
      echo "ERROR: Frontend process died"\n\
      echo "Frontend logs:"\n\
      cat /tmp/frontend.log || true\n\
      break\n\
    fi\n\
    if [ $((i % 5)) -eq 0 ]; then\n\
      echo "Still waiting... (${i}/60 seconds)"\n\
      echo "Recent frontend logs:"\n\
      tail -10 /tmp/frontend.log || true\n\
    fi\n\
    sleep 1\n\
  done\n\
  \n\
  if [ "$FRONTEND_READY" = "false" ]; then\n\
    echo "==========================================="\n\
    echo "WARNING: Frontend did not start within 60 seconds"\n\
    echo "==========================================="\n\
    echo "Frontend logs:"\n\
    cat /tmp/frontend.log || true\n\
    echo "==========================================="\n\
    echo "Checking if frontend process is running..."\n\
    ps aux | grep -E "node|npm" | grep -v grep || true\n\
    echo "==========================================="\n\
    echo "Backend will continue to start even if frontend is not ready"\n\
  fi\n\
fi\n\
\n\
# バックエンドを起動（フォアグラウンド）\n\
echo "==========================================="\n\
echo "Starting backend..."\n\
echo "==========================================="\n\
echo "Backend will use PORT environment variable: ${PORT:-5000}"\n\
cd /app/backend || exit 1\n\
exec python app.py\n\
' > /app/start.sh && chmod +x /app/start.sh

# 統合起動スクリプトを使用
CMD ["/app/start.sh"]
