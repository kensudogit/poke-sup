# モニタリングガイド

## 📊 概要

このガイドでは、Railwayでデプロイしたアプリケーションのモニタリング方法を説明します。構造化ログを使用して、アプリケーションの動作を追跡し、問題を迅速に特定できます。

---

## 🔍 ログの種類

### 1. アプリケーションログ

アプリケーションの動作を記録するログです。

#### 起動ログ
```
@level:info AND "Application starting"
```

#### エラーログ
```
@level:error
```

#### 警告ログ
```
@level:warn
```

### 2. 認証ログ

ユーザーの認証関連のログです。

#### ログイン成功
```
@level:info AND "User logged in successfully"
```

#### ログイン失敗
```
@level:warn AND "Login failed"
```

#### ユーザー登録
```
@level:info AND "User registered successfully"
```

### 3. 会話ログ

会話関連の操作を記録するログです。

#### 会話作成
```
@level:info AND "Conversation created"
```

#### 会話取得
```
@level:info AND "Conversations retrieved"
```

### 4. メッセージログ

メッセージ関連の操作を記録するログです。

#### メッセージ作成
```
@level:info AND "Message created"
```

### 5. ヘルスチェックログ

システムの健全性を確認するログです。

#### ヘルスチェック成功
```
@level:info AND "Health check passed"
```

#### ヘルスチェック失敗
```
@level:error AND "Health check failed"
```

---

## 📈 モニタリングクエリ例

### エラー率の監視

```
@level:error
```

### 認証エラーの監視

```
@level:warn AND ("Login failed" OR "Registration attempt")
```

### データベース接続エラー

```
@level:error AND "database"
```

### 特定のユーザーのアクティビティ

```
userId:123
```

### 特定の会話のメッセージ

```
conversationId:456
```

### 最近のエラー（時間範囲指定）

Railwayのログエクスプローラーで日付範囲を選択して、以下のクエリを実行：

```
@level:error
```

---

## 🚨 アラート設定（推奨）

### 重要なエラーを監視

以下のエラーは即座に対応が必要です：

1. **データベース接続エラー**
   ```
   @level:error AND "database" AND "unhealthy"
   ```

2. **認証システムのエラー**
   ```
   @level:error AND ("auth" OR "login" OR "registration")
   ```

3. **アプリケーション起動失敗**
   ```
   @level:error AND "Failed to start application"
   ```

### 警告レベルの監視

以下の警告は定期的に確認が必要です：

1. **認証失敗の試行**
   ```
   @level:warn AND "Login failed"
   ```

2. **不正なリクエスト**
   ```
   @level:warn AND ("unauthorized" OR "Invalid")
   ```

---

## 📊 パフォーマンス監視

### レスポンスタイム

HTTPログを使用してレスポンスタイムを監視：

```
@httpStatus:200
```

### エラーレスポンス

```
@httpStatus:500 OR @httpStatus:502 OR @httpStatus:503
```

### スロークエリ

データベースクエリのパフォーマンスを監視：

```
"slow query" OR "query time"
```

---

## 🔧 カスタムログ属性

構造化ログでは、カスタム属性を追加して検索できます：

### ユーザーIDで検索
```
userId:123
```

### 会話IDで検索
```
conversationId:456
```

### メッセージIDで検索
```
messageId:789
```

### 複数の属性を組み合わせ
```
userId:123 AND conversationId:456
```

---

## 📝 ログのベストプラクティス

### 1. 適切なログレベルを使用

- **debug**: 開発時の詳細情報
- **info**: 正常な操作の記録
- **warn**: 警告（問題の可能性があるが、動作は継続）
- **error**: エラー（操作が失敗した）

### 2. 構造化ログを使用

JSON形式でログを出力することで、検索とフィルタリングが容易になります。

```python
from utils.logging import log_info

log_info("User logged in", userId=123, email="user@example.com")
```

### 3. 機密情報を含めない

パスワード、トークン、個人情報などはログに含めないでください。

### 4. エラーにはコンテキストを含める

エラーログには、問題の原因を特定するための情報を含めます。

```python
from utils.logging import log_error

try:
    # 操作
except Exception as e:
    log_error("Operation failed", error=e, userId=user_id, resourceId=resource_id)
```

---

## 🔗 Railwayでのログ確認

### 方法1: ダッシュボード

1. Railwayダッシュボードにログイン
2. プロジェクトを選択
3. 「Observability」タブをクリック
4. ログエクスプローラーで検索

### 方法2: CLI

```bash
# 最新のログを確認
railway logs

# リアルタイムで監視
railway logs --follow

# エラーログのみ
railway logs | grep error
```

### 方法3: デプロイログ

1. プロジェクト → サービスを選択
2. デプロイメントをクリック
3. 「Deploy Logs」タブで確認

---

## 📊 ダッシュボードの作成（オプション）

### 推奨メトリクス

1. **エラー率**: エラーログの数 / 総ログ数
2. **認証成功率**: ログイン成功 / ログイン試行
3. **メッセージ送信数**: 時間あたりのメッセージ作成数
4. **会話作成数**: 時間あたりの会話作成数
5. **ヘルスチェック成功率**: ヘルスチェック成功 / 総チェック数

---

## 🚀 次のステップ

1. **ログの確認**: Railwayダッシュボードでログを確認
2. **アラートの設定**: 重要なエラーに対するアラートを設定
3. **パフォーマンスの監視**: レスポンスタイムとエラー率を監視
4. **定期的なレビュー**: 週次または月次でログをレビュー

---

## 🔗 参考リンク

- [Railway Logs Documentation](https://docs.railway.com/guides/logs)
- [Railway Observability](https://docs.railway.com/reference/observability)
- [構造化ログの実装](./backend/utils/logging.py)

---

*最終更新: 2025年11月*

