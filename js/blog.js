const posts = [
  { id: 1, cat: "phishing", title: "Фишинг в 2026: что изменилось", desc: "Новые сценарии, типовые ошибки и что проверить в компании уже сегодня.", author: "ANTI FISH", dateISO: "2026-02-03", dateRU: "3 ФЕВ 2026", url: "post.html" },
  { id: 2, cat: "tools", title: "Настройка MFA", desc: "Пошаговый чек: как включить MFA, где чаще всего делают неправильно и как контролировать.", author: "ANTI FISH", dateISO: "2026-02-05", dateRU: "5 ФЕВ 2026", url: "post1.html" },
  { id: 3, cat: "checklists", title: "Чек‑листы безопасности", desc: "Готовые чек‑листы для сотрудников и ИТ: быстро внедрить и не забыть важное.", author: "ANTI FISH", dateISO: "2026-02-05", dateRU: "5 ФЕВ 2026", url: "post2.html" },
  { id: 4, cat: "osint", title: "OSINT: что видно о сотрудниках", desc: "Какие данные чаще всего доступны публично и как это помогает атакующим.", author: "ANTI FISH", dateISO: "2026-02-06", dateRU: "6 ФЕВ 2026", url: "post3.html" },
  { id: 5, cat: "cases", title: "Кейс: отчёт и план внедрения", desc: "Как превратить результаты тестов в приоритетный план действий для руководства и ИТ/ИБ.", author: "ANTI FISH", dateISO: "2026-02-06", dateRU: "6 ФЕВ 2026", url: "post4.html" },
  { id: 6, cat: "news", title: "Новости: атаки через мессенджеры", desc: "Сценарии, которые встречаются чаще, и практические меры для снижения риска.", author: "ANTI FISH", dateISO: "2026-02-07", dateRU: "7 ФЕВ 2026", url: "post5.html" },
];

const catTitles = {
  all: "Все",
  phishing: "Фишинг атаки",
  osint: "OSINT утечки",
  tools: "Инструменты для защиты",
  cases: "Кейсы и статистика",
  checklists: "Чек листы",
  news: "Новости",
};

const chips = document.getElementById("catChips");
const grid = document.getElementById("postsGrid");
const btnMore = document.getElementById("btnMore");
const title = document.getElementById("blogSectionTitle");

let currentCat = "all";
let visibleCount = 6;
const pageSize = 6;

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setActiveChip(cat) {
  chips.querySelectorAll(".catChip").forEach((b) => {
    b.classList.toggle("catChip--active", b.dataset.cat === cat);
  });
}

function filteredPosts() {
  return currentCat === "all" ? posts : posts.filter(p => p.cat === currentCat);
}

function render() {
  title.textContent = catTitles[currentCat] || "Все";

  const list = filteredPosts().slice(0, visibleCount);

  grid.innerHTML = list.map(p => `
    <article class="postCard">
      <a class="postCard__link" href="${escapeHtml(p.url)}" aria-label="Открыть статью: ${escapeHtml(p.title)}">
        <div class="postCard__title">${escapeHtml(p.title)}</div>
        <div class="postCard__desc">${escapeHtml(p.desc)}</div>
        <div class="postCard__meta">
          <div class="postCard__author">Автор: ${escapeHtml(p.author)}</div>
          <time class="postCard__date" datetime="${escapeHtml(p.dateISO)}">${escapeHtml(p.dateRU)}</time>
        </div>
      </a>
    </article>
  `).join("");

  const total = filteredPosts().length;
  btnMore.style.display = visibleCount < total ? "inline-flex" : "none";
}

function syncUrl(cat) {
  const url = new URL(window.location.href);
  url.searchParams.set("cat", cat); // URLSearchParams.set() [web:149]
  window.history.replaceState({}, "", url);
}

function initFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get("cat"); // URLSearchParams.get() [web:150]
  if (!cat) return;
  const exists = Array.from(chips.querySelectorAll(".catChip")).some(b => b.dataset.cat === cat);
  if (exists) currentCat = cat;
}

chips.addEventListener("click", (e) => {
  const btn = e.target.closest(".catChip");
  if (!btn) return;

  currentCat = btn.dataset.cat; // dataset для data-* [web:163]
  visibleCount = pageSize;

  setActiveChip(currentCat);
  syncUrl(currentCat);
  render();
});

btnMore.addEventListener("click", () => {
  visibleCount += pageSize;
  render();
});

initFromUrl();
setActiveChip(currentCat);
visibleCount = pageSize;
render();
