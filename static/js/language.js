document.addEventListener("DOMContentLoaded", () => {

  const lang = navigator.language.startsWith("ru") ? "ru" : "en";

  const t = {
    en: {
      terms_title: "Terms & Privacy",
      terms_text: `By using this app, you agree to our <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.<br><br>
                   This app is intended for users aged <strong>18+</strong>. By clicking «Start», you confirm that you are at least 18 years old.<br><br>
                   We do not store personal data beyond what is necessary for app functionality.`,
      start_btn: "Start",

      search_placeholder: "Search videos...",
      loading: "Loading...",
      no_results: "No results found for",
      end: "No more videos.",
      error: "Error loading. Please try again later.",

      nav_home: "Home",
      nav_help: "Help",
      nav_rights: "Rights",
      nav_about: "About",

      help_title: "Help",
      help_li1: "Enter a keyword and press «Search»",
      help_li2: "Tap ▶ PLAY to watch the video",

      rights_title: "Rights",
      rights_text: "Content is provided for personal use only. All rights belong to their owners.",

      about_title: "About",
      about_jisou: "JISOU — telegram search engine",
      about_chat: "Original chat with the search engine JISOU",
      about_find_us: "Find us"
    },

    ru: {
      terms_title: "Условия и Конфиденциальность",
      terms_text: `Используя это приложение, вы соглашаетесь с <strong>Условиями использования</strong> и <strong>Политикой конфиденциальности</strong>.<br><br>
                   Приложение предназначено для пользователей <strong>18+</strong>. Нажимая «Начать», вы подтверждаете, что вам есть 18 лет.<br><br>
                   Мы не храним персональные данные, кроме необходимого для работы приложения.`,
      start_btn: "Начать",

      search_placeholder: "Поиск видео...",
      loading: "Загрузка...",
      no_results: "Ничего не найдено по запросу",
      end: "Больше видео нет.",
      error: "Ошибка загрузки. Попробуйте позже.",

      nav_home: "Главная",
      nav_help: "Помощь",
      nav_rights: "Права",
      nav_about: "О приложении",

      help_title: "Помощь",
      help_li1: "Введите ключевое слово и нажмите «Поиск»",
      help_li2: "Нажмите ▶ PLAY чтобы посмотреть видео",

      rights_title: "Права",
      rights_text: "Контент предназначен только для личного использования. Все права принадлежат владельцам.",

      about_title: "О приложении",
      about_jisou: "JISOU — поисковый движок Telegram",
      about_chat: "Оригинальный чат с поисковым движком JISOU",
      about_find_us: "Мы в сети"
    }
  };

  const L = t[lang];

  // Terms
  document.getElementById("terms-title").innerHTML = L.terms_title;
  document.getElementById("terms-text").innerHTML = L.terms_text;
  document.getElementById("accept-btn").innerText = L.start_btn;

  // Search
  document.getElementById("search-input").placeholder = L.search_placeholder;

  // Status messages
  document.getElementById("loading").innerText = L.loading;
  document.getElementById("end-message").innerText = L.end;
  document.getElementById("error-message").innerText = L.error;
  document.querySelector("#no-results").childNodes[0].textContent = L.no_results + " ";

  // Navigation
  document.getElementById("nav-home").innerText = L.nav_home;
  document.getElementById("nav-help").innerText = L.nav_help;
  document.getElementById("nav-rights").innerText = L.nav_rights;
  document.getElementById("nav-about").innerText = L.nav_about;

  // Help
  document.getElementById("help-title").innerHTML =
    `<i class="bi bi-question-circle me-2"></i>${L.help_title}`;
  document.getElementById("help-li1").innerText = L.help_li1;
  document.getElementById("help-li2").innerText = L.help_li2;

  // Rights
  document.getElementById("rights-title").innerHTML =
    `<i class="bi bi-shield-lock me-2"></i>${L.rights_title}`;
  document.getElementById("rights-text").innerText = L.rights_text;

  // About
  document.getElementById("about-title").innerHTML =
    `<i class="bi bi-info-circle me-2"></i>${L.about_title}`;
  document.getElementById("about-jisou").innerText = L.about_jisou;
  document.getElementById("about-chat").innerText = L.about_chat;
  document.getElementById("about-findus").innerHTML =
    `<i class="bi bi-link-45deg me-2"></i>${L.about_find_us}`;
});