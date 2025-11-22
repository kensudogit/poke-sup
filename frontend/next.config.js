/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002',
  },
  // 静的エクスポート用設定（Flaskで配信する場合）
  // output: 'export', // コメントアウト（Next.jsサーバーで実行する場合は不要）
  // trailingSlash: true, // オプション：URLの末尾にスラッシュを追加
  // Vercelデプロイ用設定
  images: {
    domains: [],
    unoptimized: true, // 静的エクスポート時は画像最適化を無効化
  },
  // 本番環境での最適化
  swcMinify: true,
}

module.exports = nextConfig
