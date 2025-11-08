# WORK NOW｜働くに、彩りを

FastAPI + Flutter を中核に、Stripe Connect / Firebase / Supabase を組み合わせた即戦力マッチング&報酬プラットフォームです。詳細要件は `docs/requirements.md`、RLS サンプルは `docs/supabase_policies.sql` を参照してください。

## ディレクトリ
- `backend`: FastAPI アプリケーション
  - `routers` / `services` / `schemas` / `utils`
  - `db/schema.sql`: Supabase(PostgreSQL) スキーマ定義
  - `tests`: pytest による API テスト
  - `systemd`: Hostinger 向け gunicorn / nginx 設定
- `frontend`: Flutter アプリ (iOS/Android/Web、Riverpod/GoRouter 構成)
  - `core/`: API クライアント、状態管理、テーマ、プロバイダ
  - `screens/`: ログイン・ホーム・求人・応募・割当・レビュー・通知・ウォレット・プロフィール・管理ダッシュボードなど UI 一式
    - ホームを起点としたクイックアクション + ボトムナビゲーション（ホーム / 求人 / 応募 / 通知 / プロフィール）でモバイルアプリ風に遷移
  - `test/`: ウィジェットテスト (`flutter test`)
  - `web/`: PWA 用 `index.html` / `manifest.json`（ホーム画面追加時にフルスクリーン起動）
- `deploy`: サーバーセットアップやスキーマ適用スクリプト
- `docs`: 要件・Supabase RLS ポリシーなどドキュメント

## バックエンド セットアップ
```bash
cd backend
cp .env.example .env   # Supabase / Stripe / Firebase / JWT などを本番値に更新
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
pytest                  # 単体テスト
uvicorn main:app --reload
```

### Supabase
- `deploy/apply_schema.sh` に `DATABASE_URL` を設定して実行することで `db/schema.sql` を適用できます。
- `docs/supabase_policies.sql` に代表的な RLS ポリシーを記載。環境に合わせて調整してください。
- Storage や Auth の設定 (メールテンプレート、OAuth 等) は Supabase ダッシュボードで実施します。

### Stripe
- Connect Express アカウントを有効化し、リダイレクト先 `/reauth` `/complete` をフロント側で実装。
- Webhook (`https://<domain>/payments/webhook`) に `payment_intent.*`, `charge.*`, `account.updated` 等を登録し、シークレットを `.env` へ。

### Firebase
- サービスアカウント JSON を `.env` の `FIREBASE_KEY` に設定 (Base64 化でも可)。
- FCM トークンは Flutter 側から `/notifications/token` で登録し、Push 通知を配信。

### Redis
- `REDIS_URL` を設定すれば、キャッシュ/レートリミット用途に利用可能 (必要に応じて依存を追加)。

## フロントエンド
```bash
cd frontend
flutter pub get
flutter analyze
flutter test
flutter run -d chrome  # 例: Web 実行
```
- `core/` に API クライアント、状態管理、テーマを実装済み。
- `screens/` でログイン/ホーム/求人/応募/割当/通知/ウォレット/プロフィール/管理ダッシュボードなどの画面を提供。
- `analysis_options.yaml` と `flutter_lints` により静的解析ルールを適用。
- Web/PWA: `web/manifest.json` の `display: fullscreen` を設定済み。`web/icons/Icon-192.png` / `Icon-512.png` を本番アイコンに差し替えて HTTPS で配信し、`flutter build web --release` の成果物を公開するとホーム画面追加時にアドレスバー無しで起動します。

## CI / QA
- `.github/workflows/ci.yml` で Python (pytest) と Flutter (`flutter analyze` / `flutter test`) の CI を自動実行。
- バックエンド: `pytest`
- Flutter: `flutter test` / 必要に応じて `integration_test`

## デプロイ (Hostinger VPS 例)
```bash
ssh <host>
sudo mkdir -p /root/worknow
# リポジトリを配置後
cd /root/worknow
./deploy/apply_schema.sh   # DATABASE_URL を設定した状態で実行
./deploy/deploy.sh
```
- `systemd/worknow.service` が gunicorn + UvicornWorker を常駐化
- `systemd/worknow.nginx.conf` を `/etc/nginx/sites-available/worknow` へ配置し有効化
- `certbot` が自動で Let’s Encrypt 証明書を取得

## 運用のヒント
- 監視: `/health` を UptimeRobot 等で監視。ログは Supabase / Cloud Logging 等に集約。
- Stripe / Firebase / Supabase の各種ダッシュボードで Webhook・通知ログを必ず確認。
- 定期的に `pytest` / `flutter test` を実行し、CI のアラートも監視してください。
