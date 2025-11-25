document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("launchBtn");
  const info = document.getElementById("info");

  const schemes = [
    "itms-beta://",   // TestFlight
    "altstore://",    // AltStore
    "esign://",       // ESign
    "gbox://",        // GBox
    "gboxapp://",     // GBox Alt
    "ksign://",       // KSign
    "kstore://",      // KStore
  ];

  async function launchAll() {
    info.textContent = "Запускаю все схемы по очереди...";

    for (let s of schemes) {
      info.textContent += `\n→ ${s}`;
      try {
        window.location.href = s;
      } catch {}
      await new Promise(r => setTimeout(r, 500)); // 0.5 секунды между вызовами
    }

    info.textContent += "\n\nГотово.";
  }

  btn.addEventListener("click", launchAll);
});
