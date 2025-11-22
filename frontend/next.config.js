/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002',
  },
  // 静的エクスポートは使用しない（動的ルーティングのため）
  // output: 'export', // コメントアウト
  // Vercelデプロイ用設定
  images: {
    domains: [],
  },
  // 本番環境での最適化
  swcMinify: true,
}

module.exports = nextConfig
