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

### フロントエンドの状態
**⚠️ コンパイルエラー (パッケージ互換性問題)**

フロントエンドのコードは古いパッケージバージョン用に書かれており、現在インストールされている新しいバージョンと互換性がありません:

#### 主な互換性問題:
1. **go_router 13.x**: `GoRouterRefreshStream`と`subloc`が非推奨/削除
2. **riverpod 2.6.x**: `AsyncValue.error()`のシグネチャ変更
3. **flutter_animate 4.x**: `interval`パラメータが削除
4. **Flutter SDK更新**: `TargetPlatform.macos`の変更、CardTheme API変更

#### 作成したファイル:
- `frontend/lib/core/models/review.dart` - 欠落していたReviewモデルを追加
- `frontend/lib/assets/lang/` - 空のディレクトリ作成
- `frontend/lib/assets/lottie/` - 空のディレクトリ作成

#### 修正したファイル:
- `frontend/lib/screens/applications/applications_screen.dart` - マルチライン文字列エラー修正
- `frontend/lib/screens/assignments/assignments_screen.dart` - マルチライン文字列エラー修正

### 次のステップ
フロントエンドを動作させるには、以下のいずれかが必要:

**オプション1: パッケージのダウングレード**
```yaml
# frontend/pubspec.yaml で古いバージョンを指定
flutter_riverpod: ^2.0.0
go_router: ^6.0.0
flutter_animate: ^3.0.0
```

**オプション2: コード更新** 
新しいAPIに合わせてコードを全面的に更新:
- go_router: `Listenable`を使用、`matchedLocation`を使用
- riverpod: `AsyncValue.error(error, stackTrace)`に修正
- flutter_animate: `interval`パラメータを削除
- その他のAPI変更に対応

## 環境変数
`backend/.env`に以下を設定:
- SUPABASE_URL, SUPABASE_KEY
- STRIPE_API_KEY, STRIPE_CONNECT_CLIENT_ID, STRIPE_WEBHOOK_SECRET
- FIREBASE_KEY
- JWT_SECRET
- DOMAIN (Replitドメイン)
- CORS_ORIGINS

## ワークフロー
- **backend**: バックエンドAPI (ポート8000)
- **frontend**: Flutter Webアプリ (ポート5000) - 現在エラー

## デプロイ設定
VMデプロイ設定済み (バックエンドとフロントエンドの両方を起動)
