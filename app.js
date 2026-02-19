const NOTICES_KEY = "fulfillment-notices";
const CONTACTS_KEY = "fulfillment-contacts";
const GEMINI_API_KEY_KEY = "fulfillment-gemini-api-key";
var DEFAULT_GEMINI_API_KEY = "AIzaSyCpuyCrEUvOlkYWiL7pJ0VD10Q7E4s6ooo";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_MAX_HISTORY = 20;
/** (미사용) 예전 물류 뉴스용 NewsAPI 키 - 현재는 Google News RSS + rss2json 사용 */
var NEWS_API_KEY = "";
var AI_STUDY_VIDEOS = [
  { id: "dQw4w9WgXcQ", title: "AI 예시 영상 1" },
  { id: "jNQXAC9IVRw", title: "AI 예시 영상 2" },
];
const AI_KNOWHOW_KEY = "fulfillment-ai-knowhow";
const AI_TIPS_KEY = "fulfillment-ai-tips";

function getAiKnowhow() {
  try {
    var raw = localStorage.getItem(AI_KNOWHOW_KEY);
    if (raw) {
      var list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (_) {}
  return [];
}
function saveAiKnowhow(list) {
  try { localStorage.setItem(AI_KNOWHOW_KEY, JSON.stringify(list)); } catch (_) {}
}
function addAiKnowhowItem(item) {
  var list = getAiKnowhow();
  var id = String(Date.now());
  list.unshift({ id: id, title: item.title || "", body: item.body || "", createdAt: new Date().toISOString().slice(0, 10) });
  saveAiKnowhow(list);
  return list;
}
function deleteAiKnowhowItem(id) {
  var list = getAiKnowhow().filter(function (x) { return x.id !== id; });
  saveAiKnowhow(list);
  return list;
}

function getAiTips() {
  try {
    var raw = localStorage.getItem(AI_TIPS_KEY);
    if (raw) {
      var list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (_) {}
  return [];
}
function saveAiTips(list) {
  try { localStorage.setItem(AI_TIPS_KEY, JSON.stringify(list)); } catch (_) {}
}
function addAiTip(item) {
  var list = getAiTips();
  var id = String(Date.now());
  list.unshift({ id: id, aiTool: item.aiTool || "", situation: item.situation || "", prompt: item.prompt || "", responseExample: item.responseExample || "", tip: item.tip || "", createdAt: new Date().toISOString().slice(0, 10) });
  saveAiTips(list);
  return list;
}
function deleteAiTip(id) {
  var list = getAiTips().filter(function (x) { return x.id !== id; });
  saveAiTips(list);
  return list;
}

function buildPageContextForChat() {
  var parts = [];
  var notices = getNotices();
  if (notices.length) {
    parts.push("## 공지사항\n" + notices.slice(0, 15).map(function (n) {
      var status = getNoticeStatusFromDates(n.noticeStartDate, n.noticeEndDate);
      return "- [" + (n.createdAt || "") + "] " + (n.category || "") + " | " + (n.title || "") + " (" + status + ")\n  " + noticeBodyPlainText(n.body || "").replace(/\n/g, " ");
    }).join("\n"));
  }
  var contacts = getContacts();
  if (contacts.length) {
    parts.push("## 업무 연락망\n" + contacts.map(function (c) {
      return "- " + (c.category || "") + " | " + (c.company || "") + " | " + (c.name || "") + " | " + (c.phone || "") + (c.email ? " | " + c.email : "") + (c.note ? " | " + c.note : "");
    }).join("\n"));
  }
  var glossary = getGlossary();
  if (glossary.length) {
    parts.push("## 물류 용어집\n" + glossary.map(function (g) {
      return "- " + (g.termKo || "") + " (" + (g.termEn || "") + "): " + (g.description || "");
    }).join("\n"));
  }
  parts.push("## 물류/배송센터\n" + CENTERS_LOCATIONS.map(function (c) {
    return "- " + (c.name || "") + " (" + (c.type || "") + "): " + (c.address || "");
  }).join("\n"));
  return parts.join("\n\n");
}

const DEFAULT_CONTACTS = [
  { id: "1", category: "도급사", company: "KPO", name: "이창용 소장", phone: "010-2223-9495", email: "", note: "김포 도급 관리자" },
  { id: "2", category: "도급사", company: "KPO", name: "한준희 소장", phone: "010-6812-1177", email: "", note: "향남 도급 관리자" },
  { id: "3", category: "도급사", company: "KPO", name: "최지홍 소장", phone: "", email: "", note: "냉장 도급 관리자" },
  { id: "4", category: "운송사", company: "스마일로지스", name: "이창화 대표", phone: "010-5336-1824", email: "", note: "거점물류 운송사 대표" },
  { id: "5", category: "운송사", company: "스마일로지스", name: "이호준 상무", phone: "", email: "", note: "거점물류 운송사 관리자" },
  { id: "6", category: "운송사", company: "선경CLS", name: "실장", phone: "010-5058-5955", email: "", note: "향남-김포 간선업체 계약관리자" },
  { id: "7", category: "운송사", company: "선경CLS", name: "기사님", phone: "010-2599-2879", email: "", note: "향남-김포 간선차량 기사님 (11톤 정온)" },
  { id: "8", category: "공급사", company: "티피솔루션", name: "문소성 팀장", phone: "010-5341-2503", email: "", note: "에어캡 매입처" },
  { id: "9", category: "공급사", company: "태림포장", name: "안인혁 대리", phone: "010-4057-9022", email: "", note: "박스 매입처" },
  { id: "10", category: "종합공사", company: "디앤아이건설", name: "이동원 대표", phone: "010-2737-3832", email: "", note: "전기, 건축, 공조, 소방 등등 공사가능 / 김포, 냉장 공사수행 이력있음" },
  { id: "11", category: "네트워크", company: "노블시스", name: "하영민 부장", phone: "010-3934-4559", email: "", note: "네트워크 공사 및 망구성 협력사 / vpn방화벽 등 내부망 구성 히스토리를 많이 알고 있어 진행 원활" },
  { id: "12", category: "보안", company: "에스원", name: "양재창 대리", phone: "010-2805-5479", email: "", note: "에스원 법인 담당자 / 전 지역 대응가능" },
  { id: "13", category: "방서방충", company: "렌토킬", name: "이도형 팀장", phone: "010-6206-8182", email: "", note: "렌토킬 법인 담당자 / 전 지역 대응가능" },
];

function getContacts() {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length) return list;
    }
  } catch (_) {}
  return DEFAULT_CONTACTS.map((c) => ({ ...c }));
}

function saveContacts(list) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(list));
}

function addContact(contact) {
  const list = getContacts();
  const id = String(Date.now());
  list.push({ id, ...contact });
  saveContacts(list);
  return list;
}

function updateContact(id, contact) {
  const list = getContacts();
  const i = list.findIndex((c) => c.id === id);
  if (i >= 0) list[i] = { ...list[i], ...contact };
  saveContacts(list);
  return list;
}

function deleteContact(id) {
  const list = getContacts().filter((c) => c.id !== id);
  saveContacts(list);
  return list;
}

const CONTACT_CATEGORIES = ["도급사", "운송사", "공급사", "종합공사", "네트워크", "보안", "방서방충", "기타"];

const GLOSSARY_KEY = "fulfillment-glossary";
const DEFAULT_GLOSSARY = [
  { id: "1", termKo: "입/출고", termEn: "IB/OB (Inbound/Outbound)", description: "입고(IB)는 상품이 물류센터로 들어오는 프로세스, 출고(OB)는 주문에 따라 상품이 센터에서 외부로 나가는 프로세스를 의미" },
  { id: "2", termKo: "재고", termEn: "Inventory", description: "현재 물류센터에 보관 중인 상품 수량" },
  { id: "3", termKo: "가용재고", termEn: "Available Stock", description: "주문 가능한 재고 (불량·홀드 재고 제외)" },
  { id: "4", termKo: "상품관리단위 (스큐)", termEn: "SKU (Stock Keeping Unit)", description: "재고 관리를 위해 상품의 종류·규격·포장·속성별로 구분한 최소 관리 단위. 예) 우루사라는 상품이 있지만 100mg / 400mg 규격이 있으면 규격단위가 SKU 임 (=상품코드 단위)" },
  { id: "5", termKo: "피킹 (집품)", termEn: "Picking", description: "주문에 따라 로케이션에서 상품을 집품하는 작업" },
  { id: "6", termKo: "패킹 (포장)", termEn: "Packing", description: "피킹된 상품을 포장하여 출고 준비하는 작업" },
  { id: "7", termKo: "입하", termEn: "Receiving / Inbound Receiving", description: "외부(공급처·제조사)에서 물류센터로 상품이 실제 도착하여 입고를 대기함" },
  { id: "8", termKo: "출하", termEn: "Shipping / Outbound Shipping", description: "주문 또는 출고 지시에 따라 상품을 집품·포장하여 물류센터에서 외부로 출발시키는 과정" },
  { id: "9", termKo: "로케이션", termEn: "Loc (Location)", description: "물류센터 내 상품이 적치되는 물리적 위치 주소 (예: Zone–Rack–Shelf–Bin 단위로 관리) → 피킹지에 표기되는 위치주소값" },
  { id: "10", termKo: "존 (구역)", termEn: "Zone", description: "일반적으로 센터 내, 층 내에서 특정 구역을 가리킴 (Sector)" },
  { id: "11", termKo: "선입선출/선출선입", termEn: "FIFO/FEFO", description: "FIFO: 먼저 입고된 재고를 먼저 출고. FEFO: 유통기한이 빠른 재고를 우선 출고 (식품·의약품 필수)" },
  { id: "12", termKo: "적격성 평가 (밸리데이션)", termEn: "Validation", description: "프로세스·시스템·설비가 의도한 목적에 맞게 일관되게 작동함을 검증하는 절차 (의약·콜드체인 핵심 개념). 사전 프로토콜(상세계획) 수립 → 밸리데이션 수행 → 리포트 작성/승인 절차로 진행됨" },
  { id: "13", termKo: "표준운영절차", termEn: "SOP (Standard Operating Procedure)", description: "물류 업무(입하·보관·피킹·출하 등)를 일관된 방식으로 수행하기 위해 단계별로 정의한 표준 업무 절차 문서" },
  { id: "14", termKo: "KGSP", termEn: "KGSP (Korea Good Supply Practice)", description: "의약품의 보관·수송 과정에서 품질과 안전성을 유지하기 위한 국내 우수유통관리기준. 의약품 유통을 위해서는 창고가 KGSP 적격업소 지정을 받아야 함" },
  { id: "15", termKo: "KGSP 기준서", termEn: "KGSP Guideline / Manual", description: "KGSP 요건을 충족하기 위해 시설·설비·운영·관리 기준을 문서화한 내부 기준 문서" },
  { id: "16", termKo: "콜드체인", termEn: "Cold Chain", description: "의약품·식품 등을 정해진 저온 범위에서 보관·운송·출하하는 온도 관리 물류 체계. 이지메디컴에서는 냉장(2-8도) / 초저온 (-80도 이하) 으로 운영 중" },
  { id: "17", termKo: "검·교정", termEn: "Calibration / Verification", description: "계측 장비가 정확한 값을 측정하는지 확인(검증)하고 기준에 맞게 조정하는 절차. 유효기간이 1년이므로 지정된 장비는 1년마다 수행해야 함 (온도로거 등)" },
  { id: "18", termKo: "파레트랙", termEn: "Pallet Rack", description: "파레트 단위 상품을 지게차로 적치·보관하기 위한 중량용 랙 시스템" },
  { id: "19", termKo: "선반랙", termEn: "Shelf Rack", description: "박스·소형 단위 상품을 수작업으로 보관·피킹하기 위한 선반 랙. 내하중에 따라 경량랙, 중량랙이 있음 구매 진행 시 하중을 고려하여 설계" },
  { id: "20", termKo: "풀필먼트", termEn: "Fulfillment", description: "주문 접수부터 보관·피킹·패킹·출하·반품까지 일괄 처리하는 물류 서비스. 3PL의 확대 개념이며 일반적으로 플랫폼(약국몰, 병원몰, 네스스, 쿠팡 등) 주문관리부터 CS까지 관여함" },
  { id: "21", termKo: "3PL", termEn: "3PL (Third Party Logistics)", description: "기업의 물류 업무를 외부 전문 물류업체가 대행하는 운영 방식. 일반적으로 화주사-유통사 관계를 말하고 위탁물류(사입X)를 수행하는 방식" },
];

function getGlossary() {
  try {
    const raw = localStorage.getItem(GLOSSARY_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length) return list;
    }
  } catch (_) {}
  return DEFAULT_GLOSSARY.map((g) => ({ ...g }));
}

function saveGlossary(list) {
  localStorage.setItem(GLOSSARY_KEY, JSON.stringify(list));
}

function addGlossaryItem(item) {
  const list = getGlossary();
  const id = String(Date.now());
  list.push({ id, ...item });
  saveGlossary(list);
  return list;
}

function updateGlossaryItem(id, item) {
  const list = getGlossary();
  const i = list.findIndex((g) => g.id === id);
  if (i >= 0) list[i] = { ...list[i], ...item };
  saveGlossary(list);
  return list;
}

function deleteGlossaryItem(id) {
  const list = getGlossary().filter((g) => g.id !== id);
  saveGlossary(list);
  return list;
}

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

function centerMarkerIcon(type) {
  var isDelivery = (type || "").trim() === "배송센터";
  var bg = isDelivery ? "#16a34a" : "#007acc";
  var iconChar = isDelivery ? "🚚" : "📦";
  return L.divIcon({
    className: "centers-marker",
    html: "<span style=\"display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:" + bg + ";color:#fff;font-size:16px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);\">" + iconChar + "</span>",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

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
    const marker = L.marker([c.lat, c.lng], { icon: centerMarkerIcon(c.type) }).addTo(map);
    marker.bindPopup(`<strong>${escapeHtml(c.name)}</strong><br/><span class="muted">${escapeHtml(c.type)}</span><br/>${escapeHtml(c.address)}`);
    bounds.push([c.lat, c.lng]);
  });
  if (bounds.length > 1) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
  setTimeout(function () {
    map.invalidateSize();
  }, 100);
  centersMapInstance = map;
}

const DEFAULT_NOTICES = [
  { id: "1", category: "운영", title: "반품 입고 기준 변경", body: "센터별 반품 입고 기준이 변경되었습니다. 자세한 내용은 첨부를 확인해 주세요.", author: "관리자", createdAt: "2026-02-08T10:00:00.000Z", noticeStartDate: "2026-02-08", noticeEndDate: "2026-02-28", status: "공지중" },
  { id: "2", category: "시스템", title: "WMS 점검 안내", body: "WMS 정기 점검 일정 안내입니다.", author: "시스템팀", createdAt: "2026-02-05T09:00:00.000Z", noticeStartDate: "", noticeEndDate: "", status: "종료" },
  { id: "3", category: "안전", title: "센터 안전교육 안내", body: "전 센터 안전교육 일정을 공지합니다.", author: "안전담당", createdAt: "2026-02-01T14:00:00.000Z", noticeStartDate: "", noticeEndDate: "", status: "종료" },
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

function formatNoticeDatetime(isoStr) {
  if (!isoStr) return "";
  var d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  var y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  var h = String(d.getHours()).padStart(2, "0"), min = String(d.getMinutes()).padStart(2, "0");
  return y + "-" + m + "-" + day + " " + h + ":" + min;
}

function addNotice(notice) {
  const list = getNotices();
  const id = String(Date.now());
  const createdAt = new Date().toISOString();
  list.unshift({ id, ...notice, createdAt: notice.createdAt || createdAt });
  saveNotices(list);
  return list;
}

function updateNotice(id, notice) {
  const list = getNotices();
  const i = list.findIndex(function (n) { return n.id === id; });
  if (i < 0) return list;
  list[i] = { ...list[i], ...notice };
  saveNotices(list);
  return list;
}

function deleteNotice(id) {
  const list = getNotices().filter(function (n) { return n.id !== id; });
  saveNotices(list);
  return list;
}

function statusTag(status) {
  if (status === "공지중") return '<span class="tag warn">공지중</span>';
  if (status === "예정") return '<span class="tag">예정</span>';
  return '<span class="tag">종료</span>';
}

function getNoticeStatusFromDates(noticeStartDate, noticeEndDate) {
  var today = new Date();
  var todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
  var start = (noticeStartDate || "").trim();
  var end = (noticeEndDate || "").trim();
  if (start && todayStr < start) return "예정";
  if (end && todayStr > end) return "종료";
  return "공지중";
}

function noticeBodyPlainText(html) {
  if (!html || typeof html !== "string") return "";
  var div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim().replace(/\s+/g, " ");
}

function renderNoticesTab() {
  const notices = getNotices();
  const latest = notices[0] || null;
  const latestStatus = getNoticeStatusFromDates(latest ? latest.noticeStartDate : "", latest ? latest.noticeEndDate : "");
  const latestHtml = latest
    ? `
    <div class="notice-meta" style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:10px;">
      <span class="tag">${escapeHtml(latest.category)}</span>
      <span class="muted">${escapeHtml(latest.author || "")}</span>
      <span class="muted">작성일시 ${formatNoticeDatetime(latest.createdAt)}</span>
      ${statusTag(latestStatus)}
    </div>
    <b>${escapeHtml(latest.title)}</b>
    <div class="notice-body-html" style="margin-top:8px;">${sanitizeNoticeBody(latest.body || "")}</div>
  `
    : `<p class="muted">등록된 공지가 없습니다. 신규 공지를 작성해 주세요.</p>`;

  const rows = notices
    .map(
      (n) => {
        var computedStatus = getNoticeStatusFromDates(n.noticeStartDate, n.noticeEndDate);
        var bodyPreview = noticeBodyPlainText(n.body || "");
        if (bodyPreview.length > 80) bodyPreview = bodyPreview.slice(0, 80) + "…";
        return `<tr data-notice-id="${escapeHtml(n.id)}">
          <td>${escapeHtml(n.category)}</td>
          <td class="notice-list-title">${escapeHtml(n.title)}</td>
          <td class="notice-list-body">${escapeHtml(bodyPreview || "-")}</td>
          <td>${escapeHtml(n.author || "-")}</td>
          <td>${formatNoticeDatetime(n.createdAt)}</td>
          <td>${escapeHtml(n.noticeStartDate || "-")} ~ ${escapeHtml(n.noticeEndDate || "-")}</td>
          <td>${statusTag(computedStatus)}</td>
          <td class="table-actions">
            <button type="button" class="btn-icon btn-edit notice-edit" data-id="${escapeHtml(n.id)}" title="수정">✎</button>
            <button type="button" class="btn-icon btn-delete notice-delete" data-id="${escapeHtml(n.id)}" title="삭제">×</button>
          </td>
        </tr>`;
      }
    )
    .join("");

  var latestSection = `
    <div class="grid">
      <div class="card card--full">
        <h3 class="card__title">최신 공지</h3>
        <div class="card__body">${latestHtml}</div>
      </div>
    </div>`;
  var listSection = `
    <div class="grid" style="margin-top:24px;">
      <div class="card card--full">
        <div class="card__head" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
          <h3 class="card__title" style="margin:0;">공지사항 목록</h3>
          <button type="button" class="btn btn--primary" id="btnAddNotice">신규 공지 작성</button>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th style="width:90px;">구분</th>
                <th style="width:180px;">제목</th>
                <th style="min-width:120px;">내용</th>
                <th style="width:90px;">작성자</th>
                <th style="width:130px;">작성일시</th>
                <th style="width:160px;">공지기간</th>
                <th style="width:80px;">상태</th>
                <th style="width:90px;">관리</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
  var modalHtml = `
    <div class="modal" id="noticeModal" aria-hidden="true">
      <div class="modal__backdrop" id="noticeModalBackdrop"></div>
      <div class="modal__box" role="dialog" aria-labelledby="noticeModalTitle">
        <h3 class="modal__title" id="noticeModalTitle">신규 공지 작성</h3>
        <input type="hidden" id="noticeEditId" value="" />
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
            <label class="form__label" for="noticeAuthor">작성자 이름</label>
            <input type="text" id="noticeAuthor" class="form__input" placeholder="작성자" />
          </div>
          <div class="form__row">
            <label class="form__label" for="noticeTitle">제목</label>
            <input type="text" id="noticeTitle" class="form__input" placeholder="공지 제목" required />
          </div>
          <div class="form__row">
            <label class="form__label">공지기간</label>
            <div class="form__inline" style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
              <input type="date" id="noticeStartDate" class="form__input" style="flex:1; min-width:140px;" />
              <span class="muted">~</span>
              <input type="date" id="noticeEndDate" class="form__input" style="flex:1; min-width:140px;" />
            </div>
          </div>
          <div class="form__row">
            <label class="form__label">본문</label>
            <div class="notice-body-editor-wrap">
              <div id="noticeBody" class="form__input form__textarea notice-body-editor" contenteditable="true" data-placeholder="공지 내용 (선택). 이미지 붙여넣기 또는 아래 버튼으로 추가 가능"></div>
              <div style="margin-top:6px;">
                <button type="button" class="btn btn--secondary btn--sm" id="noticeBodyInsertImage" title="이미지 추가">이미지 추가</button>
                <input type="file" id="noticeBodyImageInput" accept="image/*" style="position:absolute; left:-9999px;" />
              </div>
            </div>
          </div>
          <div class="form__actions">
            <button type="button" class="btn btn--secondary" id="noticeModalClose">취소</button>
            <button type="submit" class="btn btn--primary">등록</button>
          </div>
        </form>
      </div>
    </div>`;
  return { latestSection, listSection, modalHtml };
}

function escapeHtml(s) {
  if (s == null) return "";
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function sanitizeNoticeBody(html) {
  if (!html || typeof html !== "string") return "";
  var div = document.createElement("div");
  div.innerHTML = html;
  var allowedTags = ["P", "BR", "DIV", "SPAN", "STRONG", "EM", "B", "I", "IMG", "UL", "OL", "LI"];
  function sanitizeNode(node) {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1) return "";
    var tag = node.tagName.toUpperCase();
    if (allowedTags.indexOf(tag) === -1) return escapeHtml(node.textContent);
    if (tag === "IMG") {
      var src = (node.getAttribute("src") || "").trim();
      if (src.indexOf("data:") === 0 || src.indexOf("https:") === 0 || src.indexOf("http:") === 0) {
        return "<img src=\"" + escapeHtml(src) + "\" alt=\"\" style=\"max-width:100%;height:auto;\" />";
      }
      return "";
    }
    var out = "<" + tag.toLowerCase() + ">";
    for (var i = 0; i < node.childNodes.length; i++) out += sanitizeNode(node.childNodes[i]);
    return out + "</" + tag.toLowerCase() + ">";
  }
  var out = "";
  for (var j = 0; j < div.childNodes.length; j++) out += sanitizeNode(div.childNodes[j]);
  return out || escapeHtml(html);
}

function openNoticeModal(noticeId) {
  var editId = noticeId || "";
  var titleEl = document.getElementById("noticeModalTitle");
  var editInput = document.getElementById("noticeEditId");
  var form = document.getElementById("noticeForm");
  var bodyEl = document.getElementById("noticeBody");
  if (editInput) editInput.value = editId;
  if (titleEl) titleEl.textContent = editId ? "공지 수정" : "신규 공지 작성";
  if (form) form.reset();
  if (bodyEl) bodyEl.innerHTML = "";
  if (editId) {
    var list = getNotices();
    var n = list.find(function (x) { return x.id === editId; });
    if (n) {
      var cat = document.getElementById("noticeCategory");
      if (cat) cat.value = n.category || "";
      var author = document.getElementById("noticeAuthor");
      if (author) author.value = n.author || "";
      var title = document.getElementById("noticeTitle");
      if (title) title.value = n.title || "";
      var start = document.getElementById("noticeStartDate");
      if (start) start.value = n.noticeStartDate || "";
      var end = document.getElementById("noticeEndDate");
      if (end) end.value = n.noticeEndDate || "";
      if (bodyEl) bodyEl.innerHTML = n.body || "";
    }
  }
  var el = document.getElementById("noticeModal");
  if (el) {
    el.setAttribute("aria-hidden", "false");
    el.classList.add("modal--open");
    if (document.getElementById("noticeTitle")) document.getElementById("noticeTitle").focus();
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
  if (btn) btn.addEventListener("click", function () { openNoticeModal(); });
  if (closeBtn) closeBtn.addEventListener("click", closeNoticeModal);
  if (backdrop) backdrop.addEventListener("click", closeNoticeModal);
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const editInput = document.getElementById("noticeEditId");
      const editId = (editInput && editInput.value) ? editInput.value.trim() : "";
      const category = document.getElementById("noticeCategory").value.trim();
      const author = document.getElementById("noticeAuthor").value.trim();
      const title = document.getElementById("noticeTitle").value.trim();
      const bodyEl = document.getElementById("noticeBody");
      const body = (bodyEl && bodyEl.innerHTML) ? bodyEl.innerHTML.trim() : "";
      const noticeStartDate = document.getElementById("noticeStartDate").value.trim();
      const noticeEndDate = document.getElementById("noticeEndDate").value.trim();
      if (!title) return;
      if (editId) {
        updateNotice(editId, { category, author, title, body, noticeStartDate, noticeEndDate });
      } else {
        addNotice({ category, author, title, body, noticeStartDate, noticeEndDate });
      }
      form.reset();
      if (editInput) editInput.value = "";
      if (bodyEl) bodyEl.innerHTML = "";
      closeNoticeModal();
      render();
    });
  }
  document.querySelectorAll("#content .notice-edit").forEach(function (editBtn) {
    editBtn.addEventListener("click", function () {
      var id = this.getAttribute("data-id");
      if (id) openNoticeModal(id);
    });
  });
  document.querySelectorAll("#content .notice-delete").forEach(function (delBtn) {
    delBtn.addEventListener("click", function () {
      var id = this.getAttribute("data-id");
      if (!id) return;
      if (typeof confirm !== "undefined" && !confirm("이 공지를 삭제할까요?")) return;
      deleteNotice(id);
      render();
    });
  });
  var bodyEditor = document.getElementById("noticeBody");
  var imgBtn = document.getElementById("noticeBodyInsertImage");
  var imgInput = document.getElementById("noticeBodyImageInput");
  if (bodyEditor) {
    bodyEditor.addEventListener("paste", function (e) {
      var items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          var file = items[i].getAsFile();
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function (ev) {
            var img = document.createElement("img");
            img.src = ev.target.result;
            img.style.maxWidth = "100%";
            img.style.height = "auto";
            bodyEditor.focus();
            document.execCommand("insertHTML", false, img.outerHTML);
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    });
  }
  if (imgBtn && imgInput && bodyEditor) {
    imgBtn.addEventListener("click", function () { imgInput.click(); });
    imgInput.addEventListener("change", function () {
      var file = this.files && this.files[0];
      if (!file || !file.type.match(/^image\//)) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        var img = document.createElement("img");
        img.src = ev.target.result;
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        bodyEditor.focus();
        document.execCommand("insertHTML", false, img.outerHTML);
      };
      reader.readAsDataURL(file);
      this.value = "";
    });
  }
}

function renderContactsTab() {
  const list = getContacts();
  const rows = list
    .map(
      (c) => `
    <tr data-contact-id="${c.id}">
      <td>${escapeHtml(c.category)}</td>
      <td>${escapeHtml(c.company)}</td>
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.phone)}</td>
      <td>${escapeHtml(c.email)}</td>
      <td>${escapeHtml(c.note)}</td>
      <td class="table-actions">
        <button type="button" class="btn-icon btn-edit" data-id="${c.id}" title="수정">✎</button>
        <button type="button" class="btn-icon btn-delete" data-id="${c.id}" title="삭제">×</button>
      </td>
    </tr>`
    )
    .join("");
  const categoryOptions = CONTACT_CATEGORIES.map((cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join("");
  return `
    <div class="grid">
      <div class="card card--full">
        <div class="card__head" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
          <h3 class="card__title" style="margin:0;">연락망</h3>
          <button type="button" class="btn btn--primary" id="btnAddContact">추가</button>
        </div>
        <p class="card__body muted" style="margin-bottom:12px;">구분·업체·담당자·연락처를 관리합니다. 추가·수정·삭제 시 브라우저에 저장됩니다.</p>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th style="width:90px;">구분</th>
                <th style="width:110px;">업체명</th>
                <th style="width:120px;">담당자 이름</th>
                <th style="width:130px;">담당자 연락처</th>
                <th style="width:140px;">이메일</th>
                <th>비고</th>
                <th style="width:80px;"></th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="modal" id="contactModal" aria-hidden="true">
          <div class="modal__backdrop" id="contactModalBackdrop"></div>
          <div class="modal__box" role="dialog" aria-labelledby="contactModalTitle" style="max-width:480px;">
            <h3 class="modal__title" id="contactModalTitle">연락처 추가</h3>
            <form id="contactForm" class="form">
              <input type="hidden" id="contactId" value="" />
              <div class="form__row">
                <label class="form__label" for="contactCategory">구분</label>
                <select id="contactCategory" class="form__input" required>${categoryOptions}</select>
              </div>
              <div class="form__row">
                <label class="form__label" for="contactCompany">업체명</label>
                <input type="text" id="contactCompany" class="form__input" required />
              </div>
              <div class="form__row">
                <label class="form__label" for="contactName">담당자 이름</label>
                <input type="text" id="contactName" class="form__input" required />
              </div>
              <div class="form__row">
                <label class="form__label" for="contactPhone">담당자 연락처</label>
                <input type="text" id="contactPhone" class="form__input" placeholder="010-0000-0000" />
              </div>
              <div class="form__row">
                <label class="form__label" for="contactEmail">이메일</label>
                <input type="email" id="contactEmail" class="form__input" placeholder="example@email.com" />
              </div>
              <div class="form__row">
                <label class="form__label" for="contactNote">비고</label>
                <input type="text" id="contactNote" class="form__input" placeholder="비고" />
              </div>
              <div class="form__actions">
                <button type="button" class="btn btn--secondary" id="contactModalClose">취소</button>
                <button type="submit" class="btn btn--primary">저장</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}

function openContactModal(contact) {
  const modal = document.getElementById("contactModal");
  const title = document.getElementById("contactModalTitle");
  const idInput = document.getElementById("contactId");
  if (!modal || !title || !idInput) return;
  if (contact) {
    title.textContent = "연락처 수정";
    idInput.value = contact.id;
    document.getElementById("contactCategory").value = contact.category || "";
    document.getElementById("contactCompany").value = contact.company || "";
    document.getElementById("contactName").value = contact.name || "";
    document.getElementById("contactPhone").value = contact.phone || "";
    document.getElementById("contactEmail").value = contact.email || "";
    document.getElementById("contactNote").value = contact.note || "";
  } else {
    title.textContent = "연락처 추가";
    idInput.value = "";
    document.getElementById("contactForm").reset();
  }
  modal.setAttribute("aria-hidden", "false");
  modal.classList.add("modal--open");
  document.getElementById("contactName").focus();
}

function closeContactModal() {
  const modal = document.getElementById("contactModal");
  if (modal) {
    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("modal--open");
  }
}

function wireContacts() {
  const btnAdd = document.getElementById("btnAddContact");
  const form = document.getElementById("contactForm");
  const closeBtn = document.getElementById("contactModalClose");
  const backdrop = document.getElementById("contactModalBackdrop");
  if (btnAdd) btnAdd.addEventListener("click", () => openContactModal(null));
  if (closeBtn) closeBtn.addEventListener("click", closeContactModal);
  if (backdrop) backdrop.addEventListener("click", closeContactModal);
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const list = getContacts();
      const c = list.find((x) => x.id === id);
      if (c) openContactModal(c);
    });
  });
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (!confirm("이 연락처를 삭제할까요?")) return;
      deleteContact(id);
      render();
    });
  });
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("contactId").value.trim();
      const category = document.getElementById("contactCategory").value.trim();
      const company = document.getElementById("contactCompany").value.trim();
      const name = document.getElementById("contactName").value.trim();
      const phone = document.getElementById("contactPhone").value.trim();
      const email = document.getElementById("contactEmail").value.trim();
      const note = document.getElementById("contactNote").value.trim();
      if (!company || !name) return;
      const data = { category, company, name, phone, email, note };
      if (id) updateContact(id, data);
      else addContact(data);
      closeContactModal();
      render();
    });
  }
}

function renderKnowhowTab() {
  const list = getGlossary();
  const rows = list
    .map(
      (g) => `
    <tr data-glossary-id="${g.id}">
      <td>${escapeHtml(g.termKo)}</td>
      <td>${escapeHtml(g.termEn)}</td>
      <td>${escapeHtml(g.description)}</td>
      <td class="table-actions">
        <button type="button" class="btn-icon btn-edit" data-id="${g.id}" title="수정">✎</button>
        <button type="button" class="btn-icon btn-delete" data-id="${g.id}" title="삭제">×</button>
      </td>
    </tr>`
    )
    .join("");
  return `
    <div class="grid">
      <div class="card card--full">
        <div class="card__head" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
          <h3 class="card__title" style="margin:0;">물류 용어집</h3>
          <button type="button" class="btn btn--primary" id="btnAddGlossary">추가</button>
        </div>
        <p class="card__body muted" style="margin-bottom:12px;">용어를 추가·수정·삭제할 수 있습니다. 변경 내용은 브라우저에 저장됩니다.</p>
        <div class="table-wrap">
          <table class="table table--glossary">
            <thead>
              <tr>
                <th style="width:180px;">용어(한글)</th>
                <th style="width:200px;">용어(영어)</th>
                <th>설명</th>
                <th style="width:80px;"></th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="modal" id="glossaryModal" aria-hidden="true">
          <div class="modal__backdrop" id="glossaryModalBackdrop"></div>
          <div class="modal__box" role="dialog" aria-labelledby="glossaryModalTitle" style="max-width:520px;">
            <h3 class="modal__title" id="glossaryModalTitle">용어 추가</h3>
            <form id="glossaryForm" class="form">
              <input type="hidden" id="glossaryId" value="" />
              <div class="form__row">
                <label class="form__label" for="glossaryTermKo">용어(한글)</label>
                <input type="text" id="glossaryTermKo" class="form__input" required />
              </div>
              <div class="form__row">
                <label class="form__label" for="glossaryTermEn">용어(영어)</label>
                <input type="text" id="glossaryTermEn" class="form__input" />
              </div>
              <div class="form__row">
                <label class="form__label" for="glossaryDescription">설명</label>
                <textarea id="glossaryDescription" class="form__input form__textarea" rows="4"></textarea>
              </div>
              <div class="form__actions">
                <button type="button" class="btn btn--secondary" id="glossaryModalClose">취소</button>
                <button type="submit" class="btn btn--primary">저장</button>
              </div>
            </form>
          </div>
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
  `;
}

function openGlossaryModal(item) {
  const modal = document.getElementById("glossaryModal");
  const title = document.getElementById("glossaryModalTitle");
  const idInput = document.getElementById("glossaryId");
  if (!modal || !title || !idInput) return;
  if (item) {
    title.textContent = "용어 수정";
    idInput.value = item.id;
    document.getElementById("glossaryTermKo").value = item.termKo || "";
    document.getElementById("glossaryTermEn").value = item.termEn || "";
    document.getElementById("glossaryDescription").value = item.description || "";
  } else {
    title.textContent = "용어 추가";
    idInput.value = "";
    document.getElementById("glossaryForm").reset();
  }
  modal.setAttribute("aria-hidden", "false");
  modal.classList.add("modal--open");
  document.getElementById("glossaryTermKo").focus();
}

function closeGlossaryModal() {
  const modal = document.getElementById("glossaryModal");
  if (modal) {
    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("modal--open");
  }
}

function wireKnowhow() {
  const btnAdd = document.getElementById("btnAddGlossary");
  const form = document.getElementById("glossaryForm");
  const closeBtn = document.getElementById("glossaryModalClose");
  const backdrop = document.getElementById("glossaryModalBackdrop");
  if (btnAdd) btnAdd.addEventListener("click", () => openGlossaryModal(null));
  if (closeBtn) closeBtn.addEventListener("click", closeGlossaryModal);
  if (backdrop) backdrop.addEventListener("click", closeGlossaryModal);
  document.querySelectorAll("#content .btn-edit[data-id]").forEach((btn) => {
    if (btn.closest("[data-glossary-id]")) {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const g = getGlossary().find((x) => x.id === id);
        if (g) openGlossaryModal(g);
      });
    }
  });
  document.querySelectorAll("#content .btn-delete[data-id]").forEach((btn) => {
    if (btn.closest("[data-glossary-id]")) {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (!confirm("이 용어를 삭제할까요?")) return;
        deleteGlossaryItem(id);
        render();
      });
    }
  });
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("glossaryId").value.trim();
      const termKo = document.getElementById("glossaryTermKo").value.trim();
      const termEn = document.getElementById("glossaryTermEn").value.trim();
      const description = document.getElementById("glossaryDescription").value.trim();
      if (!termKo) return;
      const data = { termKo, termEn, description };
      if (id) updateGlossaryItem(id, data);
      else addGlossaryItem(data);
      closeGlossaryModal();
      render();
    });
  }
}

function renderMinigameTab() {
  return `
    <div class="minigame-wrap">
      <div class="card card--wide">
        <h3 class="card__title">돌림판</h3>
        <p class="card__body muted" style="margin-bottom:12px;">항목을 입력한 뒤 돌림판을 만들고 돌리세요. (커피 내기 등)</p>
        <div style="margin-bottom:12px;">
          <label class="minigame-label">항목 (한 줄에 하나)</label>
          <textarea id="wheelItems" class="minigame-textarea" rows="4" placeholder="김철수\n이영희\n박지훈\n최민수\n한소희"></textarea>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px;">
          <button type="button" class="btn btn--primary" id="wheelCreate">돌림판 만들기</button>
          <button type="button" class="btn btn--primary" id="wheelSpin" disabled>돌리기</button>
        </div>
        <div id="wheelContainer" class="wheel-container">
          <div id="wheelPointer" class="wheel-pointer"></div>
          <div id="wheel" class="wheel">
            <div id="wheelInner" class="wheel-inner"></div>
            <div id="wheelLabels" class="wheel-labels"></div>
          </div>
        </div>
        <div id="wheelResult" class="wheel-result"></div>
      </div>
    </div>
  `;
}

function renderNewsAndWeatherBlocks() {
  return `
    <div class="grid" style="margin-top:24px;">
      <div class="card card--half">
        <div id="logistics-news" class="news-section">
          <h3 class="card__title">물류 뉴스 AI 클리핑</h3>
          <p class="muted" style="margin-bottom:10px;">최신 물류/의약품 관련 뉴스를 불러옵니다.</p>
          <div class="news-list">뉴스를 불러오는 중...</div>
        </div>
      </div>
      <div class="card card--half">
        <div id="weather-check" class="weather-dashboard">
          <h3 class="card__title">물류센터 AI 기상 Dashboard</h3>
          <div class="weather-center-toggles">
            <button type="button" class="weather-toggle-btn is-active" data-center="osan" aria-pressed="true">오산</button>
            <button type="button" class="weather-toggle-btn" data-center="gimpo" aria-pressed="false">김포</button>
            <button type="button" class="weather-toggle-btn" data-center="hwaseong" aria-pressed="false">향남</button>
          </div>
          <div class="weather-content">
            <div class="weather-loading">날씨를 불러오는 중…</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderNoticesPage() {
  var tab = renderNoticesTab();
  return tab.latestSection + renderNewsAndWeatherBlocks() + tab.listSection + tab.modalHtml;
}

function renderAiStudyTab() {
  var list = getAiKnowhow();
  var knowhowHtml = list.length
    ? list.map(function (item) {
        return '<div class="ai-knowhow-item" data-id="' + escapeHtml(item.id) + '"><div class="ai-knowhow-item__head"><strong>' + escapeHtml(item.title || "") + '</strong><span class="muted">' + (item.createdAt || "") + '</span><button type="button" class="ai-knowhow-item__del" aria-label="삭제">×</button></div><div class="ai-knowhow-item__body">' + escapeHtml((item.body || "").replace(/\n/g, "<br/>")) + '</div></div>';
      }).join("")
    : '<p class="muted">등록된 노하우가 없습니다. 아래 버튼으로 추가해 보세요.</p>';
  var videoHtml = (AI_STUDY_VIDEOS || []).map(function (v) {
    return '<div class="video-item"><iframe class="video-iframe" src="https://www.youtube.com/embed/' + (v.id || "") + '" title="' + escapeHtml(v.title || "") + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><p class="video-title">' + escapeHtml(v.title || "") + '</p></div>';
  }).join("");

  var tipsList = getAiTips();
  var tipsHtml = tipsList.length
    ? tipsList.map(function (t) {
        return '<div class="ai-tip-item" data-id="' + escapeHtml(t.id) + '"><div class="ai-tip-item__head"><span class="tag">' + escapeHtml(t.aiTool || "") + '</span><span class="muted">' + (t.createdAt || "") + '</span><button type="button" class="ai-tip-item__del" aria-label="삭제">×</button></div><div class="ai-tip-item__situation"><strong>' + escapeHtml(t.situation || "") + '</strong></div><pre class="ai-tip-item__prompt">' + escapeHtml(t.prompt || "") + '</pre><div class="ai-tip-item__response muted">' + escapeHtml((t.responseExample || "").slice(0, 200)) + (t.responseExample && t.responseExample.length > 200 ? "…" : "") + '</div>' + (t.tip ? '<div class="ai-tip-item__tip">💡 ' + escapeHtml(t.tip) + '</div>' : '') + '</div>';
      }).join("")
    : '<p class="muted">등록된 꿀팁이 없습니다. 아래 버튼으로 프롬프트를 공유해 보세요.</p>';

  var quizHtml = '<div class="ai-quiz-list">' +
    '<div class="ai-quiz-item"><details><summary>퀴즈 1. status가 SHIPPED로 바뀌기까지 평소 2시간 걸리던 상품이 4시간째 PENDING이에요. ChatGPT에게 "이 주문 왜 이렇게 늦어?"라고 물었을 때, AI가 가장 먼저 확인하라고 할 만한 것은?</summary><p class="ai-quiz-answer">해당 주문의 피킹/포장 완료 시점과 현재 포장대·출고대 상태(해당 오더가 어느 단계에 머물러 있는지).</p></details></div>' +
    '<div class="ai-quiz-item"><details><summary>퀴즈 2. "OOO 상품, OOO 지역 배송 지연 예상! 담당자 확인 필요!" 알림을 자동 생성할 때 ChatGPT에 반드시 같이 넣어주는 게 좋은 데이터 3가지는?</summary><p class="ai-quiz-answer">① 상품(또는 product ID) ② 배송 지역(deliveryAddress 요약) ③ 지연/이상의 정도(평균 대비 150% 등)</p></details></div>' +
    '<div class="ai-quiz-item"><details><summary>퀴즈 3. 포장 완료된 박스 사진을 AI가 분석해 "테이프가 덜 붙었어요!"라고 할 때, AI가 사진에서 주로 보는 것은?</summary><p class="ai-quiz-answer">박스 이음선(뚜껑·접힌 부분)과 테이프가 덮는 영역이 적절히 겹쳐 있는지(밀봉 여부).</p></details></div>' +
    '</div>';

  return `
    <div class="grid">
      <div class="card card--wide">
        <h3 class="card__title">AI 업무 노하우</h3>
        <p class="muted" style="margin-bottom:12px;">AI 활용 업무 노하우를 하나씩 쌓아가세요.</p>
        <div class="ai-knowhow-list">${knowhowHtml}</div>
        <button type="button" class="btn btn--primary" id="aiKnowhowAdd" style="margin-top:12px;">노하우 추가</button>
      </div>
      <div class="card card--wide">
        <h3 class="card__title">AI 학습 컨텐츠</h3>
        <p class="muted" style="margin-bottom:12px;">AI 관련 유튜브 영상입니다. app.js의 AI_STUDY_VIDEOS에서 영상 ID를 수정·추가할 수 있습니다.</p>
        <div class="video-list">${videoHtml}</div>
      </div>
    </div>
    <div class="grid" style="margin-top:24px;">
      <div class="card card--wide">
        <h3 class="card__title">AI 꿀팁 & 프롬프트 공유</h3>
        <p class="muted" style="margin-bottom:12px;">직원들이 써본 AI 프롬프트와 팁을 공유합니다.</p>
        <div class="ai-tips-list">${tipsHtml}</div>
        <button type="button" class="btn btn--primary" id="aiTipAdd" style="margin-top:12px;">꿀팁 등록</button>
      </div>
      <div class="card">
        <h3 class="card__title">AI 퀴즈</h3>
        <p class="muted" style="margin-bottom:10px;">물류 현장 × AI 연결 퀴즈 (클릭하면 정답)</p>
        ${quizHtml}
      </div>
    </div>
    <div class="modal" id="aiKnowhowModal" aria-hidden="true">
      <div class="modal__backdrop" id="aiKnowhowModalBackdrop"></div>
      <div class="modal__box" role="dialog" aria-labelledby="aiKnowhowModalTitle">
        <h3 class="modal__title" id="aiKnowhowModalTitle">AI 업무 노하우 추가</h3>
        <form id="aiKnowhowForm" class="form">
          <div class="form__row">
            <label class="form__label" for="aiKnowhowTitle">제목</label>
            <input type="text" id="aiKnowhowTitle" class="form__input" placeholder="제목" required />
          </div>
          <div class="form__row">
            <label class="form__label" for="aiKnowhowBody">내용</label>
            <textarea id="aiKnowhowBody" class="form__input form__textarea" rows="5" placeholder="노하우 내용"></textarea>
          </div>
          <div class="form__actions">
            <button type="button" class="btn btn--secondary" id="aiKnowhowModalClose">취소</button>
            <button type="submit" class="btn btn--primary">저장</button>
          </div>
        </form>
      </div>
    </div>
    <div class="modal" id="aiTipModal" aria-hidden="true">
      <div class="modal__backdrop" id="aiTipModalBackdrop"></div>
      <div class="modal__box" role="dialog" aria-labelledby="aiTipModalTitle">
        <h3 class="modal__title" id="aiTipModalTitle">AI 꿀팁 등록</h3>
        <form id="aiTipForm" class="form">
          <div class="form__row">
            <label class="form__label" for="aiTipTool">사용 AI 툴</label>
            <input type="text" id="aiTipTool" class="form__input" placeholder="예: ChatGPT, Gemini, Midjourney" required />
          </div>
          <div class="form__row">
            <label class="form__label" for="aiTipSituation">상황 설명 (한 줄)</label>
            <input type="text" id="aiTipSituation" class="form__input" placeholder="어떤 업무/문제를 해결하려 했는지" required />
          </div>
          <div class="form__row">
            <label class="form__label" for="aiTipPrompt">실제 프롬프트</label>
            <textarea id="aiTipPrompt" class="form__input form__textarea" rows="4" placeholder="그대로 복붙 가능한 질문/지시문"></textarea>
          </div>
          <div class="form__row">
            <label class="form__label" for="aiTipResponse">AI 답변 예시 (요약 가능)</label>
            <textarea id="aiTipResponse" class="form__input form__textarea" rows="3" placeholder="요약 또는 일부 발췌"></textarea>
          </div>
          <div class="form__row">
            <label class="form__label" for="aiTipTip">개인적인 팁</label>
            <input type="text" id="aiTipTip" class="form__input" placeholder="톤 조정, 추가 질문, 언어 등 (선택)" />
          </div>
          <div class="form__actions">
            <button type="button" class="btn btn--secondary" id="aiTipModalClose">취소</button>
            <button type="submit" class="btn btn--primary">저장</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

const ROUTES = {
  notices: {
    title: "주요 공지사항",
    desc: "최신 공지, 공지 목록, 뉴스 클리핑, 날씨/점검포인트를 확인합니다.",
    render: renderNoticesPage,
  },
  dashboard: {
    title: "AI Dashboard",
    desc: "SLA, KPI, 손익, 물동량 등 주요 지표를 한눈에 봅니다.",
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
  "ai-study": {
    title: "AI Study",
    desc: "AI 업무 노하우와 AI 학습 콘텐츠(유튜브)를 확인합니다.",
    render: renderAiStudyTab,
  },
  simulator: {
    title: "AI Simulator",
    desc: "물동량 포케스팅·스태핑(인력) 계획 등을 시뮬레이션합니다.",
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
  "biz-status": {
    title: "사업부 현황",
    desc: "물류센터, 조직도, 물류사업 소개를 확인합니다.",
    render: () => `
      <div class="grid">
        <div class="card card--half">
          <h3 class="card__title">물류센터 위치</h3>
          <p class="card__body muted" style="margin-bottom:10px;">주소지 기준 로케이션입니다. 마커를 클릭하면 명칭·주소를 볼 수 있습니다.</p>
          <div id="centers-map" class="centers-map"></div>
        </div>
        <div class="card card--half">
          <h3 class="card__title">물류센터 현황</h3>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th style="width:100px;">구분</th>
                  <th style="width:140px;">명칭</th>
                  <th>주소지</th>
                </tr>
              </thead>
              <tbody>
                ${CENTERS_LOCATIONS.map(function (c) {
                  return "<tr><td>" + escapeHtml(c.type || "") + "</td><td>" + escapeHtml(c.name || "") + "</td><td>" + escapeHtml(c.address || "") + "</td></tr>";
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card card--full">
          <h3 class="card__title">조직도</h3>
          <div class="embed-wrap" style="margin-top:10px;">
            <iframe title="조직도 스프레드시트" class="embed-iframe" src="https://docs.google.com/spreadsheets/d/e/2PACX-1vTqEhx3bsog9At6U6Yowe0kXzEln7Pa5JdZti6JjZ1wOCySX2WqbxqnQ1l-fOsibLAesE4jEjDS6Qto/pubhtml"></iframe>
          </div>
        </div>
        <div class="card card--full">
          <h3 class="card__title">물류사업 소개</h3>
          <div class="card__body">
            <p style="margin-bottom:12px;">의료/헬스케어 특성에 맞춘 안정적인 풀필먼트 운영과 데이터 기반 개선을 제공합니다.</p>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:12px;">
              <div><strong>서비스 범위</strong><br/><span class="muted">입고 · 보관 · 피킹/포장 · 출고 · 반품 · 재고관리</span></div>
              <div><strong>운영 원칙</strong><br/><span class="muted">정확도 우선 · SLA 준수 · 표준화 · 안전</span></div>
              <div><strong>주요 시스템</strong><br/><span class="muted">WMS · OMS · 리포팅(추후 연동)</span></div>
            </div>
          </div>
        </div>
      </div>
    `,
  },
  "works-archive": {
    title: "Works archive",
    desc: "주요 업무 진행사항, 연락망, 노하우 공유를 확인합니다.",
    render: function () {
      return (
        '<div class="grid"><div class="card card--full"><h3 class="card__title">주요 업무 진행사항</h3><div class="table-wrap"><table class="table"><thead><tr><th>과제</th><th>담당</th><th>기한</th><th>상태</th><th>메모</th></tr></thead><tbody><tr><td>피킹 동선 개선</td><td>운영팀</td><td>2026-02-20</td><td><span class="tag warn">진행중</span></td><td>구역 재배치 검토</td></tr><tr><td>대시보드 지표 정의</td><td>기획</td><td>2026-02-15</td><td><span class="tag warn">진행중</span></td><td>SLA/리드타임 정의 합의</td></tr><tr><td>반품 프로세스 표준화</td><td>운영팀</td><td>2026-03-05</td><td><span class="tag">대기</span></td><td>To-Be 문서 작성 예정</td></tr></tbody></table></div></div></div>' +
        renderContactsTab() +
        renderKnowhowTab()
      );
    },
  },
  etc: {
    title: "기타",
    desc: "페이지 피드백, 미니게임을 확인합니다.",
    render: function () {
      return (
        '<div class="grid"><div class="card card--wide"><h3 class="card__title">페이지 피드백</h3><div class="card__body"><p class="muted">요청사항/개선 의견을 수집합니다(설문/폼 연결 예정).</p><div style="margin-top:10px;"><span class="tag">기능 개선</span> <span class="tag">콘텐츠 추가</span> <span class="tag">버그</span></div></div></div></div>' +
        renderMinigameTab()
      );
    },
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

var PAGE_HEADER_TITLES = { dashboard: "AI Dashboard", simulator: "AI Simulator", "ai-study": "AI Study", "biz-status": "사업부 현황", "works-archive": "Works archive", etc: "기타" };
function render() {
  const routeKey = getRouteFromHash();
  const route = ROUTES[routeKey];
  var headerTitle = PAGE_HEADER_TITLES[routeKey] || route.title;
  document.getElementById("pageTitle").textContent = headerTitle;
  document.getElementById("pageDesc").textContent = route.desc;
  document.getElementById("content").innerHTML = route.render();
  setActiveNav(routeKey);
  if (routeKey === "notices") { wireNotices(); wireIntegrated(); }
  if (routeKey === "ai-study") wireAiStudy();
  if (routeKey === "biz-status") setTimeout(initCentersMap, 80);
  if (routeKey === "works-archive") { wireContacts(); wireKnowhow(); }
  if (routeKey === "etc") wireMinigame();
}

function wireAiStudy() {
  var modal = document.getElementById("aiKnowhowModal");
  var addBtn = document.getElementById("aiKnowhowAdd");
  var closeBtn = document.getElementById("aiKnowhowModalClose");
  var backdrop = document.getElementById("aiKnowhowModalBackdrop");
  var form = document.getElementById("aiKnowhowForm");
  var listEl = document.querySelector(".ai-knowhow-list");

  function openModal() {
    if (modal) { modal.setAttribute("aria-hidden", "false"); modal.classList.add("modal--open"); }
    var t = document.getElementById("aiKnowhowTitle");
    var b = document.getElementById("aiKnowhowBody");
    if (t) t.value = "";
    if (b) b.value = "";
    if (t) t.focus();
  }
  function closeModal() {
    if (modal) { modal.setAttribute("aria-hidden", "true"); modal.classList.remove("modal--open"); }
  }

  if (addBtn) addBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var title = (document.getElementById("aiKnowhowTitle") && document.getElementById("aiKnowhowTitle").value || "").trim();
      var body = (document.getElementById("aiKnowhowBody") && document.getElementById("aiKnowhowBody").value || "").trim();
      if (!title) return;
      addAiKnowhowItem({ title: title, body: body });
      closeModal();
      render();
    });
  }
  if (listEl) {
    listEl.addEventListener("click", function (e) {
      var del = e.target.closest(".ai-knowhow-item__del");
      if (!del) return;
      var item = e.target.closest(".ai-knowhow-item");
      if (item && item.dataset.id && confirm("이 노하우를 삭제할까요?")) {
        deleteAiKnowhowItem(item.dataset.id);
        render();
      }
    });
  }

  var tipModal = document.getElementById("aiTipModal");
  var tipAddBtn = document.getElementById("aiTipAdd");
  var tipCloseBtn = document.getElementById("aiTipModalClose");
  var tipBackdrop = document.getElementById("aiTipModalBackdrop");
  var tipForm = document.getElementById("aiTipForm");
  var tipsListEl = document.querySelector(".ai-tips-list");
  function openTipModal() {
    if (tipModal) { tipModal.setAttribute("aria-hidden", "false"); tipModal.classList.add("modal--open"); }
    ["aiTipTool", "aiTipSituation", "aiTipPrompt", "aiTipResponse", "aiTipTip"].forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ""; });
    var first = document.getElementById("aiTipTool");
    if (first) first.focus();
  }
  function closeTipModal() {
    if (tipModal) { tipModal.setAttribute("aria-hidden", "true"); tipModal.classList.remove("modal--open"); }
  }
  if (tipAddBtn) tipAddBtn.addEventListener("click", openTipModal);
  if (tipCloseBtn) tipCloseBtn.addEventListener("click", closeTipModal);
  if (tipBackdrop) tipBackdrop.addEventListener("click", closeTipModal);
  if (tipForm) {
    tipForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var aiTool = (document.getElementById("aiTipTool") && document.getElementById("aiTipTool").value || "").trim();
      var situation = (document.getElementById("aiTipSituation") && document.getElementById("aiTipSituation").value || "").trim();
      var prompt = (document.getElementById("aiTipPrompt") && document.getElementById("aiTipPrompt").value || "").trim();
      var responseExample = (document.getElementById("aiTipResponse") && document.getElementById("aiTipResponse").value || "").trim();
      var tip = (document.getElementById("aiTipTip") && document.getElementById("aiTipTip").value || "").trim();
      if (!aiTool || !situation) return;
      addAiTip({ aiTool: aiTool, situation: situation, prompt: prompt, responseExample: responseExample, tip: tip });
      closeTipModal();
      render();
    });
  }
  if (tipsListEl) {
    tipsListEl.addEventListener("click", function (e) {
      var del = e.target.closest(".ai-tip-item__del");
      if (!del) return;
      var item = e.target.closest(".ai-tip-item");
      if (item && item.dataset.id && confirm("이 꿀팁을 삭제할까요?")) {
        deleteAiTip(item.dataset.id);
        render();
      }
    });
  }
}

function wireMinigame() {
  var wheelItemsEl = document.getElementById("wheelItems");
  var wheelCreateBtn = document.getElementById("wheelCreate");
  var wheelSpinBtn = document.getElementById("wheelSpin");
  var wheelEl = document.getElementById("wheel");
  var wheelInner = document.getElementById("wheelInner");
  var wheelLabels = document.getElementById("wheelLabels");
  var wheelResultEl = document.getElementById("wheelResult");
  var wheelItems = [];
  var wheelRotation = 0;

  if (wheelCreateBtn && wheelEl && wheelInner && wheelLabels) {
    wheelCreateBtn.addEventListener("click", function () {
      var text = (wheelItemsEl && wheelItemsEl.value || "").trim();
      wheelItems = text.split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean);
      if (wheelItems.length < 2) {
        alert("항목을 2개 이상 입력해 주세요.");
        return;
      }
      var n = wheelItems.length;
      var segmentAngle = 360 / n;
      var parts = [];
      for (var i = 0; i < n; i++) {
        parts.push("hsl(" + (200 + (i * 40) % 160) + ", 55%, 48%) " + (i * segmentAngle) + "deg " + ((i + 1) * segmentAngle) + "deg");
      }
      wheelInner.style.background = "conic-gradient(" + parts.join(", ") + ")";
      wheelLabels.innerHTML = "";
      for (var i = 0; i < n; i++) {
        var angleDeg = (i + 0.5) * segmentAngle;
        var angleRad = (angleDeg - 90) * Math.PI / 180;
        var r = 38;
        var left = 50 + r * Math.cos(angleRad);
        var top = 50 + r * Math.sin(angleRad);
        var span = document.createElement("span");
        span.className = "wheel-label";
        span.textContent = wheelItems[i];
        span.style.left = left + "%";
        span.style.top = top + "%";
        span.style.transform = "translate(-50%, -50%) rotate(" + angleDeg + "deg)";
        wheelLabels.appendChild(span);
      }
      wheelResultEl.textContent = "";
      wheelResultEl.classList.remove("is-visible");
      wheelSpinBtn.disabled = false;
      wheelRotation = 0;
      wheelEl.style.transition = "none";
      wheelEl.style.transform = "rotate(0deg)";
    });
  }
  if (wheelSpinBtn && wheelEl && wheelResultEl) {
    wheelSpinBtn.addEventListener("click", function () {
      if (wheelItems.length < 2) return;
      wheelSpinBtn.disabled = true;
      var turns = 5 + Math.floor(Math.random() * 4);
      var segAngle = 360 / wheelItems.length;
      var randSeg = Math.floor(Math.random() * wheelItems.length);
      var finalAngle = 360 * turns + (360 - randSeg * segAngle - segAngle / 2) + (Math.random() * segAngle * 0.8);
      wheelRotation += finalAngle;
      wheelEl.style.transition = "transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)";
      wheelEl.style.transform = "rotate(" + wheelRotation + "deg)";
      setTimeout(function () {
        var normalized = (360 - (wheelRotation % 360) + 360) % 360;
        var idx = Math.floor(normalized / segAngle) % wheelItems.length;
        wheelResultEl.textContent = "결과: " + wheelItems[idx];
        wheelResultEl.classList.add("is-visible");
        wheelSpinBtn.disabled = false;
      }, 4100);
    });
  }
}

/**
 * 물류 뉴스 클리핑: Google News RSS + rss2json로 #logistics-news .news-list를 채웁니다.
 * - 키워드: 물류 OR 의약품 (한국어)
 * - 최대 10건, 제목 클릭 시 새 창, 날짜 YYYY.MM.DD 표시
 * - CORS 회피: rss2json.com API 사용
 */
function fetchLogisticsNews() {
  var newsList = document.querySelector("#logistics-news .news-list");
  if (!newsList) return;
  var rssUrl = "https://news.google.com/rss/search?q=물류+OR+의약품&hl=ko&gl=KR&ceid=KR:ko";
  var apiUrl = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rssUrl);
  fetch(apiUrl)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.status !== "ok") {
        newsList.innerHTML = '<p class="muted">오류: ' + escapeHtml(data.message || "RSS 변환 실패") + "</p>";
        return;
      }
      var items = (data.items && Array.isArray(data.items)) ? data.items.slice(0, 10) : [];
      if (items.length) {
        newsList.innerHTML = items.map(function (item) {
          var title = escapeHtml(item.title || "(제목 없음)");
          var link = item.link ? item.link : "#";
          var dateStr = "";
          if (item.pubDate) {
            var d = new Date(item.pubDate);
            dateStr = d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0");
          }
          var source = item.author ? " · " + escapeHtml(item.author) : "";
          return '<div class="news-item"><a href="' + link + '" target="_blank" rel="noopener">' + title + '</a><p class="muted">' + dateStr + source + "</p></div>";
        }).join("");
      } else {
        newsList.innerHTML = '<p class="muted">검색 결과가 없습니다.</p>';
      }
    })
    .catch(function (err) {
      newsList.innerHTML = '<p class="muted">뉴스를 불러오지 못했습니다. 네트워크를 확인해 주세요.</p>';
    });
}

var WEATHER_CENTERS = {
  osan: { name: "오산", lat: 37.1499, lon: 127.0772 },
  gimpo: { name: "김포", lat: 37.6151, lon: 126.7156 },
  hwaseong: { name: "향남", lat: 37.1995, lon: 126.8310 }
};

function weatherCodeToEmoji(code) {
  if (code == null) return "🌡️";
  var c = parseInt(code, 10);
  if (c === 0) return "☀️";
  if (c >= 1 && c <= 3) return "⛅";
  if (c >= 45 && c <= 48) return "🌫️";
  if (c >= 51 && c <= 67) return "🌧️";
  if (c >= 71 && c <= 77) return "❄️";
  if (c >= 80 && c <= 99) return "🌦️";
  return "🌡️";
}

var weatherChartInstance = null;

async function fetchWeatherDashboard(centerKey) {
  var weatherContent = document.querySelector("#weather-check .weather-content");
  if (!weatherContent) return;
  var center = WEATHER_CENTERS[centerKey] || WEATHER_CENTERS.osan;
  var lat = center.lat, lon = center.lon;
  weatherContent.innerHTML = "<div class=\"weather-loading\">날씨를 불러오는 중…</div>";
  var url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon +
    "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation" +
    "&hourly=temperature_2m,relative_humidity_2m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weather_code" +
    "&timezone=Asia/Seoul";
  try {
    var res = await fetch(url);
    var data = await res.json();
    if (!data.current || !data.daily) {
      weatherContent.innerHTML = "<div class=\"weather-error\"><p>날씨 정보를 불러올 수 없습니다.</p></div>";
      return;
    }
    var cur = data.current;
    var temp = cur.temperature_2m != null ? Math.round(cur.temperature_2m) : null;
    var humidity = cur.relative_humidity_2m != null ? Math.round(cur.relative_humidity_2m) : null;
    var wind = cur.wind_speed_10m != null ? Math.round(cur.wind_speed_10m) : null;
    var code = cur.weather_code;
    var precipMm = cur.precipitation != null ? cur.precipitation : null;
    var now = new Date();
    var hourIndex = now.getHours();
    var pop = (data.hourly && data.hourly.precipitation_probability && data.hourly.precipitation_probability[hourIndex] != null)
      ? data.hourly.precipitation_probability[hourIndex] : (data.daily.precipitation_probability_max && data.daily.precipitation_probability_max[0] != null ? data.daily.precipitation_probability_max[0] : null);

    var insights = [];
    if (pop != null && pop >= 70) insights.push("센터 누수 및 출입구 방수 상태 점검하세요.");
    if (humidity != null && humidity >= 80) insights.push("의약품 및 민감 화물 습도 관리 확인하세요.");
    if (wind != null && wind >= 12) insights.push("야드 적재물 및 낙하물 위험 점검하세요.");
    if (temp != null && temp >= 30) insights.push("냉장/냉동 구역 온도 점검하세요.");
    if (temp != null && temp <= 0) insights.push("결빙 및 도크 슬립 위험 점검하세요.");

    var riskCount = insights.length;
    var riskClass = riskCount >= 2 ? "weather-risk--danger" : (riskCount === 1 ? "weather-risk--warn" : "weather-risk--ok");
    var riskLabel = riskCount >= 2 ? "경고" : (riskCount === 1 ? "주의" : "정상");

    var daily = data.daily;
    var days = (daily.time || []).slice(0, 7);
    var maxTemps = (daily.temperature_2m_max || []).slice(0, 7);
    var minTemps = (daily.temperature_2m_min || []).slice(0, 7);
    var dailyCodes = (daily.weather_code || []).slice(0, 7);
    var dailyPop = (daily.precipitation_probability_max || []).slice(0, 7);
    var dailyPrecipSum = (daily.precipitation_sum || []).slice(0, 7);

    var weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    var dayLabels = days.map(function (d) {
      var date = new Date(d);
      var m = date.getMonth() + 1, day = date.getDate(), wd = weekdays[date.getDay()];
      return (m + "/" + day + " " + wd);
    });

    var riskDetailHtml = riskCount > 0
      ? "<div class=\"weather-risk-detail-wrap\"><span class=\"weather-risk-detail-label\">[AI Agent 위험관리 제안]</span> <span class=\"weather-risk-detail\">" + insights.map(function (t) { return escapeHtml(t); }).join(" · ") + "</span></div>"
      : "";
    var currentCardHtml =
      "<div class=\"weather-current-card\">" +
      "<div class=\"weather-current-icon\">" + weatherCodeToEmoji(code) + "</div>" +
      "<div class=\"weather-current-temp\">" + (temp != null ? temp + "℃" : "-") + "</div>" +
      "<div class=\"weather-current-details\">" +
      "<span>습도 " + (humidity != null ? humidity + "%" : "-") + "</span>" +
      "<span>강수확률 " + (pop != null ? pop + "%" : "-") + "</span>" +
      "<span>강수량 " + (precipMm != null ? precipMm + "mm" : "-") + "</span>" +
      "<span>풍속 " + (wind != null ? wind + " km/h" : "-") + "</span>" +
      "</div>" +
      "<div class=\"weather-risk " + riskClass + "\">위험도: " + riskLabel + "</div>" + riskDetailHtml +
      "</div>";

    var forecastHtml = "<div class=\"weather-forecast-scroll\"><div class=\"weather-forecast-inner\">" +
      days.map(function (_, i) {
        var popVal = dailyPop[i] != null ? dailyPop[i] + "%" : "-";
        var sumVal = dailyPrecipSum[i] != null ? dailyPrecipSum[i] + "mm" : "-";
        return "<div class=\"weather-forecast-day\"><div class=\"weather-forecast-day-icon\">" + weatherCodeToEmoji(dailyCodes[i]) + "</div><div class=\"weather-forecast-day-date\">" + escapeHtml(dayLabels[i]) + "</div><div class=\"weather-forecast-day-max\">" + (maxTemps[i] != null ? Math.round(maxTemps[i]) + "℃" : "-") + "</div><div class=\"weather-forecast-day-min\">" + (minTemps[i] != null ? Math.round(minTemps[i]) + "℃" : "-") + "</div><div class=\"weather-forecast-day-pop\">강수 " + popVal + "</div><div class=\"weather-forecast-day-precip\">" + sumVal + "</div></div>";
      }).join("") +
      "</div></div>";

    var chartHtml = "<div class=\"weather-chart-wrap\"><canvas id=\"weatherChart\" height=\"120\"></canvas></div>";

    weatherContent.innerHTML = currentCardHtml + forecastHtml + chartHtml;

    var hourlyTime = (data.hourly && data.hourly.time) ? data.hourly.time : [];
    var hourlyTemp = (data.hourly && data.hourly.temperature_2m) ? data.hourly.temperature_2m : [];
    var hourlyHumidity = (data.hourly && data.hourly.relative_humidity_2m) ? data.hourly.relative_humidity_2m : [];
    var hourLabels = hourlyTime.map(function (t) {
      var d = new Date(t);
      return (d.getMonth() + 1) + "/" + d.getDate() + " " + d.getHours() + "시";
    });

    if (typeof Chart !== "undefined" && (hourlyTemp.length > 0 || maxTemps.length > 0)) {
      var ctx = document.getElementById("weatherChart");
      if (ctx) {
        if (weatherChartInstance) weatherChartInstance.destroy();
        var chartLabels = hourlyTemp.length ? hourLabels : dayLabels;
        var chartData = hourlyTemp.length ? hourlyTemp.map(function (v) { return v != null ? Math.round(v * 10) / 10 : null; }) : maxTemps.map(function (v) { return v != null ? Math.round(v) : null; });
        var len = chartLabels.length;
        var tempLine1 = centerKey === "osan" ? 2 : 15;
        var tempLine2 = centerKey === "osan" ? 8 : 25;
        var line1Arr = [];
        var line2Arr = [];
        var humidity70Arr = [];
        for (var i = 0; i < len; i++) {
          line1Arr.push(tempLine1);
          line2Arr.push(tempLine2);
          humidity70Arr.push(70);
        }
        var humidityData = hourlyHumidity.length ? hourlyHumidity.slice(0, len).map(function (v) { return v != null ? v : null; }) : [];
        var datasets = [
          { label: "기온(℃)", data: chartData, borderColor: "rgb(0, 122, 204)", backgroundColor: "rgba(0, 122, 204, 0.1)", fill: true, tension: 0.3, yAxisID: "y" },
          { label: tempLine1 + "℃ 기준", data: line1Arr, borderColor: "rgba(150, 150, 150, 0.8)", borderDash: [6, 4], fill: false, pointRadius: 0, yAxisID: "y" },
          { label: tempLine2 + "℃ 기준", data: line2Arr, borderColor: "rgba(150, 150, 150, 0.8)", borderDash: [6, 4], fill: false, pointRadius: 0, yAxisID: "y" }
        ];
        if (humidityData.length) {
          datasets.push({ label: "습도(%)", data: humidityData, borderColor: "rgb(120, 180, 120)", backgroundColor: "rgba(120, 180, 120, 0.1)", fill: true, tension: 0.3, yAxisID: "y1" });
          datasets.push({ label: "70% 기준", data: humidity70Arr, borderColor: "rgba(100, 140, 100, 0.8)", borderDash: [6, 4], fill: false, pointRadius: 0, yAxisID: "y1" });
        }
        weatherChartInstance = new Chart(ctx.getContext("2d"), {
          type: "line",
          data: { labels: chartLabels, datasets: datasets },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: { mode: "index", intersect: false },
            plugins: {
              legend: { display: true, position: "top" },
              zoom: {
              zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "xy", drag: { enabled: false } },
              pan: { enabled: true, mode: "xy", modifierKey: null, threshold: 5 }
            }
            },
            scales: {
              y: { min: -20, max: 50, title: { display: true, text: "기온(℃)" } },
              y1: humidityData.length ? { position: "right", min: 0, max: 100, title: { display: true, text: "습도(%)" }, grid: { drawOnChartArea: false } } : undefined,
              x: { ticks: { maxRotation: 45, maxTicksLimit: hourlyTemp.length > 24 ? 24 : 12 } }
            }
          }
        });
      }
    }
  } catch (err) {
    weatherContent.innerHTML = "<div class=\"weather-error\"><p>날씨 정보를 불러올 수 없습니다.</p></div>";
  }
}

function wireIntegrated() {
  fetchLogisticsNews();

  var toggles = document.querySelectorAll("#weather-check .weather-toggle-btn");
  var currentCenter = "osan";
  toggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var centerKey = btn.getAttribute("data-center");
      if (!centerKey) return;
      currentCenter = centerKey;
      toggles.forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      fetchWeatherDashboard(centerKey);
    });
  });
  fetchWeatherDashboard(currentCenter);
}

function initFloatingUtils() {
  var scrollBtn = document.getElementById("scrollTopBtn");
  var themeBtn = document.getElementById("toggleThemeBtn");
  if (scrollBtn) {
    scrollBtn.addEventListener("click", function () {
      var content = document.getElementById("content");
      if (content) content.scrollTo({ top: 0, behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");
      try {
        localStorage.setItem("fulfillment-theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
      } catch (_) {}
    });
    try {
      if (localStorage.getItem("fulfillment-theme") === "dark") document.body.classList.add("dark-mode");
    } catch (_) {}
  }
}

function initChatBotFab() {
  var fab = document.getElementById("chatBotFab");
  var panel = document.getElementById("chatPanel");
  var closeBtn = document.getElementById("chatPanelClose");
  var input = document.getElementById("chatInput");
  var sendBtn = document.getElementById("chatSend");
  var messagesEl = document.getElementById("chatMessages");

  function getGeminiKey() {
    try {
      var saved = localStorage.getItem(GEMINI_API_KEY_KEY);
      if (saved && saved.trim()) return saved.trim();
    } catch (_) {}
    return typeof DEFAULT_GEMINI_API_KEY === "string" ? DEFAULT_GEMINI_API_KEY : "";
  }
  function setGeminiKey(val) {
    try { localStorage.setItem(GEMINI_API_KEY_KEY, val || ""); } catch (_) {}
  }

  function openPanel() {
    if (panel) {
      panel.classList.add("chat-panel--open");
      panel.setAttribute("aria-hidden", "false");
      if (input) input.focus();
    }
  }
  function closePanel() {
    if (panel) {
      panel.classList.remove("chat-panel--open");
      panel.setAttribute("aria-hidden", "true");
    }
  }
  function appendMsg(isUser, text, isPlaceholder) {
    if (!messagesEl) return null;
    var div = document.createElement("div");
    div.className = "chat-msg " + (isUser ? "chat-msg--user" : "chat-msg--bot") + (isPlaceholder ? " chat-msg--loading" : "");
    div.innerHTML = "<span class=\"chat-msg__label\">" + (isUser ? "You" : "Bot") + "</span><p class=\"chat-msg__text\">" + escapeHtml(text) + "</p>";
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }
  function setMsgText(div, text) {
    if (!div) return;
    var p = div.querySelector(".chat-msg__text");
    if (p) p.textContent = text;
    if (div.classList) div.classList.remove("chat-msg--loading");
  }

  var chatHistory = [];

  function send() {
    var text = (input && input.value || "").trim();
    if (!text) return;
    var apiKey = getGeminiKey().trim();
    if (!apiKey) {
      appendMsg(true, text);
      if (input) input.value = "";
      appendMsg(false, "API 키를 사용할 수 없습니다. 관리자에게 문의해 주세요.");
      return;
    }
    appendMsg(true, text);
    if (input) input.value = "";
    var loadingEl = appendMsg(false, "답변 생성 중…", true);
    sendBtn.disabled = true;

    var contents = chatHistory.slice(-GEMINI_MAX_HISTORY).map(function (m) {
      return { role: m.role, parts: [{ text: m.text }] };
    });
    contents.push({ role: "user", parts: [{ text: text }] });

    var pageContext = buildPageContextForChat();
    var systemText = "You are a helpful assistant for the Fulfillment business team (풀필먼트사업부 AI Workspace). Answer concisely in Korean when the user writes in Korean.\n\nWhen answering, use ONLY the following information from this workspace. If the answer is not in the data below, say you don't have that information in the workspace and suggest checking the relevant tab (공지사항, 업무 연락망, 물류 용어집, 센터 소개). Do not make up contact names, phone numbers, or notice content.\n\n--- Workspace data ---\n" + pageContext;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent?key=" + encodeURIComponent(apiKey);
    var body = {
      contents: contents,
      systemInstruction: { parts: [{ text: systemText }] },
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    };
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (result) {
        if (result.ok && result.data.candidates && result.data.candidates[0]) {
          var reply = (result.data.candidates[0].content && result.data.candidates[0].content.parts && result.data.candidates[0].content.parts[0])
            ? result.data.candidates[0].content.parts[0].text || ""
            : "";
          chatHistory.push({ role: "user", text: text });
          chatHistory.push({ role: "model", text: reply });
          setMsgText(loadingEl, reply || "(응답 없음)");
        } else {
          var errMsg = (result.data.error && result.data.error.message) ? result.data.error.message : "응답을 가져오지 못했습니다.";
          if (result.data.error && result.data.error.code === 403) errMsg = "API 키가 유효하지 않거나 권한이 없습니다. 키를 확인해 주세요.";
          setMsgText(loadingEl, "오류: " + errMsg);
        }
      })
      .catch(function (err) {
        setMsgText(loadingEl, "오류: " + (err.message || "네트워크 오류"));
      })
      .then(function () { sendBtn.disabled = false; });
  }

  if (fab) fab.addEventListener("click", openPanel);
  if (closeBtn) closeBtn.addEventListener("click", closePanel);
  if (sendBtn) sendBtn.addEventListener("click", send);
  if (input) input.addEventListener("keydown", function (e) { if (e.key === "Enter") send(); });

  var resizeHandle = document.getElementById("chatPanelResize");
  if (resizeHandle && panel) {
    var minW = 320, minH = 320;
    var maxW = Math.min(560, window.innerWidth - 48);
    var maxH = Math.floor(window.innerHeight * 0.85);
    resizeHandle.addEventListener("mousedown", function (e) {
      e.preventDefault();
      var startX = e.clientX, startY = e.clientY;
      var startW = panel.offsetWidth, startH = panel.offsetHeight;
      function onMove(moveEvent) {
        var dx = startX - moveEvent.clientX;
        var dy = startY - moveEvent.clientY;
        var w = Math.max(minW, Math.min(maxW, startW + dx));
        var h = Math.max(minH, Math.min(maxH, startH + dy));
        panel.style.width = w + "px";
        panel.style.height = h + "px";
      }
      function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  }
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
  initFloatingUtils();
  initChatBotFab();
  render();
});

