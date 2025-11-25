// === Детект одной схемы ===
async function detectSingle(schemeName, schemeUrl) {
  return new Promise(resolve => {
    let returned = false;        // Safari вернулся?
    let dialogShown = false;     // Был ли диалог “Open App?”

    sessionStorage.setItem("scheme_test", schemeName);

    // Запускаем тест схемы
    const launchTime = Date.now();

    // Таймер на диалог: если Safari НЕ ушёл через 300–600мс → был диалог
    const dialogTimer = setTimeout(() => {
      if (!returned) {
        dialogShown = true;
      }
    }, 500);

    // Таймер окончания (Safari игнорирует схему)
    const failTimer = setTimeout(() => {
      if (!returned) {
        resolve({ status: "NOT_FOUND", scheme: schemeName, dialog: dialogShown });
      }
    }, 1500);

    // Запуск схемы
    try {
      window.location.href = schemeUrl;
    } catch (e) {}

    // Если Safari УШЁЛ и ВЕРНУЛСЯ
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && !returned) {
        returned = true;
        clearTimeout(dialogTimer);
        clearTimeout(failTimer);

        // Safari ушёл → приложение стоит
        resolve({ status: "INSTALLED", scheme: schemeName, dialog: dialogShown });
      }
    });
  });
}

// === Главное действие кнопки ===
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("checkBtn");
  const out = document.getElementById("output");

  btn.addEventListener("click", async () => {
    out.textContent = "Запуск проверки...\n";

    // Тестируем каждое приложение ОТДЕЛЬНО
    const checks = [
      ["TestFlight", "itms-beta://"],
      ["AltStore", "altstore://"],
      ["ESign", "esign://"],
      ["GBox", "gbox://"],
      ["GBoxAlt", "gboxapp://"],
      ["KSign", "ksign://"],
      ["KStore", "kstore://"],
    ];

    const result = {};

    for (const [name, url] of checks) {
      out.textContent += `\nПроверяем: ${name}...\n`;
      const r = await detectSingle(name, url);

      result[name] = r.status;

      if (r.dialog) {
        result[name] += " (OPEN PROMPT)";
      }

      out.textContent += `${name}: ${result[name]}\n`;

      // Ждём между тестами
      await new Promise(r => setTimeout(r, 700));
    }

    out.textContent += "\nПолный результат:\n" + JSON.stringify(result, null, 2);
  });
});
