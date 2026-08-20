#!/usr/bin/env bash
# EC2 인스턴스에 SSH로 접속한 뒤 "딱 한 번" 실행하는 초기 세팅 스크립트.
# (Ubuntu 22.04 / 24.04 기준, 기본 계정 ubuntu)
set -e

sudo apt-get update
sudo apt-get install -y nginx

# 배포 디렉터리 준비 — GitHub Actions가 ubuntu 계정으로 쓸 수 있어야 한다
sudo mkdir -p /var/www/chongchong/releases
sudo chown -R ubuntu:ubuntu /var/www/chongchong

# 첫 배포 전에도 nginx가 뜨도록 빈 릴리스를 하나 만들어 둔다
INIT=/var/www/chongchong/releases/000000000000
mkdir -p "$INIT"
echo '<h1>waiting for first deploy</h1>' > "$INIT/index.html"
ln -sfn "$INIT" /var/www/chongchong/current

# nginx가 /var/www 하위를 읽을 수 있도록 실행 권한 보장
sudo chmod 755 /home/ubuntu /var/www /var/www/chongchong

# 설정 적용
sudo cp "$(dirname "$0")/nginx/chongchong.conf" /etc/nginx/sites-available/chongchong
sudo ln -sfn /etc/nginx/sites-available/chongchong /etc/nginx/sites-enabled/chongchong
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "완료. http://<EC2 퍼블릭 IP> 로 접속되면 성공."
