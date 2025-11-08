# WORK NOW - Replit環境セットアップ状況

## プロジェクト概要
即戦力マッチング&報酬プラットフォーム
- **バックエンド**: FastAPI (Python) - ポート8008
- **フロントエンド**: React + Vite + TypeScript - ポート5000
- **データベース**: Replit PostgreSQL (psycopg2接続プール)
- **決済**: Stripe Connect (完全実装済み)
- **認証**: JWT + bcrypt

## 最新の変更 (2025-11-08)

### ✅ PostgreSQL完全移行 & 全機能実装完了！

データベースをSupabaseからReplit PostgreSQLに完全移行し、すべてのバックエンド機能を実装しました。

#### バックエンド (FastAPI)
- **ステータス**: ✅ 正常動作中
- **ポート**: 8008
- **URL**: http://localhost:8008
- **起動コマンド**: `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8008 --reload`

#### フロントエンド (React + Vite)
- **ステータス**: ✅ 正常動作中
- **ポート**: 5000 (0.0.0.0でリッスン)
- **URL**: http://0.0.0.0:5000
- **起動コマンド**: `cd frontend && npm run dev`
- **Vite設定**: `allowedHosts: true` でReplit環境対応
- **技術スタック**:
  - React 18
  - TypeScript
  - Vite
  - React Router v6
  - TanStack Query
  - Zustand (状態管理)
  - Tailwind CSS v3
  - react-hook-form + zod
  - Axios

### 実装済みバックエンド機能

**✅ 完全実装済みAPIエンドポイント**:

1. **認証 (/auth)**
   - ログイン、登録、パスワードリセット
   - JWT トークン発行・更新
   - ユーザー情報取得

2. **求人管理 (/jobs)**
   - 求人作成、更新、削除
   - 求人リスト取得（ページネーション対応）
   - 求人ステータス管理（draft, published, closed）
   - 企業専用機能（求人投稿）

3. **応募管理 (/applications)**
   - 応募作成、更新
   - 応募ステータス管理（pending, interview, hired, rejected, withdrawn）
   - ワーカー・企業別の応募リスト取得

4. **アサインメント管理 (/assignments)**
   - アサインメント作成、更新
   - ステータス管理（active, completed, cancelled）
   - 作業開始・完了日時管理

5. **決済管理 (/payments)**
   - **Stripe Connect完全統合**
   - ワーカー用Connectアカウント作成
   - Payment Intent作成
   - Webhook処理
   - 決済履歴管理

6. **レビュー (/reviews)**
   - レビュー作成、更新
   - 評価システム（1-5段階）
   - 企業・ワーカー相互評価

7. **通知 (/notifications)**
   - プッシュ通知送信
   - 通知履歴管理
   - デバイストークン管理
   - Firebase Cloud Messaging統合準備済み

8. **管理者 (/admin)**
   - ダッシュボード統計
   - ユーザー数、求人数、売上集計
   - 最近のアクティビティ

### 実装済みフロントエンド機能

**✅ 認証機能**:
- ログイン画面 (`/login`)
- 保護されたルート
- Zustandによる認証状態管理
- localStorage によるトークン永続化
- 401エラーハンドリング

**✅ レイアウト**:
- メインレイアウト（ナビゲーションバー付き）
- ダッシュボード

**🚧 部分実装**:
- 求人ページ（基本構造のみ、APIとの統合が必要）

### データベース構造

**Replit PostgreSQL** を使用中：
- `DATABASE_URL` 環境変数で自動接続
- psycopg2接続プール実装
- **Adminユーザー**: info@sinjapan.jp / Kazuya8008 ✅

**実装済みテーブル（7テーブル）**:

1. **users** - ユーザー管理
   - email, password_hash, full_name, role (worker/company/admin)
   - avatar_url, is_active

2. **jobs** - 求人情報
   - title, description, company_id
   - location, employment_type, hourly_rate
   - status (draft/published/closed), tags
   - starts_at, ends_at

3. **applications** - 応募情報
   - job_id, worker_id, cover_letter
   - status (pending/interview/hired/rejected/withdrawn)
   - UNIQUE制約 (job_id, worker_id)

4. **assignments** - 作業割り当て
   - job_id, worker_id, application_id
   - status (active/completed/cancelled)
   - started_at, completed_at, notes, metadata

5. **payments** - 決済情報
   - assignment_id, amount, currency
   - stripe_payment_intent_id, stripe_transfer_id
   - status, metadata

6. **reviews** - レビュー
   - assignment_id, reviewer_id, reviewee_id
   - rating (1-5), comment, is_public

7. **device_tokens** - プッシュ通知
   - user_id, token, platform
   - UNIQUE制約 (token)

すべてのテーブルにインデックスを設定済み（パフォーマンス最適化）

### アーキテクチャ改善

**PostgreSQL移行**:
- `PostgresService` ベースクラス実装
- 空のpayload対応（update操作時のバグ修正済み）
- トランザクション管理
- 接続プール管理

**サービス層**:
- すべてのサービスクラスが`PostgresService`を継承
- 一貫したCRUD操作
- エラーハンドリング統一

## 環境変数 (backend/.env)
```
STRIPE_API_KEY=sk_test_example
STRIPE_CONNECT_CLIENT_ID=ca_example
STRIPE_WEBHOOK_SECRET=whsec_example
STRIPE_PLATFORM_FEE=10
FIREBASE_KEY={}
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=dev-jwt-secret-change-in-production-to-secure-random-string
JWT_EXPIRE_MINUTES=60
DOMAIN=https://7524a68e-8e69-403f-ac49-a8fd6d71de3a-00-2pcpdci634d4b.pike.replit.dev
ADMIN_EMAIL=info@sinjapan.jp
CORS_ORIGINS=https://7524a68e-8e69-403f-ac49-a8fd6d71de3a-00-2pcpdci634d4b.pike.replit.dev,http://localhost:5000,http://0.0.0.0:5000
ENVIRONMENT=development
PORT=8008
# DATABASE_URL は自動的に設定されます（Replit PostgreSQL）
```

## デプロイ設定
VMデプロイ設定済み
- バックエンドとフロントエンドの両方を起動
- 本番環境用の設定に更新が必要（Gunicorn、プロダクションビルドなど）

## 次のステップ

### フロントエンド実装
1. 求人リストページの完全実装
2. 求人詳細・応募ページ
3. ワーカーダッシュボード
4. 企業ダッシュボード
5. プロフィール管理
6. 決済・ウォレット画面
7. 通知センター

### 本番環境準備
1. 実際のStripe API キーを設定
2. Firebase設定（プッシュ通知）
3. Redis設定（キャッシング）
4. 本番用セキュリティ強化
5. SSL/TLS証明書設定
6. バックエンドをGunicornで起動
7. フロントエンドの本番ビルド

## 技術的備考

### 開発環境でのテスト
```bash
# ヘルスチェック
curl http://localhost:8008/health

# ログイン
curl -X POST http://localhost:8008/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "info@sinjapan.jp", "password": "Kazuya8008"}'

# 求人リスト取得（認証必要）
curl http://localhost:8008/jobs/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### データベース操作
```bash
# SQLクエリ実行
# Replitのデータベースパネルを使用するか、
# backend/utils/database.py の execute_sql_tool を使用
```
