# fulfillment-info 환경 분석

**분석 일시:** Quantlab 총사령관 지시 수행 시점

## 1. 프로젝트 구조 요약

| 구분 | 내용 |
|------|------|
| **프로젝트명** | fulfillment-info (풀필먼트 AI 지식 공유 플랫폼 프로토타입) |
| **웹 프레임워크** | **HTML + Vanilla JavaScript + CSS** (React/Vue 등 SPA 프레임워크 미사용) |
| **라우팅** | 해시 기반 단일 페이지 (#notices, #dashboard, #ai-study 등) |
| **스타일** | styles.css (커스텀 CSS, 다크 톤). Tailwind 초안은 별도 파일 제공. |

## 2. 주요 파일

| 파일 | 역할 |
|------|------|
| `index.html` | 메인 레이아웃(좌측 사이드바 + 우측 콘텐츠), 진입점 |
| `app.js` | 탭 렌더링, 공지/연락처/용어집/AI 꿀팁 등 데이터·UI 로직 |
| `styles.css` | 전역 스타일, 카드/테이블/모달 등 |
| `assets/` | 로고, 파비콘 등 정적 자산 |
| `docs/` | 기획·아이디어 문서 (AI-현장-혁신-아이디어-발굴.md 등) |

## 3. 외부 연동

- **Leaflet**: 지도(물류센터 위치)
- **Chart.js + chartjs-plugin-zoom**: 날씨 대시보드 차트
- **Hammer.js**: 차트 팬/줌
- **Open-Meteo API**: 날씨
- **rss2json + Google News RSS**: 물류 뉴스 클리핑
- **Gemini API** (선택): 챗봇

## 4. 결론

- **프레임워크:** React 아님. **HTML/JS/CSS 기반 정적 SPA 형태**.
- **Tailwind 도입:** 신규 초안은 `index-tailwind.html`에서 Tailwind CDN으로 구현. 기존 `index.html`은 유지하여 바로 실행 가능 상태 보장.
