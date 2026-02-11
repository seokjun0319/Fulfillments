const ROUTES = {
  notices: {
    title: "주요 공지사항",
    desc: "최신 공지와 공지사항 목록을 빠르게 확인합니다.",
    render: () => `
      <div class="grid">
        <div class="card card--wide">
          <h3 class="card__title">최신 공지</h3>
          <div class="card__body">
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:10px;">
              <span class="tag good">중요</span>
              <span class="tag">운영</span>
              <span class="muted">2026-02-10</span>
            </div>
            <b>[더미]</b> 금주 출고 컷오프 시간 변경 안내 (센터별 상이)
            <div class="muted" style="margin-top:8px;">본문/첨부/링크 영역은 추후 연결</div>
          </div>
        </div>
        <div class="card">
          <h3 class="card__title">바로가기</h3>
          <div class="card__body">
            - 공지 작성/승인 프로세스(더미)<br/>
            - 변경 이력(더미)<br/>
            - 자주 묻는 질문(더미)
          </div>
        </div>
        <div class="card card--full">
          <h3 class="card__title">공지사항 목록</h3>
          <div class="card__body" style="margin-bottom:10px;">테이블/필터/검색 UI는 추후 고도화</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width:120px;">구분</th>
                <th>제목</th>
                <th style="width:120px;">작성일</th>
                <th style="width:120px;">상태</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>운영</td><td>[더미] 반품 입고 기준 변경</td><td>2026-02-08</td><td><span class="tag warn">공지중</span></td></tr>
              <tr><td>시스템</td><td>[더미] WMS 점검 안내</td><td>2026-02-05</td><td><span class="tag">종료</span></td></tr>
              <tr><td>안전</td><td>[더미] 센터 안전교육 안내</td><td>2026-02-01</td><td><span class="tag">종료</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
  },
  dashboard: {
    title: "대시보드",
    desc: "SLA, KPI, 사업부 손익, 물동량 등 주요 지표를 한눈에 봅니다.",
    render: () => `
      <div class="grid">
        <div class="card card--wide">
          <h3 class="card__title">핵심 지표 (더미)</h3>
          <div class="card__body">실데이터 연동 전까지는 레이아웃/카드 구성만 둡니다.</div>
          <div class="kpis">
            <div class="pill">
              <div class="pill__k">SLA</div>
              <div class="pill__v">98.7%</div>
              <div class="pill__s"><span class="tag good">양호</span></div>
            </div>
            <div class="pill">
              <div class="pill__k">KPI(피킹 정확도)</div>
              <div class="pill__v">99.4%</div>
              <div class="pill__s"><span class="tag good">양호</span></div>
            </div>
            <div class="pill">
              <div class="pill__k">물동량(일)</div>
              <div class="pill__v">12,480</div>
              <div class="pill__s"><span class="tag warn">증가</span></div>
            </div>
            <div class="pill">
              <div class="pill__k">손익(월)</div>
              <div class="pill__v">+₩ 1.2억</div>
              <div class="pill__s"><span class="tag">추정</span></div>
            </div>
          </div>
        </div>
        <div class="card">
          <h3 class="card__title">차트 영역</h3>
          <div class="card__body">라인/바 차트가 들어갈 자리 (더미)</div>
          <div style="height:140px; margin-top:10px; border-radius: 14px; border:1px dashed rgba(255,255,255,0.18); background: rgba(0,0,0,0.12);"></div>
        </div>
        <div class="card card--full">
          <h3 class="card__title">상세 테이블</h3>
          <table class="table">
            <thead>
              <tr>
                <th>지표</th><th>현재</th><th>목표</th><th>추세</th><th>비고</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>SLA</td><td>98.7%</td><td>98.5%</td><td><span class="tag good">상향</span></td><td>센터 A 개선</td></tr>
              <tr><td>오출고율</td><td>0.12%</td><td>0.10%</td><td><span class="tag warn">보합</span></td><td>교육 진행</td></tr>
              <tr><td>리드타임</td><td>1.6일</td><td>1.5일</td><td><span class="tag bad">하향</span></td><td>피크 영향</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
  },
  simulator: {
    title: "시뮬레이터",
    desc: "물동량 포케스팅, 스태핑(인력) 계획 등을 시뮬레이션합니다.",
    render: () => `
      <div class="grid">
        <div class="card card--wide">
          <h3 class="card__title">입력(더미)</h3>
          <div class="card__body">
            <div style="display:grid; grid-template-columns: repeat(12, 1fr); gap: 10px; margin-top: 10px;">
              <div style="grid-column: span 6;">
                <div class="muted" style="margin-bottom:6px;">예상 물동량(일)</div>
                <div style="padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.04);">12,000</div>
              </div>
              <div style="grid-column: span 6;">
                <div class="muted" style="margin-bottom:6px;">근무조/시간</div>
                <div style="padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.04);">2교대 / 8h</div>
              </div>
              <div style="grid-column: span 12;">
                <div class="muted" style="margin-bottom:6px;">가정/제약조건</div>
                <div style="padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.04);">피킹 1인당 250라인/일, 포장 1인당 180박스/일 ...</div>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <h3 class="card__title">결과(더미)</h3>
          <div class="card__body">
            <div class="kpis">
              <div class="pill"><div class="pill__k">필요 인력</div><div class="pill__v">43명</div><div class="pill__s"><span class="tag">추정</span></div></div>
              <div class="pill"><div class="pill__k">예상 SLA</div><div class="pill__v">98.1%</div><div class="pill__s"><span class="tag warn">주의</span></div></div>
            </div>
          </div>
        </div>
        <div class="card card--full">
          <h3 class="card__title">그래프 자리(더미)</h3>
          <div style="height:200px; border-radius: 14px; border:1px dashed rgba(255,255,255,0.18); background: rgba(0,0,0,0.12);"></div>
        </div>
      </div>
    `,
  },
  centers: {
    title: "센터 및 조직소개",
    desc: "물류센터 현황과 조직도를 공유합니다.",
    render: () => `
      <div class="grid">
        <div class="card card--wide">
          <h3 class="card__title">물류센터 현황 (더미)</h3>
          <table class="table">
            <thead>
              <tr><th>센터</th><th>지역</th><th>주요 역할</th><th>상태</th></tr>
            </thead>
            <tbody>
              <tr><td>센터 A</td><td>수도권</td><td>주문/출고</td><td><span class="tag good">운영중</span></td></tr>
              <tr><td>센터 B</td><td>충청</td><td>입고/반품</td><td><span class="tag warn">확장</span></td></tr>
              <tr><td>센터 C</td><td>영남</td><td>B2B</td><td><span class="tag">검토</span></td></tr>
            </tbody>
          </table>
        </div>
        <div class="card">
          <h3 class="card__title">조직도 (더미)</h3>
          <div class="card__body">
            사업부장<br/>
            ├ 운영팀<br/>
            ├ 기획/성과관리<br/>
            └ 시스템/자동화<br/>
            <div class="muted" style="margin-top:10px;">이미지/도식은 추후 교체</div>
          </div>
        </div>
      </div>
    `,
  },
  biz: {
    title: "물류사업 소개",
    desc: "풀필먼트 서비스 범위, 고객/채널, 운영 원칙 등을 소개합니다.",
    render: () => `
      <div class="grid">
        <div class="card card--full">
          <h3 class="card__title">한 줄 소개</h3>
          <div class="card__body">
            <b>[더미]</b> 의료/헬스케어 특성에 맞춘 안정적인 풀필먼트 운영과 데이터 기반 개선을 제공합니다.
          </div>
        </div>
        <div class="card">
          <h3 class="card__title">서비스 범위</h3>
          <div class="card__body">입고 · 보관 · 피킹/포장 · 출고 · 반품 · 재고관리</div>
        </div>
        <div class="card">
          <h3 class="card__title">운영 원칙</h3>
          <div class="card__body">정확도 우선 · SLA 준수 · 표준화 · 안전</div>
        </div>
        <div class="card">
          <h3 class="card__title">주요 시스템</h3>
          <div class="card__body">WMS · OMS · 리포팅(추후 연동)</div>
        </div>
      </div>
    `,
  },
  progress: {
    title: "주요 업무 진행사항",
    desc: "프로젝트/이슈/개선 과제의 진행 상황을 공유합니다.",
    render: () => `
      <div class="grid">
        <div class="card card--full">
          <h3 class="card__title">진행 현황 (더미)</h3>
          <table class="table">
            <thead>
              <tr><th>과제</th><th>담당</th><th>기한</th><th>상태</th><th>메모</th></tr>
            </thead>
            <tbody>
              <tr><td>피킹 동선 개선</td><td>운영팀</td><td>2026-02-20</td><td><span class="tag warn">진행중</span></td><td>구역 재배치 검토</td></tr>
              <tr><td>대시보드 지표 정의</td><td>기획</td><td>2026-02-15</td><td><span class="tag warn">진행중</span></td><td>SLA/리드타임 정의 합의</td></tr>
              <tr><td>반품 프로세스 표준화</td><td>운영팀</td><td>2026-03-05</td><td><span class="tag">대기</span></td><td>To-Be 문서 작성 예정</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
  },
  contacts: {
    title: "업무 연락망",
    desc: "센터/팀/담당자 연락처 및 에스컬레이션 체계를 정리합니다.",
    render: () => `
      <div class="grid">
        <div class="card card--full">
          <h3 class="card__title">연락망 (더미)</h3>
          <div class="card__body" style="margin-bottom:10px;">개인정보는 실제 적용 시 사내 정책에 맞춰 처리 필요</div>
          <table class="table">
            <thead>
              <tr><th>구분</th><th>팀</th><th>담당</th><th>연락</th><th>비고</th></tr>
            </thead>
            <tbody>
              <tr><td>운영</td><td>출고</td><td>홍길동</td><td>내선 1234</td><td>긴급 이슈 1차</td></tr>
              <tr><td>운영</td><td>입고</td><td>김영희</td><td>내선 2345</td><td>입고 일정</td></tr>
              <tr><td>시스템</td><td>WMS</td><td>박철수</td><td>내선 3456</td><td>장애 대응</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
  },
  knowhow: {
    title: "업무 노하우 공유",
    desc: "물류 용어집과 업무 노하우를 문서화해 공유합니다.",
    render: () => `
      <div class="grid">
        <div class="card card--full">
          <h3 class="card__title">물류 용어집</h3>
          <div class="card__body" style="margin-bottom:12px;">입·출고, 재고, 피킹, KGSP, 콜드체인 등 자주 쓰는 용어를 정리했습니다.</div>
          <div class="table-wrap">
            <table class="table table--glossary">
              <thead>
                <tr>
                  <th style="width:180px;">용어(한글)</th>
                  <th style="width:200px;">용어(영어)</th>
                  <th>설명</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>입/출고</td><td>IB/OB (Inbound/Outbound)</td><td>입고(IB)는 상품이 물류센터로 들어오는 프로세스, 출고(OB)는 주문에 따라 상품이 센터에서 외부로 나가는 프로세스를 의미</td></tr>
                <tr><td>재고</td><td>Inventory</td><td>현재 물류센터에 보관 중인 상품 수량</td></tr>
                <tr><td>가용재고</td><td>Available Stock</td><td>주문 가능한 재고 (불량·홀드 재고 제외)</td></tr>
                <tr><td>상품관리단위 (스큐)</td><td>SKU (Stock Keeping Unit)</td><td>재고 관리를 위해 상품의 종류·규격·포장·속성별로 구분한 최소 관리 단위. 예) 우루사라는 상품이 있지만 100mg / 400mg 규격이 있으면 규격단위가 SKU 임 (=상품코드 단위)</td></tr>
                <tr><td>피킹 (집품)</td><td>Picking</td><td>주문에 따라 로케이션에서 상품을 집품하는 작업</td></tr>
                <tr><td>패킹 (포장)</td><td>Packing</td><td>피킹된 상품을 포장하여 출고 준비하는 작업</td></tr>
                <tr><td>입하</td><td>Receiving / Inbound Receiving</td><td>외부(공급처·제조사)에서 물류센터로 상품이 실제 도착하여 입고를 대기함</td></tr>
                <tr><td>출하</td><td>Shipping / Outbound Shipping</td><td>주문 또는 출고 지시에 따라 상품을 집품·포장하여 물류센터에서 외부로 출발시키는 과정</td></tr>
                <tr><td>로케이션</td><td>Loc (Location)</td><td>물류센터 내 상품이 적치되는 물리적 위치 주소 (예: Zone–Rack–Shelf–Bin 단위로 관리) → 피킹지에 표기되는 위치주소값</td></tr>
                <tr><td>존 (구역)</td><td>Zone</td><td>일반적으로 센터 내, 층 내에서 특정 구역을 가리킴 (Sector)</td></tr>
                <tr><td>선입선출/선출선입</td><td>FIFO/FEFO</td><td>FIFO: 먼저 입고된 재고를 먼저 출고. FEFO: 유통기한이 빠른 재고를 우선 출고 (식품·의약품 필수)</td></tr>
                <tr><td>적격성 평가 (밸리데이션)</td><td>Validation</td><td>프로세스·시스템·설비가 의도한 목적에 맞게 일관되게 작동함을 검증하는 절차 (의약·콜드체인 핵심 개념). 사전 프로토콜(상세계획) 수립 → 밸리데이션 수행 → 리포트 작성/승인 절차로 진행됨</td></tr>
                <tr><td>표준운영절차</td><td>SOP (Standard Operating Procedure)</td><td>물류 업무(입하·보관·피킹·출하 등)를 일관된 방식으로 수행하기 위해 단계별로 정의한 표준 업무 절차 문서</td></tr>
                <tr><td>KGSP</td><td>KGSP (Korea Good Supply Practice)</td><td>의약품의 보관·수송 과정에서 품질과 안전성을 유지하기 위한 국내 우수유통관리기준. 의약품 유통을 위해서는 창고가 KGSP 적격업소 지정을 받아야 함</td></tr>
                <tr><td>KGSP 기준서</td><td>KGSP Guideline / Manual</td><td>KGSP 요건을 충족하기 위해 시설·설비·운영·관리 기준을 문서화한 내부 기준 문서</td></tr>
                <tr><td>콜드체인</td><td>Cold Chain</td><td>의약품·식품 등을 정해진 저온 범위에서 보관·운송·출하하는 온도 관리 물류 체계. 이지메디컴에서는 냉장(2-8도) / 초저온 (-80도 이하) 으로 운영 중</td></tr>
                <tr><td>검·교정</td><td>Calibration / Verification</td><td>계측 장비가 정확한 값을 측정하는지 확인(검증)하고 기준에 맞게 조정하는 절차. 유효기간이 1년이므로 지정된 장비는 1년마다 수행해야 함 (온도로거 등)</td></tr>
                <tr><td>파레트랙</td><td>Pallet Rack</td><td>파레트 단위 상품을 지게차로 적치·보관하기 위한 중량용 랙 시스템</td></tr>
                <tr><td>선반랙</td><td>Shelf Rack</td><td>박스·소형 단위 상품을 수작업으로 보관·피킹하기 위한 선반 랙. 내하중에 따라 경량랙, 중량랙이 있음 구매 진행 시 하중을 고려하여 설계</td></tr>
                <tr><td>풀필먼트</td><td>Fulfillment</td><td>주문 접수부터 보관·피킹·패킹·출하·반품까지 일괄 처리하는 물류 서비스. 3PL의 확대 개념이며 일반적으로 플랫폼(약국몰, 병원몰, 네스스, 쿠팡 등) 주문관리부터 CS까지 관여함</td></tr>
                <tr><td>3PL</td><td>3PL (Third Party Logistics)</td><td>기업의 물류 업무를 외부 전문 물류업체가 대행하는 운영 방식. 일반적으로 화주사-유통사 관계를 말하고 위탁물류(사입X)를 수행하는 방식</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card card--wide">
          <h3 class="card__title">업무 노하우 (더미)</h3>
          <div class="card__body">
            <b>피크 대응 체크리스트</b><br/>
            1) 물동량 예측 확인<br/>
            2) 인력 배치/교대 계획<br/>
            3) 병목 공정 사전 점검(피킹/포장/출고)<br/>
            <div class="muted" style="margin-top:10px;">문서/링크 형태로 확장 가능</div>
          </div>
        </div>
        <div class="card card--full">
          <h3 class="card__title">문서 목록(더미)</h3>
          <table class="table">
            <thead><tr><th>카테고리</th><th>제목</th><th>업데이트</th><th>상태</th></tr></thead>
            <tbody>
              <tr><td>표준</td><td>[더미] 출고 예외 처리 가이드</td><td>2026-02-03</td><td><span class="tag good">최신</span></td></tr>
              <tr><td>교육</td><td>[더미] 신규 입고 담당자 온보딩</td><td>2026-01-27</td><td><span class="tag">유지</span></td></tr>
              <tr><td>FAQ</td><td>[더미] 반품 분류 기준</td><td>2026-01-15</td><td><span class="tag">유지</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
  },
  feedback: {
    title: "페이지 피드백",
    desc: "요청사항/개선 의견을 수집합니다(설문/폼 연결 예정).",
    render: () => `
      <div class="grid">
        <div class="card card--wide">
          <h3 class="card__title">요청사항 설문 (더미)</h3>
          <div class="card__body">
            <div style="margin-top:10px; display:grid; gap:10px;">
              <div>
                <div class="muted" style="margin-bottom:6px;">요청 제목</div>
                <div style="padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.04);">예) 대시보드에 센터별 SLA 추가</div>
              </div>
              <div>
                <div class="muted" style="margin-bottom:6px;">상세 내용</div>
                <div style="height:120px; padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.04);">[더미] 어디에/왜/원하는 결과</div>
              </div>
              <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <span class="tag">기능 개선</span>
                <span class="tag">콘텐츠 추가</span>
                <span class="tag">버그</span>
              </div>
              <div class="muted">실제 제출/저장은 추후 연동</div>
            </div>
          </div>
        </div>
        <div class="card">
          <h3 class="card__title">우선순위(더미)</h3>
          <div class="card__body">
            <span class="tag good">높음</span>
            <span class="tag warn">중간</span>
            <span class="tag bad">낮음</span>
          </div>
        </div>
      </div>
    `,
  },
};

function getRouteFromHash() {
  const hash = (location.hash || "#notices").replace("#", "").trim();
  return ROUTES[hash] ? hash : "notices";
}

function setActiveNav(routeKey) {
  document.querySelectorAll(".nav__item").forEach((a) => {
    a.classList.toggle("is-active", a.dataset.route === routeKey);
  });
}

function render() {
  const routeKey = getRouteFromHash();
  const route = ROUTES[routeKey];
  document.getElementById("pageTitle").textContent = route.title;
  document.getElementById("pageDesc").textContent = route.desc;
  document.getElementById("content").innerHTML = route.render();
  setActiveNav(routeKey);
}

function wireDummySearch() {
  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");
  const run = () => {
    const q = (input.value || "").trim();
    if (!q) return;
    alert(`(더미) 검색어: ${q}\n실제 검색은 추후 데이터 연동 시 구현합니다.`);
  };
  btn.addEventListener("click", run);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") run();
  });
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", () => {
  wireDummySearch();
  render();
});

