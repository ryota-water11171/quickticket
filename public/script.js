let ticketPrice = 2000;
const maxTickets = 4;

let quantity = 1;

const countElement = document.getElementById("count");
const totalElement = document.getElementById("total");
const modal = document.getElementById("modal");

function formatYen(amount) {
  return "¥" + amount.toLocaleString("ja-JP");
}

function updateDisplay() {
  countElement.textContent = quantity;
  totalElement.textContent = formatYen(ticketPrice * quantity);

  document.getElementById("minus").disabled = quantity === 1;
  document.getElementById("plus").disabled =
    quantity === maxTickets;
}

document.getElementById("plus").addEventListener("click", () => {
  if (quantity < maxTickets) {
    quantity++;
    updateDisplay();
  }
});

document.getElementById("minus").addEventListener("click", () => {
  if (quantity > 1) {
    quantity--;
    updateDisplay();
  }
});

document.getElementById("purchase").addEventListener("click", () => {
  document.getElementById("confirm-count").textContent =
    quantity + "枚";

  document.getElementById("confirm-total").textContent =
    formatYen(ticketPrice * quantity);

  modal.hidden = false;
});

document.getElementById("close-modal").addEventListener("click", () => {
  modal.hidden = true;
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.hidden = true;
  }
});

updateDisplay();


document.addEventListener("quickticket:detail-loaded", () => {
  const price = window.quickTicketPrice;

  if (!Number.isSafeInteger(price) || price < 0) {
    console.error("Invalid ticket price:", price);
    return;
  }

  ticketPrice = price;
  quantity = 1;
  updateDisplay();
});
