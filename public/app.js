// === ЛОГИКА ДЕТЕКЦИИ ИНСТАЛЛЕРОВ НА IOS (2025) ===
// Метод основан на том, что если приложение УСТАНОВЛЕНО,
// Safari УХОДИТ в background (переход в схему), а затем ВОЗВРАЩАЕТСЯ.
// Мы фиксируем момент возврата через visibilitychange.

// === Детектор конкретной схемы ===
async function detectInstaller(scheme) {
  return new Promise(resolve => {
    sessionStorage.setItem("installer_test", "checking");

    let finished = false;

    // Таймер: если Safari НЕ ушёл в background → приложение НЕ установлено
    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        sessionStorage.setItem("installer_test", "noapp");
        resolve(false);
      }
    }, 1200);

    // Пытаемся открыть схему (если приложение есть — Safari уйдёт)
    try {
      window.location.href = scheme;
    } catch (e) {}

    // Отслеживаем возвращение Safari назад
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && !finished) {
        finished = true;
        clearTimeout(timeout);
        sessionStorage.setItem("installer_test", "installed");
        resolve(true);
      }
    });
  });
}

// === ПОСЛЕДОВАТЕЛЬНАЯ ПРОВЕРКА ВСЕХ ИНСТАЛЛЕРОВ ===
async function checkAllInstallers() {
  const installers = [
    { name: "TestFlight", scheme: "itms-beta://" },
    { name: "AltStore",   scheme: "altstore://" },
    { name: "ESign",      scheme: "esign://" },
    { name: "GBox",       scheme: "gbox://" },
    { name: "GBoxAlt",    scheme: "gboxapp://" },
    { name: "KSign",      scheme: "ksign://" },
    { name: "KStore",     scheme: "kstore://" }
  ];

  const result = {};

  for (let app of installers) {
    const ok = await detectInstaller(app.scheme);

    result[app.name] = ok ? "INSTALLED" : "NOT_FOUND";

    // Пауза 1 секунда, чтобы Safari успел полностью восстановиться
    await new Promise(r => setTimeout(r, 1000));
  }

  return result;
}

// === ВЗАИМОДЕЙСТВИЕ С КНОПКОЙ ===
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("checkBtn");
  const out = document.getElementById("output");

  if (!btn || !out) {
    console.error("ERROR: кнопка или output не найдены в HTML.");
    return;
  }

  btn.addEventListener("click", async () => {
    out.textContent = "Проверяем... Останьтесь на странице.\n";
    sessionStorage.removeItem("installer_test");

    const result = await checkAllInstallers();

    out.textContent = JSON.stringify(result, null, 2);

    // отправка результата на сервер
    fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    })
    .then(r => r.json())
    .then(serverRes => {
      out.textContent += "\n\nОтвет сервера:\n" +
        JSON.stringify(serverRes, null, 2);
    });
  });
});
