# fulfillment-info (prototype)

이지메디컴 풀필먼트사업부 **풀필먼트 AI 지식 공유 플랫폼** UI 프로토타입입니다.

## 실행 방법

- **메인 앱:** `index.html`을 브라우저로 열면 됩니다.
  - 로컬 파일로 열어도 동작합니다(정적 JS).
  - (권장) 로컬 서버(Live Server 등)로 열면 미리보기/새로고침이 편합니다.
- **Tailwind 메인 초안:** `index-tailwind.html` — AI 프롬프트 공유·물류 용어 검색 진입용 랜딩 페이지(Tailwind CSS).

## 구성

- `index.html`: 레이아웃(좌측 메뉴 + 우측 콘텐츠), 전체 메뉴
- `index-tailwind.html`: Tailwind 기반 메인 페이지 초안(직원 AI 공유·용어 검색)
- `styles.css`: 기본 스타일(다크 톤)
- `app.js`: 해시 기반 탭 전환 + 공지/연락처/용어집/AI 꿀팁 등
- `.cursorrules`: Cursor AI 마스터 룰(INSTRUCTION_FOR_CURSOR.md 우선, trigger.txt 확인)
- `trigger.txt`: 배달원(quant_manager 등) 진행 상태 (NEW / DONE)
- `assets/`: 로고, 파비콘

