# WORK NOW - Replit環境セットアップ状況

## プロジェクト概要
即戦力マッチング&報酬プラットフォーム
- **バックエンド**: FastAPI (Python) - ポート8000
- **フロントエンド**: Flutter Web - ポート5000
- **データベース**: Supabase (PostgreSQL)
- **決済**: Stripe Connect
- **通知**: Firebase

## 最新の変更 (2025-11-08)

### 完了した設定
1. ✅ Python 3.11とFlutterのインストール
2. ✅ Python依存関係のインストール (FastAPI, Uvicorn, Supabase, Stripe, etc.)
3. ✅ Flutter依存関係のインストール
4. ✅ backend/.envファイルの作成 (開発環境用)
5. ✅ Flutter設定をReplitドメインに更新 (frontend/lib/core/config.dart)
6. ✅ Pydantic v2互換性修正 (backend/utils/config.py)
7. ✅ バックエンドワークフロー設定 (localhost:8000)
8. ✅ フロントエンドワークフロー設定 (0.0.0.0:5000)
9. ✅ .gitignoreファイルの作成
10. ✅ デプロイ設定の構成

### バックエンドの状態
**✅ 正常動作中**
- ポート: 8000 (localhost)
- 起動コマンド: `cd backend && python -m uvicorn main:app --host localhost --port 8000 --reload`
- 必要な環境変数は backend/.env に設定済み
- APIヘルスチェック: http://localhost:8000/health が正常応答

### フロントエンドの状態
**❌ コンパイルエラー (パッケージAPI互換性問題)**

フロントエンドのコードは古いパッケージバージョン（おそらくgo_router 6.x以前、flutter_animate 3.x、riverpod 2.0.x）用に書かれており、現在インストールされているバージョンと互換性がありません。

#### 残っている主な互換性問題:

**1. go_router (現在10.2.0):**
- `GoRouterRefreshStream` が削除されている → `Listenable`を直接使用する必要がある
- `state.subloc` が非推奨/削除 → `state.matchedLocation`を使用

**2. riverpod (現在2.6.1):**
- `AsyncValue.error()` が2つの位置引数を必要とする → `AsyncValue.error(error, stackTrace)`に修正

**3. flutter_animate (現在4.x):**
- `interval` パラメータが削除されている

**4. Flutter SDK:**
- `TargetPlatform.macos` の変更
- `CardTheme` vs `CardThemeData` 型の不一致

#### 影響を受けるファイル:
- `frontend/lib/navigation/app_shell.dart` (go_router API)
- `frontend/lib/core/app_theme.dart` (TargetPlatform.macos, CardTheme)
- `frontend/lib/screens/home/home_screen.dart` (flutter_animate)
- `frontend/lib/core/controllers/*_controller.dart` (AsyncValue.error)
- その他多数

### 作成したファイル:
- `frontend/lib/core/models/review.dart` - 欠落していたReviewモデル
- `frontend/lib/assets/lang/` - 空のディレクトリ
- `frontend/lib/assets/lottie/` - 空のディレクトリ

### 修正したファイル:
- `frontend/lib/screens/applications/applications_screen.dart` - マルチライン文字列エラー修正
- `frontend/lib/screens/assignments/assignments_screen.dart` - マルチライン文字列エラー修正

## フロントエンド修正の選択肢

### オプション1: パッケージのダウングレード（最も速い）
```yaml
dependencies:
  flutter_riverpod: ^2.0.0  # 2.6.1から
  go_router: ^6.0.0         # 10.2.0から
  flutter_animate: ^3.0.0   # 4.xから
```
**注意**: 古いバージョンは現在のFlutter SDK 3.32と互換性がない可能性があります。

### オプション2: コード全面更新（時間がかかるが推奨）
以下を含む100以上のファイルの更新が必要:
- go_router: `GoRouterRefreshStream` → `Listenable`, `subloc` → `matchedLocation`
- riverpod: `AsyncValue.error(error, stackTrace: stack)` → `AsyncValue.error(error, stack)`
- flutter_animate: `interval` パラメータを削除
- その他のAPI変更に対応

## 環境変数
`backend/.env`に以下を設定:
- SUPABASE_URL, SUPABASE_KEY
- STRIPE_API_KEY, STRIPE_CONNECT_CLIENT_ID, STRIPE_WEBHOOK_SECRET
- FIREBASE_KEY
- JWT_SECRET
- DOMAIN (Replitドメイン)
- CORS_ORIGINS (カンマ区切りリスト)

## ワークフロー
- **backend**: バックエンドAPI (ポート8000) - ✅ 動作中
- **frontend**: Flutter Webアプリ (ポート5000) - ❌ コンパイルエラー

## デプロイ設定
VMデプロイ設定済み (バックエンドとフロントエンドの両方を起動)
**注意**: フロントエンドが動作しないため、現在はデプロイできません。

## 次のステップ
1. フロントエンドのパッケージ互換性問題を解決する
2. フロントエンドのコンパイルエラーを修正する
3. 両方のワークフローが正常動作することを確認する
4. デプロイメントテスト
