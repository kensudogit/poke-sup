# Vercelダッシュボード設定手順（必須）

## 現在の状況
- デプロイは実行されているが、ビルドが0msで完了（実際にはビルドが実行されていない）
- エラーが継続している

## 解決方法：Vercelダッシュボードで設定を確認・修正

### ステップ1: プロジェクト設定を開く
1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクト「frontend」を選択
3. **Settings** → **General** に移動

### ステップ2: Framework Presetを確認
- **Framework Preset** が **Next.js** に設定されているか確認
- 設定されていない場合は、**Next.js** を選択

### ステップ3: Build & Development Settingsを確認
以下の設定を確認・修正：

- **Build Command**: `npm run build`（または空欄で自動検出）
- **Output Directory**: `.next`（または空欄で自動検出）
- **Install Command**: `npm install`（または空欄で自動検出）
- **Development Command**: `npm run dev`（または空欄で自動検出）

### ステップ4: Root Directoryを確認
- **Root Directory** が空欄（自動検出）になっているか確認
- `frontend`ディレクトリからデプロイしているため、空欄でOK

### ステップ5: 環境変数を設定
**Settings** → **Environment Variables** で以下を追加：

- **Key**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://[RailwayバックエンドURL]`
- **Environment**: Production, Preview, Development すべてにチェック

### ステップ6: 再デプロイ
1. **Deployments** タブに移動
2. 最新のデプロイメントを選択
3. **Redeploy** をクリック

または、CLIから：
```bash
cd C:\devlop\poke-sup\frontend
vercel --prod
```

## 確認事項
- [ ] Framework PresetがNext.jsに設定されている
- [ ] Build Commandが正しく設定されている
- [ ] 環境変数が設定されている
- [ ] 再デプロイが成功している

## 現在のプロジェクト情報
- プロジェクト名: `frontend`
- プロジェクトID: `prj_WZq10Qr8sumsO8tyFFM2AxM5p9BC`
- デプロイURL: `https://frontend-78gvyqy3s-kensudogits-projects.vercel.app`
- 本番URL: `https://frontend-kensudogits-projects.vercel.app`

