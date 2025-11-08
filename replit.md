# WORK NOW - Replit環境セットアップ状況

## プロジェクト概要
即戦力マッチング&報酬プラットフォーム
- **バックエンド**: FastAPI (Python) - ポート8000
- **フロントエンド**: React + Vite + TypeScript - ポート5000
- **データベース**: Supabase (PostgreSQL)
- **決済**: Stripe Connect
- **認証**: Supabase Auth

## 最新の変更 (2025-11-08)

### ✅ フロントエンドをFlutter WebからReact + Viteに再構築！

Flutter Webの表示問題により、React + Viteに完全移行しました。

#### バックエンド (FastAPI)
- **ステータス**: ✅ 正常動作中
- **ポート**: 8000
- **URL**: http://localhost:8000
- **起動コマンド**: `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`

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

### 実装済み機能

**認証シェル**:
- ログイン画面 (`/login`)
- 保護されたルート
- Zustandによる認証状態管理
- localStorage によるトークン永続化

**レイアウト**:
- メインレイアウト（ナビゲーションバー付き）
- ダッシュボード
- 求人ページ（基本構造）

### 修正した主な問題

**1. Vite設定 (Replit環境対応)**
- `frontend/vite.config.ts` - `allowedHosts: true` を追加してReplit Webviewからのアクセスを許可

**2. Pydantic v2互換性**
- `backend/utils/config.py` - CORS_ORIGINS環境変数のパース処理を修正

**3. TypeScript型エラー修正**
- `frontend/src/components/layout/ProtectedRoute.tsx` - `ReactNode` を明示的にimport

**4. 認証フロー改善**
- `frontend/src/hooks/useAuthInit.ts` - ページリロード時に `/auth/me` でユーザー情報を復元
- `frontend/src/lib/api.ts` - 401エラー時に `logout()` を呼び出してからリダイレクト

### 作成したファイル（React）
- `frontend/src/stores/authStore.ts` - Zustand認証ストア
- `frontend/src/lib/api.ts` - Axios APIクライアント
- `frontend/src/lib/supabase.ts` - Supabaseクライアント
- `frontend/src/hooks/useAuthInit.ts` - 認証初期化フック
- `frontend/src/components/layout/MainLayout.tsx` - メインレイアウト
- `frontend/src/components/layout/ProtectedRoute.tsx` - 保護されたルート
- `frontend/src/pages/auth/LoginPage.tsx` - ログイン画面
- `frontend/src/pages/dashboard/DashboardPage.tsx` - ダッシュボード
- `frontend/src/pages/jobs/JobsPage.tsx` - 求人リスト

## 環境変数 (backend/.env)
```
SUPABASE_URL=https://example.supabase.co
SUPABASE_KEY=your-supabase-key-here
STRIPE_API_KEY=sk_test_example
STRIPE_CONNECT_CLIENT_ID=ca_example
STRIPE_WEBHOOK_SECRET=whsec_example
STRIPE_PLATFORM_FEE=10
FIREBASE_KEY={}
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=dev-jwt-secret-change-in-production-to-secure-random-string
JWT_EXPIRE_MINUTES=60
DOMAIN=https://7524a68e-8e69-403f-ac49-a8fd6d71de3a-00-2pcpdci634d4b.pike.replit.dev
ADMIN_EMAIL=admin@example.com
CORS_ORIGINS=https://7524a68e-8e69-403f-ac49-a8fd6d71de3a-00-2pcpdci634d4b.pike.replit.dev,http://localhost:5000,http://0.0.0.0:5000
ENVIRONMENT=development
PORT=8000
```

## デプロイ設定
VMデプロイ設定済み
- バックエンドとフロントエンドの両方を起動
- 本番環境用の設定に更新が必要（Gunicorn、プロダクションビルドなど）

## 注意事項

### 認証・API接続
フロントエンドは現在開発モードで動作していますが、実際のAPI接続テストには以下が必要です：
1. 有効なSupabaseの認証情報
2. 有効なStripe API キー
3. データベースのセットアップ

### 開発画面の表示
Replitのプレビューでフロントエンドを表示する場合：
1. Replitの「Webview」タブで http://0.0.0.0:5000 にアクセス
2. ブラウザの開発者ツール(F12)でコンソールエラーを確認
3. 白い画面が表示される場合は、サービスワーカーのキャッシュをクリアして再読み込み

## 次のステップ（本番環境準備）
1. 実際のSupabase・Stripe認証情報を設定
2. データベースマイグレーションの実行
3. フロントエンドの本番ビルド (`flutter build web`)
4. バックエンドをGunicornで起動（本番用）
5. デプロイメントテスト
