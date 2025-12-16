// === CONFIG ===
const EPORNER_API = "https://www.eporner.com/api/v2/video/search/";

// === DOM ===
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const videoContainer = document.getElementById("video-container");

const loadingEl = document.getElementById("loading");
const noResultsEl = document.getElementById("no-results");
const endMessageEl = document.getElementById("end-message");
const errorMessageEl = document.getElementById("error-message");
const customForm = document.getElementById("custom-form");

// === STATE ===
let currentQuery = "";
let currentPage = 1;
let isLoading = false;
let reachedEnd = false;

// === API URL ===
function buildApiUrl(query, page) {
  return EPORNER_API + "?" + new URLSearchParams({
    query,
    page,
    per_page: 10,
    thumbsize: "big",
    order: "top-weekly",
    gay: 1,
    lq: 1,
    format: "json"
  });
}

// === LOAD VIDEOS ===
async function loadVideos(isNew = false) {
  if (isLoading || reachedEnd || !currentQuery) return;

  isLoading = true;
  loadingEl.style.display = "block";
  errorMessageEl.style.display = "none";

  if (isNew) {
    videoContainer.innerHTML = "";
    noResultsEl.style.display = "none";
    endMessageEl.style.display = "none";
    reachedEnd = false;
  }

  try {
    const res = await fetch(buildApiUrl(currentQuery, currentPage));
    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    const videos = Array.isArray(data.videos) ? data.videos : [];

    if (!videos.length) {
      if (currentPage === 1) {
        noResultsEl.style.display = "block";
      } else {
        endMessageEl.style.display = "block";
      }
      reachedEnd = true;
      return;
    }

    renderVideos(videos);
    currentPage++;

  } catch (e) {
    console.error(e);
    errorMessageEl.style.display = "block";
  } finally {
    loadingEl.style.display = "none";
    isLoading = false;
  }
}

// === RENDER ===
function renderVideos(videos) {
  videos.forEach(v => {
    const thumb = v.thumbs?.[0]?.src || "";
    const url = v.url || "#";

    const el = document.createElement("div");
    el.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";
    el.innerHTML = `
      <div class="card glass-card h-100">
        <img src="${thumb}" loading="lazy" class="card-img-top">
        <div class="card-body">
          <h6 class="card-title">${v.title || "No title"}</h6>
          <a href="${url}" target="_blank" class="btn btn-danger w-100">▶ PLAY</a>
        </div>
      </div>
    `;
    videoContainer.appendChild(el);
  });
}

// === FORM ===
searchForm.addEventListener("submit", e => {
  e.preventDefault();

  const q = searchInput.value.trim();
  if (!q) {
    customForm.textContent = "Enter a word: Yua Mikami";
    customForm.style.display = "block";
    return;
  }

  customForm.style.display = "none";
  currentQuery = q;
  currentPage = 1;
  reachedEnd = false;

  loadVideos(true);
});

searchInput.addEventListener("input", () => {
  searchInput.setCustomValidity("");
  customForm.style.display = "none";
});

// === INFINITE SCROLL ===
window.addEventListener("scroll", () => {
  if (reachedEnd || isLoading) return;

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
    loadVideos();
  }
});