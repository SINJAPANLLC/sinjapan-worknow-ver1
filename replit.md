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

### 修正した主な互換性問題

**1. Pydantic v2互換性**
- `backend/utils/config.py` - CORS_ORIGINS環境変数のパース処理を修正

**2. go_router 10.2.0対応**
- `GoRouterRefreshStream` を削除（不要になった）
- `state.subloc` → `state.matchedLocation` に変更

**3. riverpod 2.6.1対応**
- `AsyncValue.error(error, stackTrace: stack)` → `AsyncValue.error(error, stack)` に変更
- 全コントローラーファイルで修正

**4. flutter_animate 4.x対応**
- `interval` パラメータを削除

**5. Flutter SDK 3.32対応**
- `TargetPlatform.macos` を削除（現在のSDKでは存在しない）
- `CardTheme` → `CardThemeData` に変更
- `const ListView` → `ListView` (constキーワード位置の修正)
- DropdownButtonFormField の `onChanged` コールバックでnullセーフティ対応

### 修正したファイル

**バックエンド:**
- `backend/utils/config.py` - Pydantic設定の修正
- `backend/.env` - 開発環境変数の設定

**フロントエンド:**
- `frontend/lib/navigation/app_shell.dart` - go_router API更新
- `frontend/lib/core/app_theme.dart` - CardThemeData、TargetPlatform修正
- `frontend/lib/core/config.dart` - API URLを localhost:8000 に設定
- `frontend/lib/screens/home/home_screen.dart` - flutter_animate修正
- `frontend/lib/screens/applications/applications_screen.dart` - const修正、onChanged修正
- `frontend/lib/screens/assignments/assignments_screen.dart` - const修正、onChanged修正
- `frontend/lib/core/controllers/applications_controller.dart` - AsyncValue.error修正
- `frontend/lib/core/controllers/assignments_controller.dart` - AsyncValue.error修正
- `frontend/lib/core/controllers/reviews_controller.dart` - AsyncValue.error修正
- `frontend/lib/core/controllers/jobs_controller.dart` - AsyncValue.error修正
- `frontend/lib/core/controllers/notifications_controller.dart` - AsyncValue.error修正
- `frontend/lib/core/controllers/payments_controller.dart` - AsyncValue.error修正

### 作成したファイル
- `frontend/lib/core/models/review.dart` - 欠落していたReviewモデル
- `.gitignore` - Python・Flutter用

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
