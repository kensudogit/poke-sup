FROM node:18-alpine

WORKDIR /app

# 依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリケーションコードをコピー
COPY . .

# 本番環境用にビルド
RUN npm run build

EXPOSE 3000

# 本番環境用に起動
CMD ["npm", "start"]


