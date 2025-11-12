
// script.js — клиентская логика для Eporner client-only app

// ====== CONFIG ======
const API_BASE = "https://www.eporner.com/api/v2/search"; // основной endpoint (если CORS — потребуется прокси)
const PER_PAGE = 10;
const TERMS_KEY = "eporner_terms_accepted_v1";
const FETCH_TIMEOUT_MS = 12000; // 12s timeout

// ====== STATE ======
let state = {
  query: "",        // текущий запрос
  page: 1,          // следующая страница для загрузки
  totalPages: Infinity,
  loading: false,
  ended: false
};

// ====== DOM ======
const el = {
  termsModal: document.getElementById("terms-modal"),
  acceptBtn: document.getElementById("accept-btn"),
  searchForm: document.getElementById("search-form"),
  searchInput: document.getElementById("search-input"),
  videoContainer: document.getElementById("video-container"),
  loading: document.getElementById("loading"),
  endMessage: document.getElementById("end-message"),
  errorMessage: document.getElementById("error-message"),
  noResults: document.getElementById("no-results"),
  navButtons: document.querySelectorAll(".bottom-nav .nav-button"),
  tabs: document.querySelectorAll(".tab"),
  sentinel: null // will create if needed
};

// ====== UTIL ======
function safeElDisplay(elm, show) {
  if (!elm) return;
  elm.style.display = show ? "block" : "none";
}
function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}
function timeoutSignal(ms) {
  const ctrl = new AbortController();
  const id = setTimeout(()=> ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: ()=> clearTimeout(id) };
}

// ====== Telegram WebApp safe init ======
let tg = null;
function initTelegram() {
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      tg = window.Telegram.WebApp;
      if (tg.ready) tg.ready();
      // Some methods may not exist in older SDKs — guard them
      if (typeof tg.enableClosingConfirmation === "function") tg.enableClosingConfirmation();
      if (typeof tg.disableVerticalSwipes === "function") {
        try { tg.disableVerticalSwipes(); } catch(e) { /* ignore */ }
      }
      // BackButton helper object may be missing — guard it later
    }
  } catch (e) {
    console.warn("Telegram init failed:", e);
    tg = null;
  }
}

// ====== Terms modal ======
function checkTerms() {
  const accepted = localStorage.getItem(TERMS_KEY) === "true";
  if (accepted) {
    if (el.termsModal) el.termsModal.style.display = "none";
  } else {
    if (el.termsModal) el.termsModal.style.display = "flex";
  }
}
if (el.acceptBtn) {
  el.acceptBtn.addEventListener("click", () => {
    localStorage.setItem(TERMS_KEY, "true");
    if (el.termsModal) el.termsModal.style.display = "none";
    // try to init telegram after acceptance (if app loaded late)
    initTelegram();
  });
}
checkTerms();

// ====== Tabs & Navigation ======
function setActiveTab(name) {
  el.tabs.forEach(t => t.classList.remove("active"));
  const target = document.getElementById("tab-" + name);
  if (target) target.classList.add("active");

  el.navButtons.forEach(b => b.classList.remove("active"));
  const nav = document.querySelector(`.bottom-nav .nav-button[data-tab="${name}"]`);
  if (nav) nav.classList.add("active");

  // Telegram BackButton visibility: show when not on home
  if (tg && tg.BackButton && typeof tg.BackButton.show === "function") {
    if (name !== "home") {
      try { tg.BackButton.show(); } catch(e) {}
    } else {
      try { tg.BackButton.hide(); } catch(e) {}
    }
  }
}

el.navButtons.forEach(btn => {
  btn.addEventListener("click", (ev) => {
    ev.preventDefault();
    const tab = btn.dataset.tab;
    setActiveTab(tab);
  });
});

// handle tg BackButton click to return to home
function initTelegramBackButton() {
  if (!tg || !tg.BackButton || typeof tg.BackButton.onClick !== "function") return;
  try {
    tg.BackButton.onClick(() => {
      setActiveTab("home");
      try { tg.BackButton.hide(); } catch(e) {}
    });
    // initially hide if on home
    try { tg.BackButton.hide(); } catch(e) {}
  } catch(e) {
    // ignore if not supported
  }
}

// ====== Search & rendering ======
function clearResults() {
  if (!el.videoContainer) return;
  el.videoContainer.innerHTML = "";
}
function renderVideoCard(video) {
  const thumb = video.thumb || video.thumb_big || (Array.isArray(video.thumbs) && video.thumbs[0] && video.thumbs[0].src) || "https://static-ca-cdn.eporner.com/thumbs/static4/1/12/120/12098433/1_360.jpg";
  const title = video.title || "No title";
  const url = video.url || video.embed || "#";

  const col = document.createElement("div");
  col.className = "col-12 video-card";
  col.innerHTML = [
    '<div class="card h-100">',
      `<img src="${escapeHtml(thumb)}" class="card-img-top" alt="${escapeHtml(title)}">`,
      '<div class="card-body d-flex flex-column">',
        `<h5 class="card-title">${escapeHtml(title)}</h5>`,
        `<a href="${escapeHtml(url)}" class="btn btn-success mt-auto" target="_blank" rel="noopener noreferrer">▶ PLAY</a>`,
      '</div>',
    '</div>'
  ].join("");
  return col;
}

// fetch wrapper with timeout and error handling
async function fetchSearch(query, page = 1, per_page = PER_PAGE) {
  const params = new URLSearchParams({
    query,
    per_page: String(per_page),
    page: String(page),
    order: "top-weekly",
    thumbsize: "big",
    gay: "1",
    lq: "1",
    format: "json"
  });
  const url = `${API_BASE}?${params.toString()}`;

  const to = timeoutSignal(FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: "GET", mode: "cors", signal: to.signal, cache: "no-store" });
    if (!res.ok) {
      // try to get text for debugging
      let txt = "";
      try { txt = await res.text(); } catch(e) {}
      throw new Error(`Bad response ${res.status} ${res.statusText} ${txt}`);
    }
    const data = await res.json();
    return data;
  } finally {
    to.clear();
  }
}

// main loader for a page
async function loadMoreVideos() {
  if (!state.query || state.loading || state.ended) return;
  state.loading = true;
  safeElDisplay(el.loading, true);
  safeElDisplay(el.errorMessage, false);
  safeElDisplay(el.noResults, false);

  try {
    const data = await fetchSearch(state.query, state.page);
    const videos = data.videos || [];
    state.totalPages = (data.total_pages && Number.isFinite(Number(data.total_pages))) ? Number(data.total_pages) : state.totalPages;

    if (videos.length === 0 && state.page === 1) {
      // first page and nothing found
      safeElDisplay(el.noResults, true);
      state.ended = true;
    } else {
      // append videos
      for (const v of videos) {
        const node = renderVideoCard(v);
        el.videoContainer.appendChild(node);
      }
      // if fewer than per_page or last page -> end
      if (videos.length < PER_PAGE || state.page >= state.totalPages) {
        state.ended = true;
        safeElDisplay(el.endMessage, true);
      } else {
        state.page++;
      }
    }
  } catch (err) {
    console.error("loadMoreVideos error:", err);
    safeElDisplay(el.errorMessage, true);
    // if CORS error likely, message remains generic — user can check console
  } finally {
    state.loading = false;
    safeElDisplay(el.loading, false);
  }
}

// start new search
function startSearch(q) {
  if (!q || !q.trim()) return;
  // reset state
  state.query = q.trim();
  state.page = 1;
  state.totalPages = Infinity;
  state.ended = false;
  clearResults();
  safeElDisplay(el.endMessage, false);
  safeElDisplay(el.errorMessage, false);
  safeElDisplay(el.noResults, false);

  // load first page
  loadMoreVideos();
  // update url param without reload
  try {
    const u = new URL(window.location.href);
    u.searchParams.set("query", state.query);
    history.replaceState({}, "", u.toString());
  } catch (e) {}
}

// ====== Infinite scroll: IntersectionObserver + sentinel ======
function ensureSentinel() {
  if (!el.sentinel) {
    const s = document.createElement("div");
    s.id = "scroll-sentinel";
    s.style.height = "1px";
    document.body.appendChild(s);
    el.sentinel = s;
  }
}

function initInfiniteScroll() {
  ensureSentinel();
  if ("IntersectionObserver" in window && el.sentinel) {
    const obs = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting && !state.loading && !state.ended && state.query) {
          loadMoreVideos();
        }
      }
    }, { root: null, rootMargin: "400px", threshold: 0.1 });
    obs.observe(el.sentinel);
  } else {
    // fallback to scroll event
    window.addEventListener("scroll", () => {
      if (state.loading || state.ended || !state.query) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        loadMoreVideos();
      }
    });
  }
}

// ====== Search form handling & validation ======
if (el.searchForm && el.searchInput) {
  // clear custom validity on input
  el.searchInput.addEventListener("input", () => el.searchInput.setCustomValidity(""));

  el.searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = el.searchInput.value || "";
    if (!q.trim()) {
      el.searchInput.setCustomValidity("Enter a search term.");
      el.searchInput.reportValidity();
      return;
    }
    startSearch(q);
  });
}

// ====== Load initial query from URL (if present) ======
function initFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("query") || "";
    if (q) {
      if (el.searchInput) el.searchInput.value = q;
      startSearch(q);
    }
  } catch (e) {}
}

// ====== Initialization ======
function init() {
  initTelegram();
  initTelegramBackButton();
  initInfiniteScroll();
  initFromUrl();
  // if Telegram exists and has methods to set theme, try to apply minimal UI hooks
  if (tg && tg.expand && typeof tg.expand === "function") {
    try { tg.expand(); } catch(e) {}
  }
}

// start
document.addEventListener("DOMContentLoaded", init);
