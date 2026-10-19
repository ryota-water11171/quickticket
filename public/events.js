const list = document.getElementById("events-list");
const message = document.getElementById("message");
const resultCount = document.getElementById("result-count");
const keywordInput = document.getElementById("keyword");
const regionSelect = document.getElementById("region");
const genreSelect = document.getElementById("genre");

let allEvents = [];

function formatDate(value) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(new Date(value));
}

function formatPrice(value) {
  if (value === null || value === undefined) {
    return "価格未定";
  }

  return "¥" + Number(value).toLocaleString("ja-JP") + "〜";
}

function addOptions(select, values) {
  const uniqueValues = [...new Set(values.filter(Boolean))].sort();

  for (const value of uniqueValues) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }
}

function createEventCard(event) {
  const card = document.createElement("article");
  card.className = "event-card";

  const image = document.createElement("div");
  image.className = "event-image";
  image.textContent = "♪";

  const content = document.createElement("div");
  content.className = "event-content";

  const genre = document.createElement("span");
  genre.className = "genre";
  genre.textContent = event.genre || "音楽";

  const title = document.createElement("h3");
  title.textContent = event.title;

  const date = document.createElement("p");
  date.textContent = formatDate(event.starts_at);

  const venue = document.createElement("p");
  venue.textContent =
    [event.prefecture, event.venue_name].filter(Boolean).join("・");

  const price = document.createElement("strong");
  price.className = "price";
  price.textContent = formatPrice(event.min_price_yen);

  const link = document.createElement("a");
  link.className = "detail-link";
  link.href = "/event.html";
  link.textContent = "公演詳細を見る →";

  content.append(genre, title, date, venue, price, link);
  card.append(image, content);

  return card;
}

function renderEvents() {
  const keyword = keywordInput.value.trim().toLocaleLowerCase("ja-JP");
  const region = regionSelect.value;
  const genre = genreSelect.value;

  const filtered = allEvents.filter(event => {
    const searchable = [
      event.title,
      event.description,
      event.organizer_name,
      event.venue_name
    ].filter(Boolean).join(" ").toLocaleLowerCase("ja-JP");

    return (
      searchable.includes(keyword) &&
      (!region || event.prefecture === region) &&
      (!genre || event.genre === genre)
    );
  });

  list.replaceChildren();
  resultCount.textContent = `${filtered.length}件`;

  if (filtered.length === 0) {
    message.textContent = "条件に一致する公演がありません。";
    message.hidden = false;
    return;
  }

  message.hidden = true;

  for (const event of filtered) {
    list.appendChild(createEventCard(event));
  }
}

async function loadEvents() {
  try {
    const response = await fetch("/api/events");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const events = await response.json();

    if (!Array.isArray(events)) {
      throw new Error("Invalid API response");
    }

    allEvents = events;

    addOptions(regionSelect, events.map(e => e.prefecture));
    addOptions(genreSelect, events.map(e => e.genre));

    renderEvents();
  } catch (error) {
    console.error("公演取得エラー:", error);
    message.textContent =
      "公演情報を取得できませんでした。しばらくしてから再度お試しください。";
    resultCount.textContent = "";
  }
}

keywordInput.addEventListener("input", renderEvents);
regionSelect.addEventListener("change", renderEvents);
genreSelect.addEventListener("change", renderEvents);

loadEvents();
EOF
