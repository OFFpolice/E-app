document.addEventListener("DOMContentLoaded", () => {
  const lang = navigator.language.startsWith("ru") ? "ru" : "en";

  const t = {
    en: {
      terms_title: "Terms & Privacy",
      terms_text: `By using this app, you agree to our <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.
                   <br><br>This app is intended for users aged <strong>18+</strong>. 
                   By clicking «Start», you confirm that you are at least 18 years old.
                   <br><br>We do not store personal data beyond what is necessary for app functionality.`,
      start_btn: "Start",

      search_placeholder: "Search videos...",
      loading: "Loading...",
      no_results: "No results found for:",
      no_more: "No more videos.",
      error: "Error loading. Please try again later.",

      help_title: "Help",
      help_item1: "Enter a keyword and press «Search»",
      help_item2: "Tap ▶ PLAY to watch the video",

      rights_title: "Rights",
      rights_text: "Content is provided for personal use only. All rights belong to their respective owners.",

      about_title: "About",

      nav_home: "Home",
      nav_help: "Help",
      nav_rights: "Rights",
      nav_about: "About"
    },

    ru: {
      terms_title: "Условия и Политика",
      terms_text: `Используя это приложение, вы соглашаетесь с <strong>Условиями обслуживания</strong> 
                   и <strong>Политикой конфиденциальности</strong>.
                   <br><br>Приложение предназначено для пользователей <strong>18+</strong>.
                   Нажимая «Начать», вы подтверждаете, что вам есть 18 лет.
                   <br><br>Мы не храним персональные данные сверх необходимого для работы приложения.`,
      start_btn: "Начать",

      search_placeholder: "Поиск видео...",
      loading: "Загрузка...",
      no_results: "Ничего не найдено по запросу:",
      no_more: "Больше видео нет.",
      error: "Ошибка загрузки. Повторите позже.",

      help_title: "Помощь",
      help_item1: "Введите ключевое слово и нажмите «Поиск»",
      help_item2: "Нажмите ▶ PLAY чтобы смотреть видео",

      rights_title: "Права",
      rights_text: "Контент предоставляется только для личного использования. Все права у их владельцев.",

      about_title: "О приложении",

      nav_home: "Главная",
      nav_help: "Помощь",
      nav_rights: "Права",
      nav_about: "О нас"
    }
  };

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t[lang][key]) el.innerHTML = t[lang][key];
  });

  // Placeholder
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.placeholder = t[lang].search_placeholder;

  // Dynamic messages
  document.getElementById("loading").innerHTML = t[lang].loading;
  document.getElementById("end-message").innerHTML = t[lang].no_more;
  document.getElementById("error-message").innerHTML = t[lang].error;
});
