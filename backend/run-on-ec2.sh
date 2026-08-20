#!/usr/bin/env bash
# EC2에서 백엔드를 띄우는 POC용 스크립트.
#
# ⚠️ 이건 "프론트 배포를 확인하기 위해 백엔드를 살려두는" 최소 방법입니다.
#    실제 백엔드 배포(무중단, systemd, 헬스체크 등)는 백엔드 담당자의 영역입니다.
set -e

cd "$(dirname "$0")"

echo "▶ 빌드 중... (첫 실행은 의존성 다운로드로 몇 분 걸립니다)"
./gradlew bootJar -q

echo "▶ 기존 프로세스 종료"
pkill -f chongchong-backend.jar || true
sleep 2

echo "▶ 백그라운드 실행"
nohup java -jar build/libs/chongchong-backend.jar \
  --app.deploy-target=ec2 \
  > /tmp/chongchong-backend.log 2>&1 &

sleep 8
echo "▶ 확인:"
curl -s http://127.0.0.1:8080/api/health && echo
echo
echo "로그: tail -f /tmp/chongchong-backend.log"
