// * version 0.0.1 * //

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


// Бесконечная прокрутка
let page = 2;
let loading = false;
let reachedEnd = false;

window.addEventListener('scroll', () => {
  if (loading || reachedEnd || !queryFromServer) return;
  if (window.scrollY + window.innerHeight + 200 >= document.body.scrollHeight) {
    loadMoreVideos();
  }
});

async function loadMoreVideos() {
  loading = true;
  document.getElementById('loading').style.display = 'block';
  document.getElementById('error-message').style.display = 'none';
  try {
    const response = await fetch(`/load_more?query=${encodeURIComponent(queryFromServer)}&page=${page}`);
    const data = await response.json();
    const container = document.getElementById('video-container');
    if (data.videos.length === 0) {
      reachedEnd = true;
      document.getElementById('end-message').style.display = 'block';
    } else {
      data.videos.forEach(video => {
        const col = document.createElement('div');
        col.className = 'col-12 video-card';
        col.innerHTML = `
          <div class="card h-100">
            <img src="${video.thumb}" class="card-img-top" alt="Thumbnail">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${video.title}</h5>
              <a href="${video.url}" class="btn btn-success mt-auto" target="_blank">▶ PLAY</a>
            </div>
          </div>`;
        container.appendChild(col);
      });
      page++;
    }
  } catch (e) {
    console.error(e);
    document.getElementById('error-message').style.display = 'block';
  }
  loading = false;
  document.getElementById('loading').style.display = 'none';
}


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
