# Work Now - VPSデプロイメントガイド

## 📋 目次
1. [前提条件](#前提条件)
2. [セットアップ手順](#セットアップ手順)
3. [手動デプロイ手順](#手動デプロイ手順)
4. [環境変数の設定](#環境変数の設定)
5. [トラブルシューティング](#トラブルシューティング)
6. [メンテナンス](#メンテナンス)

---

## 前提条件

### サーバー情報
- **VPS**: Hostinger
- **SSH**: `ssh root@212.85.24.206`
- **ドメイン**: sinjapan-worknow.com
- **フロントエンドポート**: 20000
- **バックエンドポート**: 8008
- **GitHubリポジトリ**: https://github.com/SINJAPANLLC/sinjapan-worknow-ver1.git

### 必要な情報
- PostgreSQLデータベース認証情報
- Stripe APIキー（支払い機能）
- Firebase認証情報（プッシュ通知）
- SMTPメール設定
- JWT Secret Key

---

## セットアップ手順

### 🚀 自動セットアップ（推奨）

1. **VPSにSSH接続**
   ```bash
   ssh root@212.85.24.206
   ```

2. **セットアップスクリプトをダウンロード**
   ```bash
   cd /tmp
   git clone https://github.com/SINJAPANLLC/sinjapan-worknow-ver1.git
   cd sinjapan-worknow-ver1
   ```

3. **セットアップスクリプトを実行**
   ```bash
   chmod +x deployment/setup.sh
   sudo bash deployment/setup.sh
   ```

4. **環境変数を設定**
   ```bash
   cd /var/www/worknow
   nano .env
   ```
   
   `.env.production.template`を参考に、本番環境の値を設定してください。

5. **PostgreSQLパスワードを変更**
   ```bash
   sudo -u postgres psql
   ALTER USER worknow_user WITH PASSWORD 'your_new_secure_password';
   \q
   ```

6. **サービスを再起動**
   ```bash
   sudo systemctl restart worknow-backend
   sudo systemctl restart worknow-frontend
   sudo systemctl restart nginx
   ```

7. **動作確認**
   - ブラウザで `https://sinjapan-worknow.com` にアクセス
   - APIエンドポイント: `https://sinjapan-worknow.com/api/docs`

---

## 手動デプロイ手順

自動セットアップスクリプトを使用しない場合：

### 1. システムの更新とパッケージインストール

```bash
# システム更新
sudo apt update && sudo apt upgrade -y

# 必要なパッケージをインストール
sudo apt install -y git nginx postgresql postgresql-contrib \
    python3 python3-pip python3-venv nodejs npm \
    certbot python3-certbot-nginx ufw fail2ban

# Node.js 20.xをインストール
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs
```

### 2. ファイアウォール設定

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### 3. PostgreSQLデータベース作成

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE worknow_production;
CREATE USER worknow_user WITH PASSWORD 'your_secure_password';
ALTER ROLE worknow_user SET client_encoding TO 'utf8';
ALTER ROLE worknow_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE worknow_user SET timezone TO 'Asia/Tokyo';
GRANT ALL PRIVILEGES ON DATABASE worknow_production TO worknow_user;
\c worknow_production
GRANT ALL ON SCHEMA public TO worknow_user;
\q
```

### 4. アプリケーションのクローンとセットアップ

```bash
# ディレクトリ作成
sudo mkdir -p /var/www/worknow
cd /var/www/worknow

# GitHubからクローン
sudo git clone https://github.com/SINJAPANLLC/sinjapan-worknow-ver1.git .

# Python仮想環境のセットアップ
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### 5. フロントエンドのビルド

```bash
cd frontend
npm install
npm run build

# プロダクション用サーバーのセットアップ
mkdir -p dist-server
npm install express --save
```

`frontend/dist-server/server.js`を作成:

```javascript
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 20000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Frontend server running on http://${HOST}:${PORT}`);
});
```

### 6. 環境変数の設定

```bash
cd /var/www/worknow
cp .env.production.template .env
nano .env
```

### 7. systemdサービスの設定

```bash
# バックエンドサービス
sudo cp deployment/worknow-backend.service /etc/systemd/system/
sudo cp deployment/worknow-frontend.service /etc/systemd/system/

# サービスの有効化
sudo systemctl daemon-reload
sudo systemctl enable worknow-backend
sudo systemctl enable worknow-frontend
sudo systemctl start worknow-backend
sudo systemctl start worknow-frontend
```

### 8. Nginxの設定

```bash
# Nginx設定をコピー
sudo cp deployment/nginx.conf /etc/nginx/sites-available/worknow
sudo ln -s /etc/nginx/sites-available/worknow /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 設定のテスト
sudo nginx -t

# Nginxを再起動
sudo systemctl restart nginx
```

### 9. SSL証明書の取得

```bash
sudo certbot --nginx -d sinjapan-worknow.com -d www.sinjapan-worknow.com
```

### 10. 権限設定

```bash
# アップロードディレクトリ
sudo mkdir -p /var/www/worknow/backend/uploads
sudo chown -R www-data:www-data /var/www/worknow
```

---

## 環境変数の設定

`.env`ファイルに設定が必要な主要項目：

### 必須項目

```bash
# データベース
DATABASE_URL=postgresql://worknow_user:your_password@localhost:5432/worknow_production

# JWT認証
SECRET_KEY=minimum_32_characters_random_string_change_this_immediately

# サーバー
BACKEND_URL=https://sinjapan-worknow.com/api
FRONTEND_URL=https://sinjapan-worknow.com
```

### オプション項目

```bash
# Stripe（支払い機能）
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Firebase（プッシュ通知）
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# メール送信
SMTP_HOST=smtp.gmail.com
SMTP_USER=noreply@sinjapan-worknow.com
SMTP_PASSWORD=your_app_password
```

---

## トラブルシューティング

### サービスのステータス確認

```bash
# バックエンドの状態
sudo systemctl status worknow-backend

# フロントエンドの状態
sudo systemctl status worknow-frontend

# Nginxの状態
sudo systemctl status nginx
```

### ログの確認

```bash
# バックエンドログ
sudo journalctl -u worknow-backend -f

# フロントエンドログ
sudo journalctl -u worknow-frontend -f

# Nginxエラーログ
sudo tail -f /var/log/nginx/worknow_error.log

# Nginxアクセスログ
sudo tail -f /var/log/nginx/worknow_access.log
```

### よくある問題

#### 1. バックエンドが起動しない

```bash
# 環境変数を確認
cat /var/www/worknow/.env

# データベース接続を確認
sudo -u postgres psql -d worknow_production

# サービスを再起動
sudo systemctl restart worknow-backend
sudo journalctl -u worknow-backend -n 50
```

#### 2. フロントエンドが表示されない

```bash
# ビルドを再実行
cd /var/www/worknow/frontend
npm run build

# サービスを再起動
sudo systemctl restart worknow-frontend
```

#### 3. SSL証明書エラー

```bash
# 証明書を更新
sudo certbot renew

# Nginxを再起動
sudo systemctl restart nginx
```

#### 4. 502 Bad Gateway エラー

```bash
# バックエンドが起動しているか確認
curl http://localhost:8008/api/docs

# フロントエンドが起動しているか確認
curl http://localhost:20000

# Nginx設定を確認
sudo nginx -t
```

---

## メンテナンス

### コードの更新

```bash
cd /var/www/worknow
git pull origin main

# バックエンドの依存関係を更新
source venv/bin/activate
pip install -r backend/requirements.txt

# フロントエンドの再ビルド
cd frontend
npm install
npm run build

# サービスを再起動
sudo systemctl restart worknow-backend
sudo systemctl restart worknow-frontend
```

### データベースのバックアップ

```bash
# バックアップ作成
sudo -u postgres pg_dump worknow_production > backup_$(date +%Y%m%d_%H%M%S).sql

# リストア
sudo -u postgres psql worknow_production < backup_YYYYMMDD_HHMMSS.sql
```

### SSL証明書の自動更新

```bash
# 自動更新タイマーが有効か確認
sudo systemctl status certbot.timer

# 手動で更新をテスト
sudo certbot renew --dry-run
```

### ログのローテーション

```bash
# システムログのクリア（古いログの削除）
sudo journalctl --vacuum-time=7d
```

---

## セキュリティ推奨事項

1. **Fail2Ban設定**: SSH/Nginx攻撃からの保護
   ```bash
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

2. **定期的なシステム更新**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **強力なパスワード使用**: データベース、JWT Secret Keyなど

4. **環境変数の保護**: `.env`ファイルの権限を制限
   ```bash
   sudo chmod 600 /var/www/worknow/.env
   ```

5. **定期的なバックアップ**: データベースとアップロードファイル

---

## 連絡先・サポート

問題が発生した場合:
- GitHubリポジトリ: https://github.com/SINJAPANLLC/sinjapan-worknow-ver1
- メール: support@sinjapan-worknow.com

---

**最終更新**: 2025年11月9日
**バージョン**: 1.0.0
