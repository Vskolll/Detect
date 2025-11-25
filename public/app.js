// === Проверка схем (тихий детект) ===
async function tryOpen(urlScheme) {
  return new Promise(resolve => {
    const timeout = 1500;
    let detected = false;
    let finished = false;

    const start = performance.now();

    const iframe = document.createElement("iframe");
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.position = "absolute";
    iframe.style.top = "-9999px";

    setTimeout(() => {
      if (finished) return;

      const diff = performance.now() - start;

      if (diff < timeout - 200) {
        detected = true;
      }

      finished = true;
      document.body.removeChild(iframe);
      resolve(detected);
    }, timeout);

    try {
      iframe.src = urlScheme;
    } catch (e) {}

    document.body.appendChild(iframe);
  });
}

// === Основная проверка ===
async function checkAll() {
  const installers = [
    { name: "ESign", scheme: "esign://" },
    { name: "AltStore", scheme: "altstore://" },
    { name: "TestFlight", scheme: "itms-beta://" },
    { name: "GBox", scheme: "gbox://" },
    { name: "GBoxAlt", scheme: "gboxapp://" },
    { name: "KSign", scheme: "ksign://" },
    { name: "KStore", scheme: "kstore://" }
  ];

  const result = {};

  for (let app of installers) {
    const ok = await tryOpen(app.scheme);
    result[app.name] = ok ? "INSTALLED" : "NOT_FOUND";
    await new Promise(r => setTimeout(r, 300));
  }

  return result;
}

// === Обработчик кнопки ===
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("checkBtn");
  const out = document.getElementById("output");

  if (!btn || !out) {
    console.error("Elements not found: checkBtn or output");
    return;
  }

  btn.addEventListener("click", async () => {
    out.textContent = "Проверяем...\n";

    const result = await checkAll();
    out.textContent = JSON.stringify(result, null, 2);

    // отправка на сервер
    const serverRes = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    }).then(r => r.json());

    out.textContent += "\n\nОтвет сервера:\n" +
      JSON.stringify(serverRes, null, 2);
  });
});
