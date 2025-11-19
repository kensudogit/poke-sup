# API ドキュメント

## ベースURL

```
http://localhost:5002/api
```

## 認証

ほとんどのエンドポイントはJWT認証が必要です。リクエストヘッダーに以下を追加してください：

```
Authorization: Bearer <access_token>
```

## エンドポイント

### ヘルスチェック

#### GET /api/health

システムの状態を確認します。

**レスポンス例:**
```json
{
  "status": "ok",
  "database": "healthy",
  "service": "poke-sup-backend"
}
```

### 認証

#### POST /api/auth/register

新規ユーザーを登録します。

**リクエストボディ:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "ユーザー名",
  "role": "patient",
  "language": "ja"
}
```

**レスポンス:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "ユーザー名",
    "role": "patient",
    "language": "ja"
  }
}
```

#### POST /api/auth/login

ログインします。

**リクエストボディ:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "ユーザー名",
    "role": "patient"
  }
}
```

#### GET /api/auth/me

現在のユーザー情報を取得します。

**認証:** 必要

**レスポンス:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "ユーザー名",
  "role": "patient",
  "language": "ja"
}
```

### 会話

#### GET /api/conversations

会話一覧を取得します。

**認証:** 必要

**レスポンス:**
```json
[
  {
    "id": 1,
    "patient_id": 1,
    "provider_id": 2,
    "patient": {...},
    "provider": {...},
    "created_at": "2025-11-19T07:00:00",
    "updated_at": "2025-11-19T07:30:00"
  }
]
```

#### POST /api/conversations

新しい会話を作成します。

**認証:** 必要

**リクエストボディ:**
```json
{
  "patient_id": 1,
  "provider_id": 2
}
```

### メッセージ

#### GET /api/messages/conversation/{conversation_id}

会話のメッセージ一覧を取得します。

**認証:** 必要

#### POST /api/messages

新しいメッセージを送信します。

**認証:** 必要

**リクエストボディ:**
```json
{
  "conversation_id": 1,
  "content": "メッセージ内容"
}
```

### 健康データ

#### GET /api/health-data

健康データ一覧を取得します。

**認証:** 必要

**クエリパラメータ:**
- `data_type`: データタイプ（blood_pressure, weight, blood_sugar, temperature）
- `start_date`: 開始日（ISO形式）
- `end_date`: 終了日（ISO形式）

#### POST /api/health-data

健康データを追加します。

**認証:** 必要

**リクエストボディ:**
```json
{
  "data_type": "blood_pressure",
  "value": 120.5,
  "unit": "mmHg",
  "notes": "朝の測定",
  "recorded_at": "2025-11-19T07:00:00"
}
```

### リマインダー

#### GET /api/reminders

リマインダー一覧を取得します。

**認証:** 必要

**クエリパラメータ:**
- `is_completed`: 完了状態（true/false）
- `upcoming_only`: 今後のみ（true/false）

#### POST /api/reminders

リマインダーを作成します。

**認証:** 必要

**リクエストボディ:**
```json
{
  "title": "薬を飲む",
  "description": "朝の薬",
  "reminder_type": "medication",
  "scheduled_at": "2025-11-20T08:00:00"
}
```

### ユーザー

#### GET /api/users

ユーザー一覧を取得します。

**認証:** 必要

**クエリパラメータ:**
- `role`: ロール（patient, healthcare_provider, admin）

## WebSocket

### 接続

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5002', {
  auth: {
    token: 'your-access-token'
  }
});
```

### イベント

#### join_conversation

会話ルームに参加します。

```javascript
socket.emit('join_conversation', {
  conversation_id: 1
});
```

#### send_message

メッセージを送信します。

```javascript
socket.emit('send_message', {
  conversation_id: 1,
  content: 'メッセージ内容'
});
```

#### new_message

新しいメッセージを受信します。

```javascript
socket.on('new_message', (message) => {
  console.log('New message:', message);
});
```

## エラーレスポンス

エラーが発生した場合、以下の形式で返されます：

```json
{
  "error": "エラーメッセージ"
}
```

**HTTPステータスコード:**
- `200`: 成功
- `201`: 作成成功
- `400`: リクエストエラー
- `401`: 認証エラー
- `403`: 権限エラー
- `404`: リソースが見つかりません
- `500`: サーバーエラー

