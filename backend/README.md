# backend — 최소 Spring 서버

> **이 폴더는 열어보지 않아도 됩니다.**
> 프론트엔드 배포 POC가 "실제로 살아있는 백엔드"에 붙는지 확인하기 위한 껍데기 서버입니다.
> Spring을 몰라도 아래 명령어 두 개면 끝납니다.

---

## 이 서버가 하는 일

엔드포인트가 **하나뿐**입니다.

```
GET /api/health
```

```json
{
  "status": "UP",
  "service": "chongchong-backend",
  "deployTarget": "ec2",
  "serverTime": "2026-08-20T14:32:11.482+09:00"
}
```

`serverTime`이 새로고침할 때마다 바뀌므로, 화면의 이 값이 갱신되면 **프론트가 실제로 서버에 다녀왔다는 증거**가 됩니다. 프론트 배포가 반영됐는지(빌드 시각·커밋)와 백엔드 연결이 살아있는지(서버 시각)를 한 화면에서 동시에 볼 수 있습니다.

---

## 실행

JDK 21 이상이 필요합니다. (`java -version`으로 확인)

```bash
cd backend
./gradlew bootRun     # Windows: gradlew.bat bootRun
```

첫 실행은 Gradle과 라이브러리를 내려받느라 몇 분 걸립니다. 아래 문구가 뜨면 성공입니다.

```
Tomcat started on port 8080
```

확인:

```bash
curl http://localhost:8080/api/health
```

종료는 터미널에서 `Ctrl+C`.

---

## 건드릴 파일은 딱 하나

[`src/main/resources/application.properties`](./src/main/resources/application.properties)

```properties
server.port=8080                 # 바꾸지 마세요 (nginx가 이 포트로 프록시합니다)
app.deploy-target=local          # 화면에 표시될 라벨: local / s3 / ec2
app.cors.allowed-origins=http://localhost:3005,http://127.0.0.1:3005
```

**버전 1(S3)을 쓴다면** 마지막 줄에 S3 웹사이트 주소를 추가해야 합니다.

```properties
app.cors.allowed-origins=http://localhost:3005,http://chongchong-frontend-poc.s3-website.ap-northeast-2.amazonaws.com
```

**버전 2(EC2 + nginx)만 쓴다면** 이 줄은 신경 쓰지 않아도 됩니다. nginx가 같은 도메인에서 `/api`를 넘겨주므로 브라우저 입장에서 남의 도메인이 아니거든요.

> 자바 파일([`ChongchongApplication.java`](./src/main/java/com/chongchong/ChongchongApplication.java))은 고칠 일이 없습니다. 궁금하면 열어보세요 — 주석 포함 80줄이고, 헬스 엔드포인트와 CORS 설정이 전부입니다.

---

## 파일 구조

```
backend/
├── build.gradle          # 의존성 선언 (spring-boot-starter-web 하나)
├── settings.gradle
├── gradlew, gradlew.bat  # Gradle 실행기 — Gradle을 따로 설치할 필요 없게 해줌
├── gradle/wrapper/
├── run-on-ec2.sh         # EC2에서 백그라운드로 띄우는 POC용 스크립트
└── src/main/
    ├── java/com/chongchong/ChongchongApplication.java   # 소스 전부
    └── resources/application.properties                  # ★ 여기만 만지면 됨
```

---

## EC2에서 띄우기 (버전 2를 테스트할 때)

EC2에 접속한 뒤:

```bash
cd backend
./run-on-ec2.sh
```

빌드 후 백그라운드로 실행하고 헬스체크까지 찍어줍니다. 로그는 `/tmp/chongchong-backend.log`.

> ⚠️ 이건 **POC용**입니다. 재부팅하면 꺼지고, 무중단 배포도 아닙니다.
> 실제 백엔드 배포(systemd 등록, 무중단 전환, 헬스체크 연동)는 백엔드 담당자의 영역입니다.
> 프론트 입장에서는 "8080에 뭔가 떠 있다"는 사실만 필요합니다.

t2.micro(램 1GB)에서 Gradle 빌드가 메모리 부족으로 죽는다면, 로컬에서 빌드한 뒤 jar만 올리는 방법도 있습니다.

```bash
# 로컬에서
./gradlew bootJar
scp -i 키.pem build/libs/chongchong-backend.jar ubuntu@<EC2-IP>:~/
# EC2에서
java -jar chongchong-backend.jar --app.deploy-target=ec2
```

---

## 자주 막히는 곳

| 증상                                      | 원인과 해결                                                                 |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| `./gradlew: Permission denied`             | `chmod +x gradlew`                                                          |
| `Unsupported class file major version`     | JDK가 21보다 낮음. `java -version` 확인 후 21 이상 설치                     |
| 화면에 "연결 실패 (Failed to fetch)"       | 서버가 안 떠 있거나, S3 버전인데 CORS 주소를 안 넣음                        |
| 브라우저 콘솔에 CORS 에러                  | `app.cors.allowed-origins`에 프론트 주소를 **정확히** (포트까지) 추가        |
| HTTPS 페이지에서 HTTP API 호출이 차단됨    | 브라우저의 mixed content 정책. 양쪽 다 HTTPS여야 함                          |
| `Port 8080 was already in use`             | 이미 떠 있음. `pkill -f chongchong-backend.jar` 또는 기존 터미널에서 `Ctrl+C` |
