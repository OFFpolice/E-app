const API_URL = "https://www.eporner.com/api/v2/video/search/"; 
let currentPage = 1;
let currentQuery = "";
let isLoading = false;
let hasMore = true;

const videoContainer = document.getElementById("video-container");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const loadingMessage = document.getElementById("loading");
const endMessage = document.getElementById("end-message");
const errorMessage = document.getElementById("error-message");
const noResultsMessage = document.getElementById("no-results");

// === Поиск ===
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  currentQuery = searchInput.value.trim();
  if (!currentQuery) return;
  currentPage = 1;
  videoContainer.innerHTML = "";
  hasMore = true;
  await loadVideos();
});

// === Загрузка видео ===
async function loadVideos() {
  if (isLoading || !hasMore) return;
  isLoading = true;
  loadingMessage.style.display = "block";
  errorMessage.style.display = "none";
  noResultsMessage.style.display = "none";

  try {
    const url = `${API_URL}?query=${encodeURIComponent(currentQuery)}&per_page=10&page=${currentPage}&order=top-weekly&thumbsize=big&lq=1&format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ошибка API");

    const data = await response.json();
    const videos = data.videos || [];

    if (videos.length === 0 && currentPage === 1) {
      noResultsMessage.style.display = "block";
      loadingMessage.style.display = "none";
      hasMore = false;
      return;
    }

    videos.forEach((video) => {
      const title = video.title || "No title";
      const thumb = (video.thumbs && video.thumbs[0]?.src) ||
        "https://static-ca-cdn.eporner.com/thumbs/static4/1/12/120/12098433/1_360.jpg";
      const embedUrl = video.embed || "#";

      const card = document.createElement("div");
      card.className = "card video-card mb-3";
      card.innerHTML = `
        <img src="${thumb}" class="card-img-top" alt="${title}">
        <div class="card-body">
          <h5 class="card-title">${title}</h5>
          <a href="${embedUrl}" class="btn btn-success w-100" target="_blank">Watch</a>
        </div>
      `;
      videoContainer.appendChild(card);
    });

    if (videos.length < 10) {
      hasMore = false;
      endMessage.style.display = "block";
    } else {
      currentPage++;
    }

  } catch (err) {
    console.error(err);
    errorMessage.style.display = "block";
  } finally {
    isLoading = false;
    loadingMessage.style.display = "none";
  }
}

// === Бесконечная прокрутка ===
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    loadVideos();
  }
});

// === Автозагрузка по последнему запросу ===
document.addEventListener("DOMContentLoaded", () => {
  if (searchInput.value.trim()) {
    currentQuery = searchInput.value.trim();
    loadVideos();
  }
});