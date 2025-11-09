#!/bin/bash

# ========================================
# Work Now VPSセットアップスクリプト
# ========================================
# Hostinger VPS用の自動セットアップスクリプト
# 使用方法: sudo bash setup.sh

set -e

echo "========================================="
echo "Work Now VPSセットアップを開始します"
echo "========================================="

# カラー設定
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ========================================
# 1. システムの更新
# ========================================
echo -e "${GREEN}[1/10] システムを更新中...${NC}"
apt update && apt upgrade -y

# ========================================
# 2. 必要なパッケージのインストール
# ========================================
echo -e "${GREEN}[2/10] 必要なパッケージをインストール中...${NC}"
apt install -y \
    git \
    nginx \
    postgresql \
    postgresql-contrib \
    python3 \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban

# Node.js 20.xをインストール（推奨バージョン）
echo -e "${GREEN}Node.js 20.xをインストール中...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# ========================================
# 3. ファイアウォール設定
# ========================================
echo -e "${GREEN}[3/10] ファイアウォールを設定中...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ========================================
# 4. PostgreSQLの設定
# ========================================
echo -e "${GREEN}[4/10] PostgreSQLを設定中...${NC}"
sudo -u postgres psql <<EOF
CREATE DATABASE worknow_production;
CREATE USER worknow_user WITH PASSWORD 'Change_This_Password_123!';
ALTER ROLE worknow_user SET client_encoding TO 'utf8';
ALTER ROLE worknow_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE worknow_user SET timezone TO 'Asia/Tokyo';
GRANT ALL PRIVILEGES ON DATABASE worknow_production TO worknow_user;
\c worknow_production
GRANT ALL ON SCHEMA public TO worknow_user;
EOF

echo -e "${YELLOW}⚠️  PostgreSQLのパスワードを必ず変更してください！${NC}"

# ========================================
# 5. アプリケーションディレクトリの作成
# ========================================
echo -e "${GREEN}[5/10] アプリケーションディレクトリを作成中...${NC}"
mkdir -p /var/www/worknow
cd /var/www/worknow

# ========================================
# 6. GitHubからコードをクローン
# ========================================
echo -e "${GREEN}[6/10] GitHubからコードをクローン中...${NC}"
if [ -d ".git" ]; then
    echo "既存のリポジトリを更新中..."
    git pull
else
    git clone https://github.com/SINJAPANLLC/sinjapan-worknow-ver1.git .
fi

# ========================================
# 7. Python環境のセットアップ
# ========================================
echo -e "${GREEN}[7/10] Python仮想環境をセットアップ中...${NC}"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

# ========================================
# 8. Node.js依存関係のインストールとビルド
# ========================================
echo -e "${GREEN}[8/10] フロントエンドをビルド中...${NC}"
cd frontend
npm install
npm run build

# プロダクション用のExpressサーバーを作成
cat > dist-server/server.js << 'SERVERJS'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 20000;
const HOST = process.env.HOST || '0.0.0.0';

// 静的ファイルの配信
app.use(express.static(path.join(__dirname, '../dist')));

// すべてのルートをindex.htmlにリダイレクト（SPA対応）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(\`Frontend server running on http://\${HOST}:\${PORT}\`);
});
SERVERJS

mkdir -p dist-server
npm install express --save

cd ..

# ========================================
# 9. 環境変数の設定
# ========================================
echo -e "${GREEN}[9/10] 環境変数を設定中...${NC}"
if [ ! -f ".env" ]; then
    cp .env.production.template .env
    echo -e "${YELLOW}⚠️  .env ファイルを編集して本番環境の値を設定してください！${NC}"
else
    echo ".env ファイルは既に存在します"
fi

# アップロードディレクトリの作成
mkdir -p backend/uploads
chown -R www-data:www-data backend/uploads
chmod -R 755 backend/uploads

# ========================================
# 10. systemdサービスとNginxの設定
# ========================================
echo -e "${GREEN}[10/10] systemdサービスとNginxを設定中...${NC}"

# systemdサービスファイルをコピー
cp deployment/worknow-backend.service /etc/systemd/system/
cp deployment/worknow-frontend.service /etc/systemd/system/

# Nginx設定をコピー
cp deployment/nginx.conf /etc/nginx/sites-available/worknow
ln -sf /etc/nginx/sites-available/worknow /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx設定のテスト
nginx -t

# 権限設定
chown -R www-data:www-data /var/www/worknow

# サービスの有効化と起動
systemctl daemon-reload
systemctl enable worknow-backend
systemctl enable worknow-frontend
systemctl start worknow-backend
systemctl start worknow-frontend
systemctl restart nginx

# ========================================
# SSL証明書の取得（Let's Encrypt）
# ========================================
echo -e "${GREEN}SSL証明書を取得中...${NC}"
echo -e "${YELLOW}メールアドレスを入力してください:${NC}"
read -p "Email: " email

certbot --nginx -d sinjapan-worknow.com -d www.sinjapan-worknow.com --non-interactive --agree-tos -m "$email"

# 証明書の自動更新を設定
systemctl enable certbot.timer

# ========================================
# 完了
# ========================================
echo ""
echo "========================================="
echo -e "${GREEN}✅ セットアップが完了しました！${NC}"
echo "========================================="
echo ""
echo "次のステップ:"
echo "1. /var/www/worknow/.env を編集して本番環境の値を設定"
echo "2. PostgreSQLのパスワードを変更"
echo "3. サービスの状態を確認:"
echo "   sudo systemctl status worknow-backend"
echo "   sudo systemctl status worknow-frontend"
echo "4. ログを確認:"
echo "   sudo journalctl -u worknow-backend -f"
echo "   sudo journalctl -u worknow-frontend -f"
echo ""
echo "アクセスURL: https://sinjapan-worknow.com"
echo "========================================="
