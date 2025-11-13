/* =========================================================
   EPORNER APP — FULL JAVASCRIPT VERSION
   No server logic, works fully on client-side
   Fully compatible with the updated HTML layout
========================================================= */

const API_BASE = "https://www.eporner.com/api/v2/search";
const PER_PAGE = 10;
const TERMS_KEY = "eporner_terms_accepted_v1";
const FETCH_TIMEOUT_MS = 12000;

/* ================================
   State
================================ */
let state = {
  query: "",
  page: 1,
  totalPages: Infinity,
  loading: false,
  ended: false
};

/* ================================
   Elements
================================ */
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

  sentinel: null
};

/* ================================
   Helpers
================================ */
function safeDisplay(elm, show) {
  if (!elm) return;
  elm.style.display = show ? "block" : "none";
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
}

function timeoutSignal(ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

/* ================================
   Telegram
================================ */
let tg = null;

function initTelegram() {
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      if (tg.enableClosingConfirmation) tg.enableClosingConfirmation();
      if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
    }
  } catch (e) {
    console.warn("Telegram init failed:", e);
  }
}

function initTelegramBackButton() {
  if (!tg || !tg.BackButton) return;

  try {
    tg.BackButton.onClick(() => {
      setActiveTab("home");
      tg.BackButton.hide();
    });

    tg.BackButton.hide();
  } catch (e) {}
}

/* ================================
   Terms Modal
================================ */
function checkTerms() {
  const accepted = localStorage.getItem(TERMS_KEY) === "true";

  if (accepted) {
    safeDisplay(el.termsModal, false);
  } else {
    safeDisplay(el.termsModal, true);
  }
}

if (el.acceptBtn) {
  el.acceptBtn.addEventListener("click", () => {
    localStorage.setItem(TERMS_KEY, "true");
    safeDisplay(el.termsModal, false);
    initTelegram();
  });
}

checkTerms();

/* ================================
   Tabs
================================ */
function setActiveTab(name) {
  el.tabs.forEach(t => t.classList.remove("active"));
  const tab = document.getElementById("tab-" + name);
  if (tab) tab.classList.add("active");

  el.navButtons.forEach(b => b.classList.remove("active"));
  const nav = document.querySelector(`[data-tab="${name}"]`);
  if (nav) nav.classList.add("active");

  if (tg && tg.BackButton) {
    if (name !== "home") tg.BackButton.show();
    else tg.BackButton.hide();
  }
}

el.navButtons.forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();
    setActiveTab(btn.dataset.tab);
  });
});

/* ================================
   Video Rendering
================================ */
function clearVideos() {
  el.videoContainer.innerHTML = "";
}

function renderVideoCard(video) {
  const thumb =
    video.thumb ||
    video.thumb_big ||
    (Array.isArray(video.thumbs) && video.thumbs[0]?.src) ||
    "https://static-ca-cdn.eporner.com/thumbs/static4/1/12/120/12098433/1_360.jpg";

  const col = document.createElement("div");
  col.className = "col-12 video-card";

  col.innerHTML = `
    <div class="card h-100 glass-panel">
      <img src="${escapeHtml(thumb)}" class="card-img-top" alt="${escapeHtml(video.title)}" loading="lazy">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${escapeHtml(video.title)}</h5>
        <a href="${escapeHtml(video.url || video.embed)}"
           class="btn btn-success mt-auto"
           target="_blank"
           rel="noopener noreferrer">▶ PLAY</a>
      </div>
    </div>
  `;

  return col;
}

/* ================================
   API Request
================================ */
async function fetchSearch(query, page = 1) {
  const params = new URLSearchParams({
    query,
    per_page: PER_PAGE,
    page,
    order: "top-weekly",
    thumbsize: "big",
    gay: "1",
    lq: "1",
    format: "json"
  });

  const url = `${API_BASE}?${params.toString()}`;

  const timeout = timeoutSignal(FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: timeout.signal });
    if (!res.ok) throw new Error("API error: " + res.status);
    return await res.json();
  } finally {
    timeout.clear();
  }
}

/* ================================
   Video Loading
================================ */
async function loadMoreVideos() {
  if (state.loading || state.ended || !state.query) return;

  state.loading = true;
  safeDisplay(el.loading, true);
  safeDisplay(el.errorMessage, false);

  try {
    const data = await fetchSearch(state.query, state.page);

    const videos = data.videos || [];
    state.totalPages = Number(data.total_pages) || state.totalPages;

    if (videos.length === 0 && state.page === 1) {
      safeDisplay(el.noResults, true);
      state.ended = true;
    } else {
      videos.forEach(v => el.videoContainer.appendChild(renderVideoCard(v)));

      if (videos.length < PER_PAGE || state.page >= state.totalPages) {
        state.ended = true;
        safeDisplay(el.endMessage, true);
      } else {
        state.page++;
      }
    }
  } catch (e) {
    console.error(e);
    safeDisplay(el.errorMessage, true);
  } finally {
    state.loading = false;
    safeDisplay(el.loading, false);
  }
}

/* ================================
   Search
================================ */
function startSearch(query) {
  if (!query.trim()) return;

  state.query = query.trim();
  state.page = 1;
  state.totalPages = Infinity;
  state.ended = false;

  clearVideos();

  safeDisplay(el.noResults, false);
  safeDisplay(el.errorMessage, false);
  safeDisplay(el.endMessage, false);

  loadMoreVideos();

  const url = new URL(window.location.href);
  url.searchParams.set("query", state.query);
  history.replaceState({}, "", url.toString());
}

if (el.searchForm && el.searchInput) {
  el.searchInput.addEventListener("input", () => {
    el.searchInput.setCustomValidity("");
  });

  el.searchForm.addEventListener("submit", e => {
    e.preventDefault();

    const q = el.searchInput.value.trim();
    if (!q) {
      el.searchInput.setCustomValidity("Enter a search term.");
      el.searchInput.reportValidity();
      return;
    }

    startSearch(q);
  });
}

/* ================================
   Infinite Scroll
================================ */
function ensureSentinel() {
  if (!el.sentinel) {
    el.sentinel = document.createElement("div");
    el.sentinel.id = "scroll-sentinel";
    el.sentinel.style.height = "1px";
    document.body.appendChild(el.sentinel);
  }
}

function initInfiniteScroll() {
  ensureSentinel();

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMoreVideos();
    }, { rootMargin: "400px" });

    observer.observe(el.sentinel);
  } else {
    window.addEventListener("scroll", () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        loadMoreVideos();
      }
    });
  }
}

/* ================================
   URL Init
================================ */
function initFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("query");

  if (q) {
    el.searchInput.value = q;
    startSearch(q);
  }
}

/* ================================
   App Init
================================ */
function init() {
  initTelegram();
  initTelegramBackButton();

  initInfiniteScroll();
  initFromUrl();

  if (tg && tg.expand) tg.expand();
}

document.addEventListener("DOMContentLoaded", init);

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


function init() {
  initTelegram();
  initTelegramBackButton();
  initInfiniteScroll();
  initFromUrl();
  if (tg && tg.expand && typeof tg.expand === "function") {
    try { tg.expand(); } catch(e) {}
  }
}

document.addEventListener("DOMContentLoaded", init);
