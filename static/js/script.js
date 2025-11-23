// === CONFIG ===
const EPORNER_API = "https://www.eporner.com/api/v2/video/search/";

// === DOM ELEMENTS ===
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const videoContainer = document.getElementById("video-container");

const loadingEl = document.getElementById("loading");
const noResultsEl = document.getElementById("no-results");
const endMessageEl = document.getElementById("end-message");
const errorMessageEl = document.getElementById("error-message");

// Tabs
const tabs = document.querySelectorAll('.tab');
const links = document.querySelectorAll('.bottom-nav .nav-button');
const tg = window.Telegram.WebApp;

tg.ready();
tg.enableClosingConfirmation();
tg.disableVerticalSwipes();

tg.BackButton.onClick(() => {
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById('tab-home').classList.add('active');
    links.forEach(l => l.classList.remove('active'));
    document.querySelector('[data-tab="home"]').classList.add('active');
    tg.BackButton.hide();
});

links.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = link.dataset.tab;
        tabs.forEach(tab => tab.classList.remove('active'));
        document.getElementById('tab-' + target).classList.add('active');
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        if (target !== 'home') {
            tg.BackButton.show();
        } else {
            tg.BackButton.hide();
        }
    });
});

// Terms modal
const termsModal = document.getElementById("terms-modal");
const acceptBtn = document.getElementById("accept-btn");

// === SEARCH STATE ===
let currentQuery = "";
let currentPage = 1;
let totalPages = 0;
let isLoading = false;
let reachedEnd = false;

// ===========================================
// INIT (Telegram Mini App)
// ===========================================
window.addEventListener("load", () => {
    document.body.classList.remove("loading");

    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;

        tg.ready();
        //tg.expand();
        tg.disableVerticalSwipes();
        tg.enableClosingConfirmation();
        //tg.requestFullscreen();
        tg.lockOrientation();

        console.log("Telegram WebApp Ready");
    }

    // Terms & Privacy
    if (localStorage.getItem("termsAccepted") === "true") {
        termsModal.style.display = "none";
    } else {
        termsModal.style.display = "flex";
    }
});

// Accept terms
if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
        localStorage.setItem("termsAccepted", "true");
        termsModal.style.display = "none";
    });
}

// ===========================================
// TABS
// ===========================================
tabs.forEach(button => {
    button.addEventListener("click", () => {
        const tabId = button.getAttribute("data-tab");

        tabs.forEach(btn => btn.classList.remove("active"));
        sections.forEach(section => section.classList.remove("active"));

        button.classList.add("active");
        document.getElementById(tabId).classList.add("active");
    });
});

// ===========================================
// BUILD EPORNER API URL
// ===========================================
function buildApiUrl(query, page) {
    const params = new URLSearchParams({
        query: query,
        per_page: "10",
        page: String(page),
        thumbsize: "big",
        order: "top-weekly",
        gay: "1",
        lq: "1",
        format: "json"
    });

    return `${EPORNER_API}?${params}`;
}

// ===========================================
// LOAD VIDEOS
// ===========================================
async function loadVideos(isNewSearch = false) {
    if (isLoading || reachedEnd) return;
    if (!currentQuery) return;

    isLoading = true;
    loadingEl.style.display = "block";
    errorMessageEl.style.display = "none";
    noResultsEl.style.display = "none";

    const url = buildApiUrl(currentQuery, currentPage);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("API error");

        const data = await response.json();

        // Eporner returns total pages like 50, 100 etc
        totalPages = data.total_pages ?? 0;

        // If new search, clear container
        if (isNewSearch) {
            videoContainer.innerHTML = "";
            reachedEnd = false;
        }

        const videos = data.videos || [];

        // No results on first page
        if (videos.length === 0 && isNewSearch) {
            noResultsEl.style.display = "block";
            reachedEnd = true;
            loadingEl.style.display = "none";
            return;
        }

        renderVideos(videos);

        currentPage += 1;

        if (currentPage > totalPages) {
            reachedEnd = true;
            endMessageEl.style.display = "block";
        }

    } catch (error) {
        console.error(error);
        errorMessageEl.style.display = "block";
    }

    loadingEl.style.display = "none";
    isLoading = false;
}

// ===========================================
// RENDER VIDEOS
// ===========================================
function renderVideos(videos) {
    videos.forEach(video => {
        const thumb =
            video.thumbs &&
            Array.isArray(video.thumbs) &&
            video.thumbs[0] &&
            video.thumbs[0].src
                ? video.thumbs[0].src
                : "https://static-ca-cdn.eporner.com/thumbs/static4/1/12/120/12098433/1_360.jpg";

        const card = document.createElement("div");
        card.className = "video-card glass";

        card.innerHTML = `
            <img src="${thumb}" class="thumb" alt="">
            <div class="video-info">
                <h3>${video.title || "No title"}</h3>
                <a href="${video.embed || ""}" target="_blank" class="open-btn">Watch</a>
            </div>
        `;
        videoContainer.appendChild(card);
    });
}

// ===========================================
// SEARCH SUBMIT
// ===========================================
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    currentQuery = query;
    currentPage = 1;
    reachedEnd = false;

    endMessageEl.style.display = "none";
    noResultsEl.style.display = "none";

    loadVideos(true);
});

// ===========================================
// INFINITE SCROLL
// ===========================================
window.addEventListener("scroll", () => {
    if (reachedEnd || isLoading) return;

    const scrollPos = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 400;

    if (scrollPos >= threshold) {
        loadVideos(false);
    }
});

// Валидация поиска
const searchInput = document.querySelector('input[name="query"]');
const searchForm = document.querySelector('form');

searchInput.addEventListener('input', () => {
  searchInput.setCustomValidity('');
});

searchForm.addEventListener('submit', (e) => {
  if (!searchInput.value.trim()) {
    e.preventDefault();
    searchInput.setCustomValidity('Enter a word: Yua Mikami.');
    searchInput.reportValidity();
  }
});
