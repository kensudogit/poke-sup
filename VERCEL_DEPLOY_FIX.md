# Vercelデプロイエラー修正ガイド

## 問題
- **エラー**: "Resource provisioning failed"
- **症状**: ビルドが0msで完了し、実際にはビルドが実行されていない

## 原因
Vercelがプロジェクトのルートディレクトリを正しく認識していない可能性があります。

## 解決方法

### 方法1: Vercelダッシュボードで設定を確認

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクト「frontend」を選択
3. **Settings** → **General** に移動
4. 以下の設定を確認：
   - **Root Directory**: 空欄（自動検出）または `frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`（または空欄で自動検出）
   - **Output Directory**: `.next`（または空欄で自動検出）
   - **Install Command**: `npm install`（または空欄で自動検出）

5. **Settings** → **Environment Variables** で以下を設定：
   ```
   NEXT_PUBLIC_API_URL=https://[RailwayバックエンドURL]
   ```

### 方法2: プロジェクトを削除して再作成

1. Vercelダッシュボードでプロジェクト「frontend」を削除
2. プロジェクトルート（`C:\devlop\poke-sup`）から以下を実行：

```bash
cd C:\devlop\poke-sup
vercel link
# プロジェクト名を入力（例: poke-sup-frontend）
# Root Directory: frontend を指定
vercel --prod
```

### 方法3: GitHubからデプロイ

1. コードをGitHubにプッシュ
2. Vercelダッシュボードで **Add New Project**
3. GitHubリポジトリを選択
4. プロジェクト設定：
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
5. 環境変数を設定
6. **Deploy** をクリック

## 確認事項

- [ ] `package.json`に`build`スクリプトが存在する
- [ ] `next.config.js`が存在する
- [ ] `.gitignore`で必要なファイルが除外されていない
- [ ] 環境変数が正しく設定されている

## 現在の設定

- プロジェクト名: `frontend`
- プロジェクトID: `prj_WZq10Qr8sumsO8tyFFM2AxM5p9BC`
- ビルドコマンド: `npm run build`（ローカルでは成功）
- Next.jsバージョン: 14.0.4

