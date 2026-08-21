import { useEffect, useState } from "react";

/**
 * 배포가 반영됐는지 확인하기 위한 최소 화면.
 *
 * ▶ POC 사용법: 아래 MESSAGE 를 아무렇게나 수정하고 main 브랜치에 push 한 뒤,
 *   배포된 주소를 새로고침해서 문구가 바뀌는지 확인하면 된다.
 */
const MESSAGE = "김동은 컴퓨터";

export default function App() {
  const [apiStatus, setApiStatus] = useState("확인 중...");

  useEffect(() => {
    fetch(`${__API_BASE__}/health`)
      .then((res) => setApiStatus(res.ok ? "연결 성공" : `응답 ${res.status}`))
      .catch(() => setApiStatus("연결 실패 (백엔드 미확인 상태면 정상)"));
  }, []);

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 480,
        margin: "80px auto",
        padding: 24,
        lineHeight: 1.7,
      }}
    >
      <h1 style={{ fontSize: 22 }}>{MESSAGE}</h1>
      <dl style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 4 }}>
        <dt>커밋</dt>
        <dd>{__BUILD_INFO__.commit}</dd>
        <dt>빌드 시각</dt>
        <dd>{__BUILD_INFO__.builtAt}</dd>
        <dt>배포 대상</dt>
        <dd>{__BUILD_INFO__.target}</dd>
        <dt>API</dt>
        <dd>
          {__API_BASE__} → {apiStatus}
        </dd>
      </dl>
    </main>
  );
}
