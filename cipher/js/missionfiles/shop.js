const state = {
  me: null,
  items: []
};

const $ = (id) => document.getElementById(id);

function esc(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });
}

function renderBalance() {
  const coinText = state.me.coins + " Coins";

  $("navAgent").textContent = state.me.name;
  $("navCoins").textContent = coinText;
  $("balance").textContent = coinText;
}

function renderRows() {
  if (state.items.length === 0) {
    $("shopRows").innerHTML =
      '<tr><td colspan="4" class="muted">The shop is empty right now.</td></tr>';
    return;
  }

  $("shopRows").innerHTML = state.items.map(function (item) {
    const cantAfford = item.price > state.me.coins;
    let unavailable = "";

    if (!CIPHER.isLoggedIn()) {
      unavailable = "Log in to buy";
    } else if (cantAfford) {
      unavailable = "Not enough coins";
    }

    let disabledText = "";
    if (unavailable) {
      disabledText = `disabled title="${unavailable}"`;
    }

    return `
      <tr>
        <td class="item-name">${esc(item.name)}</td>
        <td class="muted">${esc(item.effect)}</td>
        <td class="num mono">${esc(item.price)} Coins</td>
        <td class="num">
          <button class="btn btn-primary btn-buy" data-id="${esc(item.id)}" ${disabledText}>Buy</button>
        </td>
      </tr>`;
  }).join("");
}

function showMsg(ok, message) {
  const box = $("shopMsg");

  if (ok) {
    box.className = "alert alert-success";
  } else {
    box.className = "alert alert-error";
  }

  box.textContent = message;
  box.hidden = false;
}

function buy(itemId) {
  if (!CIPHER.isLoggedIn()) {
    showMsg(false, "Log in to buy items.");
    return;
  }

  const item = state.items.find(function (shopItem) {
    return String(shopItem.id) === String(itemId);
  });

  if (!item) {
    return;
  }

  if (state.me.coins < item.price) {
    showMsg(false, "Not enough coins.");
    return;
  }

  CIPHER.addCoins(-item.price);
  state.me = CIPHER.me();
  CIPHER.addLog("Shop Purchase", item.name, 0, -item.price);
  showMsg(true, "Purchased " + item.name + ".");
  renderBalance();
  renderRows();
}

function init() {
  state.me = CIPHER.me();
  state.items = CIPHER_DATA.shop;

  renderBalance();
  renderRows();

  $("shopRows").addEventListener("click", function (event) {
    const button = event.target.closest(".btn-buy");

    if (!button || button.disabled) {
      return;
    }

    buy(button.dataset.id);
  });
}

init();
