function init() {
  const me = CIPHER.me();
  const coinText = me.coins + " Coins";

  document.getElementById("navAgent").textContent = me.name;
  document.getElementById("navCoins").textContent = coinText;
  document.getElementById("balance").textContent = coinText;
}

init();
