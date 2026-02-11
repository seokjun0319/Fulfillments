const NOTICES_KEY = "fulfillment-notices";
const SPREADSHEET_URL_KEY = "fulfillment-spreadsheet-url";

const CENTERS_LOCATIONS = [
  { name: "오산물류센터", type: "물류센터", address: "경기도 오산시 누읍동 황새로 109", lat: 37.1367, lng: 127.0589 },
  { name: "향남물류센터", type: "물류센터", address: "경기 화성시 향남읍 서봉로 485-25", lat: 37.096, lng: 126.919 },
  { name: "오산냉장센터", type: "물류센터", address: "경기 오산시 오산로 149", lat: 37.152, lng: 127.071 },
  { name: "김포MFC", type: "물류센터", address: "경기도 김포시 고촌읍 전호리 725", lat: 37.604, lng: 126.718 },
  { name: "성남MFC(예정)", type: "물류센터", address: "경기도 성남시 갈마치로 244", lat: 37.398, lng: 127.128 },
  { name: "한신VC", type: "배송센터", address: "서울특별시 동대문구 천호대로17길 65", lat: 37.574, lng: 127.069 },
  { name: "복산VC", type: "배송센터", address: "경기 광주시 장지동 388-13", lat: 37.406, lng: 127.258 },
];

let centersMapInstance = null;

function initCentersMap() {
  const container = document.getElementById("centers-map");
  if (!container || typeof L === "undefined") return;
  if (centersMapInstance) {
    centersMapInstance.remove();
    centersMapInstance = null;
  }
  const first = CENTERS_LOCATIONS[0];
  const map = L.map("centers-map").setView([first.lat, first.lng], 10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
  }).addTo(map);
  const bounds = [];
  CENTERS_LOCATIONS.forEach((c) => {
    const marker = L.marker([c.lat, c.lng]).addTo(map);
    marker.bindPopup(`<strong>${escapeHtml(c.name)}</strong><br/><span class="muted">${escapeHtml(c.type)}</span><br/>${escapeHtml(c.address)}`);
    bounds.push([c.lat, c.lng]);
  });
  if (bounds.length > 1) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
  setTimeout(function () {
    map.invalidateSize();
  }, 100);
  centersMapInstance = map;
}

function getSpreadsheetUrl() {
  return localStorage.getItem(SPREADSHEET_URL_KEY) || "";
}
function setSpreadsheetUrl(url) {
  if (url && url.trim()) localStorage.setItem(SPREADSHEET_URL_KEY, url.trim());
  else localStorage.removeItem(SPREADSHEET_URL_KEY);
}


const DEFAULT_NOTICES = [
  { id: "1", category: "운영", title: "반품 입고 기준 변경", body: "센터별 반품 입고 기준이 변경되었습니다. 자세한 내용은 첨부를 확인해 주세요.", createdAt: "2026-02-08", status: "공지중" },
  { id: "2", category: "시스템", title: "WMS 점검 안내", body: "WMS 정기 점검 일정 안내입니다.", createdAt: "2026-02-05", status: "종료" },
  { id: "3", category: "안전", title: "센터 안전교육 안내", body: "전 센터 안전교육 일정을 공지합니다.", createdAt: "2026-02-01", status: "종료" },
];

function getNotices() {
  try {
    const raw = localStorage.getItem(NOTICES_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length) return list;
    }
  } catch (_) {}
  return DEFAULT_NOTICES.slice();
}

function saveNotices(list) {
  localStorage.setItem(NOTICES_KEY, JSON.stringify(list));
}

function addNotice(notice) {
  const list = getNotices();
  const id = String(Date.now());
  const createdAt = new Date().toISOString().slice(0, 10);
  list.unshift({ id, ...notice, createdAt: notice.createdAt || createdAt });
  saveNotices(list);
  return list;
}

function statusTag(status) {
  if (status === "공지중") return '<span class="tag warn">공지중</span>';
  if (status === "예정") return '<span class="tag">예정</span>';
  return '<span class="tag">종료</span>';
}

function renderNoticesTab() {
  const notices = getNotices();
  const latest = notices[0] || null;
  const latestHtml = latest
    ? `
    <div class="notice-meta" style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:10px;">
      <span class="tag">${latest.category}</span>
      <span class="muted">${latest.createdAt}</span>
      ${latest.status ? statusTag(latest.status) : ""}
    </div>
    <b>${escapeHtml(latest.title)}</b>
    <div class="muted" style="margin-top:8px; white-space:pre-wrap;">${escapeHtml(latest.body || "")}</div>
  `
    : `<p class="muted">등록된 공지가 없습니다. 신규 공지를 작성해 주세요.</p>`;

  const rows = notices
    .map(
      (n) =>
        `<tr>
          <td>${escapeHtml(n.category)}</td>
          <td>${escapeHtml(n.title)}</td>
          <td>${n.createdAt}</td>
          <td>${statusTag(n.status)}</td>
        </tr>`
    )
    .join("");

  return `
    <div class="grid">
      <div class="card card--wide">
        <h3 class="card__title">최신 공지</h3>
        <div class="card__body">${latestHtml}</div>
      </div>
      <div class="card">
        <h3 class="card__title">바로가기</h3>
        <div class="card__body">
          - 공지 작성/승인 프로세스<br/>
          - 변경 이력<br/>
          - 자주 묻는 질문
        </div>
      </div>
      <div class="card card--full">
        <div class="card__head" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
          <h3 class="card__title" style="margin:0;">공지사항 목록</h3>
          <button type="button" class="btn btn--primary" id="btnAddNotice">신규 공지 작성</button>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th style="width:120px;">구분</th>
                <th>제목</th>
                <th style="width:120px;">작성일</th>
                <th style="width:120px;">상태</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="modal" id="noticeModal" aria-hidden="true">
      <div class="modal__backdrop" id="noticeModalBackdrop"></div>
      <div class="modal__box" role="dialog" aria-labelledby="noticeModalTitle">
        <h3 class="modal__title" id="noticeModalTitle">신규 공지 작성</h3>
        <form id="noticeForm" class="form">
          <div class="form__row">
            <label class="form__label" for="noticeCategory">구분</label>
            <select id="noticeCategory" class="form__input" required>
              <option value="운영">운영</option>
              <option value="시스템">시스템</option>
              <option value="안전">안전</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <div class="form__row">
            <label class="form__label" for="noticeTitle">제목</label>
            <input type="text" id="noticeTitle" class="form__input" placeholder="공지 제목" required />
          </div>
          <div class="form__row">
            <label class="form__label" for="noticeBody">본문</label>
            <textarea id="noticeBody" class="form__input form__textarea" placeholder="공지 내용 (선택)"></textarea>
          </div>
          <div class="form__row">
            <label class="form__label" for="noticeStatus">상태</label>
            <select id="noticeStatus" class="form__input">
              <option value="공지중">공지중</option>
              <option value="예정">예정</option>
              <option value="종료">종료</option>
            </select>
          </div>
          <div class="form__actions">
            <button type="button" class="btn btn--secondary" id="noticeModalClose">취소</button>
            <button type="submit" class="btn btn--primary">등록</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function escapeHtml(s) {
  if (s == null) return "";
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function openNoticeModal() {
  const el = document.getElementById("noticeModal");
  if (el) {
    el.setAttribute("aria-hidden", "false");
    el.classList.add("modal--open");
    document.getElementById("noticeTitle").focus();
  }
}

function closeNoticeModal() {
  const el = document.getElementById("noticeModal");
  if (el) {
    el.setAttribute("aria-hidden", "true");
    el.classList.remove("modal--open");
  }
}

function wireNotices() {
  const btn = document.getElementById("btnAddNotice");
  const form = document.getElementById("noticeForm");
  const closeBtn = document.getElementById("noticeModalClose");
  const backdrop = document.getElementById("noticeModalBackdrop");
  if (btn) btn.addEventListener("click", openNoticeModal);
  if (closeBtn) closeBtn.addEventListener("click", closeNoticeModal);
  if (backdrop) backdrop.addEventListener("click", closeNoticeModal);
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const category = document.getElementById("noticeCategory").value.trim();
      const title = document.getElementById("noticeTitle").value.trim();
      const body = document.getElementById("noticeBody").value.trim();
      const status = document.getElementById("noticeStatus").value;
      if (!title) return;
      addNotice({ category, title, body, status });
      form.reset();
      closeNoticeModal();
      render();
    });
  }
}

const ROUTES = {
  notices: {
    title: "주요 공지사항",
    desc: "최신 공지와 공지사항 목록을 빠르게 확인합니다.",
    render: renderNoticesTab,
  },
  dashboard: {
    title: "대시보드",
    desc: "SLA, KPI, 사업부 손익, 물동량 등 주요 지표를 한눈에 봅니다.",
    render: () => `
      <div class="grid">
        <div class="card card--wide">
          <h3 class="card__title">핵심 지표</h3>
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
          <div class="card__body">라인/바 차트가 들어갈 자리</div>
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
          <h3 class="card__title">입력</h3>
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
          <h3 class="card__title">결과</h3>
          <div class="card__body">
            <div class="kpis">
              <div class="pill"><div class="pill__k">필요 인력</div><div class="pill__v">43명</div><div class="pill__s"><span class="tag">추정</span></div></div>
              <div class="pill"><div class="pill__k">예상 SLA</div><div class="pill__v">98.1%</div><div class="pill__s"><span class="tag warn">주의</span></div></div>
            </div>
          </div>
        </div>
        <div class="card card--full">
          <h3 class="card__title">그래프 자리</h3>
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
          <h3 class="card__title">물류센터 위치</h3>
          <p class="card__body muted" style="margin-bottom:10px;">주소지 기준 로케이션입니다. 마커를 클릭하면 명칭·주소를 볼 수 있습니다.</p>
          <div id="centers-map" class="centers-map"></div>
        </div>
        <div class="card card--wide">
          <h3 class="card__title">물류센터 현황</h3>
          <div class="embed-wrap centers-embed">
            <iframe title="물류센터 스프레드시트" class="embed-iframe" src="https://docs.google.com/spreadsheets/d/1DiFDr5BMGCX_8nIHhKAYhXmBSHObmRW9xFZpuqBPxp4/pubhtml?widget=true&amp;headers=false"></iframe>
          </div>
          <p class="muted" style="margin-top:8px; font-size:12px;">시트가 보이지 않으면 <a href="https://docs.google.com/spreadsheets/d/1DiFDr5BMGCX_8nIHhKAYhXmBSHObmRW9xFZpuqBPxp4/edit?usp=sharing" target="_blank" rel="noopener">이 링크</a>로 열어 보세요.</p>
        </div>
        <div class="card card--full">
          <h3 class="card__title">조직도</h3>
          <div class="embed-wrap" style="margin-top:10px;">
            <iframe title="조직도 스프레드시트" class="embed-iframe" src="https://docs.google.com/spreadsheets/d/1MacPbrhbBbOFM7p6mbDiOn6eC0iBop2rms_f7uti-_M/pubhtml?widget=true&amp;headers=false"></iframe>
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
            의료/헬스케어 특성에 맞춘 안정적인 풀필먼트 운영과 데이터 기반 개선을 제공합니다.
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
          <h3 class="card__title">진행 현황</h3>
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
          <h3 class="card__title">연락망</h3>
          <div class="card__body" style="margin-bottom:10px;">개인정보는 실제 적용 시 사내 정책에 맞춰 처리해 주세요.</div>
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
          <h3 class="card__title">업무 노하우</h3>
          <div class="card__body">
            <b>피크 대응 체크리스트</b><br/>
            1) 물동량 예측 확인<br/>
            2) 인력 배치/교대 계획<br/>
            3) 병목 공정 사전 점검(피킹/포장/출고)<br/>
            <div class="muted" style="margin-top:10px;">문서/링크 형태로 확장 가능</div>
          </div>
        </div>
        <div class="card card--full">
          <h3 class="card__title">문서 목록</h3>
          <table class="table">
            <thead><tr><th>카테고리</th><th>제목</th><th>업데이트</th><th>상태</th></tr></thead>
            <tbody>
              <tr><td>표준</td><td>출고 예외 처리 가이드</td><td>2026-02-03</td><td><span class="tag good">최신</span></td></tr>
              <tr><td>교육</td><td>신규 입고 담당자 온보딩</td><td>2026-01-27</td><td><span class="tag">유지</span></td></tr>
              <tr><td>FAQ</td><td>반품 분류 기준</td><td>2026-01-15</td><td><span class="tag">유지</span></td></tr>
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
          <h3 class="card__title">요청사항 설문</h3>
          <div class="card__body">
            <div style="margin-top:10px; display:grid; gap:10px;">
              <div>
                <div class="muted" style="margin-bottom:6px;">요청 제목</div>
                <div style="padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.04);">예) 대시보드에 센터별 SLA 추가</div>
              </div>
              <div>
                <div class="muted" style="margin-bottom:6px;">상세 내용</div>
                <div style="height:120px; padding:10px 12px; border-radius:12px; border:1px solid var(--border); background: var(--surface-2);">어디에/왜/원하는 결과를 입력해 주세요.</div>
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
          <h3 class="card__title">우선순위</h3>
          <div class="card__body">
            <span class="tag good">높음</span>
            <span class="tag warn">중간</span>
            <span class="tag bad">낮음</span>
          </div>
        </div>
      </div>
    `,
  },
  spreadsheet: {
    title: "스프레드시트",
    desc: "Google 스프레드시트를 페이지에 임베드해 볼 수 있습니다.",
    render: renderSpreadsheetTab,
  },
};

function renderSpreadsheetTab() {
  const url = getSpreadsheetUrl();
  const hasUrl = url.length > 0;
  return `
    <div class="card card--full">
      <h3 class="card__title">Google 스프레드시트</h3>
      <div class="card__body" style="margin-bottom:14px;">
        <p class="muted" style="margin:0 0 12px;">아래에 링크를 입력하고 저장하면 시트가 이 페이지에 임베드됩니다. Google 스프레드시트에서 <strong>파일 → 공유 → 웹에 게시</strong> 후 나오는 주소(또는 삽입 → iframe용 주소)를 사용하세요.</p>
        <form id="spreadsheetForm" class="spreadsheet-form" style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end;">
          <div style="flex:1; min-width:200px;">
            <label class="form__label" for="spreadsheetUrlInput">스프레드시트 링크</label>
            <input type="url" id="spreadsheetUrlInput" class="form__input" placeholder="https://docs.google.com/spreadsheets/d/e/.../pubhtml" value="${escapeHtml(url)}" />
          </div>
          <button type="submit" class="btn btn--primary">저장 후 표시</button>
        </form>
      </div>
      ${hasUrl ? `
        <div class="embed-wrap">
          <iframe title="Google 스프레드시트" class="embed-iframe" src="${escapeHtml(url)}"></iframe>
        </div>
      ` : `
        <div class="embed-placeholder muted">링크를 저장하면 위에 스프레드시트가 표시됩니다.</div>
      `}
    </div>
  `;
}

function wireSpreadsheet() {
  const form = document.getElementById("spreadsheetForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("spreadsheetUrlInput");
      const value = (input && input.value || "").trim();
      setSpreadsheetUrl(value);
      render();
    });
  }
}

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
  if (routeKey === "notices") wireNotices();
  if (routeKey === "spreadsheet") wireSpreadsheet();
  if (routeKey === "centers") setTimeout(initCentersMap, 80);
}

function wireDummySearch() {
  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");
  const run = () => {
    const q = (input.value || "").trim();
    if (!q) return;
    alert(`검색어: ${q}\n실제 검색은 추후 데이터 연동 시 구현합니다.`);
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

