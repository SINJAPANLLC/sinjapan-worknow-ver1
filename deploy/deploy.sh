#!/bin/bash
set -e
apt update -y
apt install -y python3-pip nginx certbot python3-certbot-nginx redis-server
pip install -r /root/worknow/backend/requirements.txt

cp /root/worknow/backend/systemd/worknow.service /etc/systemd/system/
systemctl enable worknow
systemctl start worknow

cp /root/worknow/backend/systemd/worknow.nginx.conf /etc/nginx/sites-available/worknow
ln -sf /etc/nginx/sites-available/worknow /etc/nginx/sites-enabled/worknow
nginx -t && systemctl restart nginx

certbot --nginx -d worknow.jp --non-interactive --agree-tos -m admin@worknow.jp
echo "✅ Deployment complete: https://worknow.jp"
