// === script.js ===

const API_URL = "https://www.eporner.com/api/v2/videos/search"; // Eporner API endpoint
let currentPage = 1;
let currentQuery = "";
let totalPages = 1;
let isLoading = false;

// DOM Elements
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const videoContainer = document.getElementById("video-container");
const loadingMsg = document.getElementById("loading");
const endMsg = document.getElementById("end-message");
const errorMsg = document.getElementById("error-message");
const noResultsMsg = document.getElementById("no-results");
const tabs = document.querySelectorAll(".tab");
const navButtons = document.querySelectorAll(".nav-button");

// --- TAB NAVIGATION ---
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-tab");

    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    tabs.forEach(tab => {
      tab.classList.remove("active");
      if (tab.id === "tab-" + target) tab.classList.add("active");
    });
  });
});

// --- TERMS MODAL ---
const termsModal = document.getElementById("terms-modal");
const acceptBtn = document.getElementById("accept-btn");

acceptBtn.addEventListener("click", () => {
  termsModal.style.display = "none";
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
  }
});

// --- SEARCH FORM ---
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  currentQuery = searchInput.value.trim();
  if (!currentQuery) return;
  currentPage = 1;
  videoContainer.innerHTML = "";
  totalPages = 1;
  await loadVideos();
});

// --- FETCH VIDEOS ---
async function loadVideos() {
  if (isLoading || currentPage > totalPages) return;

  isLoading = true;
  loadingMsg.style.display = "block";
  endMsg.style.display = "none";
  errorMsg.style.display = "none";
  noResultsMsg.style.display = "none";

  try {
    const params = new URLSearchParams({
      query: currentQuery,
      per_page: 10,
      page: currentPage,
      order: "top-weekly",
      thumbsize: "big",
      gay: "1",
      lq: "1",
      format: "json"
    });

    const response = await fetch(`${API_URL}?${params.toString()}`, { method: "GET" });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    totalPages = data.total_pages || 1;
    const videos = data.videos || [];

    if (videos.length === 0 && currentPage === 1) {
      noResultsMsg.style.display = "block";
    }

    videos.forEach(video => {
      const thumb = (video.thumbs && video.thumbs[0] && video.thumbs[0].src) 
                    || "https://static-ca-cdn.eporner.com/thumbs/static4/1/12/120/12098433/1_360.jpg";

      const card = document.createElement("div");
      card.className = "col-12 video-card";
      card.innerHTML = `
        <div class="card h-100">
          <img src="${thumb}" class="card-img-top" alt="Thumbnail" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${video.title || "No title"}</h5>
            <a href="${video.embed || '#'}" class="btn btn-success mt-auto" target="_blank">▶ PLAY</a>
          </div>
        </div>
      `;
      videoContainer.appendChild(card);
    });

    if (currentPage >= totalPages) {
      endMsg.style.display = "block";
    }

    currentPage++;
  } catch (err) {
    console.error(err);
    errorMsg.style.display = "block";
  } finally {
    loadingMsg.style.display = "none";
    isLoading = false;
  }
}

// --- INFINITE SCROLL ---
window.addEventListener("scroll", () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
    loadVideos();
  }
});
