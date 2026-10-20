const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

async function loadEventDetail() {
  if (!eventId || !/^[1-9]\d*$/.test(eventId)) {
    showError("公演IDが指定されていません。");
    return;
  }

  try {
    const response = await fetch(`/api/events/${eventId}`);

    if (!response.ok) {
      throw new Error("公演情報を取得できませんでした。");
    }

    const event = await response.json();

    document.title = `${event.title} | QuickTicket`;

    document.querySelector("h1").textContent = event.title;
    document.querySelector(".subtitle").textContent =
      event.description || "";

    const details = document.querySelectorAll(".detail");

    const startsAt = new Date(event.starts_at);
    const doorsAt = new Date(event.doors_open_at);

    const dateText = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short"
    }).format(startsAt);

    const timeFormat = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    details[0].querySelector("strong").textContent = dateText;
    details[0].querySelector("p").textContent =
      `${timeFormat.format(doorsAt)} 開場 / ${timeFormat.format(startsAt)} 開演`;

    details[1].querySelector("strong").textContent =
      event.venue_name;

    details[1].querySelector("p").textContent =
      [event.prefecture, event.city, event.address]
        .filter(Boolean)
        .join(" ") || "会場の詳細は後日掲載";

    const ticket = event.ticket_types?.[0];

    if (!ticket) {
      showError("現在、販売可能なチケットがありません。");
      return;
    }

    document.querySelector(".ticket-option strong").textContent =
      ticket.name;

    document.querySelector(".ticket-price").textContent =
      `¥${Number(ticket.price_yen).toLocaleString("ja-JP")}`;

    const modalEventName =
      document.querySelector(".modal-card > p");

    if (modalEventName) {
      modalEventName.textContent = event.title;
    }

    // 既存の枚数選択スクリプトに価格を渡す
    window.quickTicketPrice = Number(ticket.price_yen);

    document.dispatchEvent(new Event("quickticket:detail-loaded"));
  } catch (error) {
    console.error(error);
    showError("公演情報の読み込みに失敗しました。");
  }
}

function showError(message) {
  const subtitle = document.querySelector(".subtitle");
  if (subtitle) {
    subtitle.textContent = message;
  }
}

loadEventDetail();
