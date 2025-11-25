// ===============================
//  iOS Installer Detector (2025)
// ===============================

// Проверка одного приложения через переход и возврат в Safari
async function detectInstaller(scheme) {
  return new Promise(resolve => {
    sessionStorage.setItem("installer_test", "checking");

    let finished = false;

    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        sessionStorage.setItem("installer_test", "noapp");
        resolve(false);
      }
    }, 1200);

    try {
      window.location.href = scheme;
    } catch (e) {}

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

// Основная проверка всех инсталлеров
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

    // ждём секунду чтобы Safari восстановился
    await new Promise(r => setTimeout(r, 1000));
  }

  return result;
}

// ===============================
//  ЛОГИКА ПРИОРИТЕТОВ
// ===============================
// Если сработала нижняя — засчитываем верхнюю
function normalizeResult(result) {
  const priority = [
    "TestFlight",
    "AltStore",
    "ESign",
    "GBox",
    "GBoxAlt",
    "KSign",
    "KStore"
  ];

  let detected = null;

  for (let name of priority) {
    if (result[name] === "INSTALLED") {
      detected = name;
      break;
    }
  }

  if (detected) {
    const final = {};
    for (let name of priority) {
      final[name] = name === detected ? "INSTALLED" : "NOT_FOUND";
    }
    return final;
  }

  return result;
}

// ===============================
//  UI
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("checkBtn");
  const out = document.getElementById("output");

  if (!btn || !out) {
    console.error("ERROR: checkBtn или output не найдены в HTML");
    return;
  }

  btn.addEventListener("click", async () => {
    out.textContent = "Проверяем... оставайтесь на странице...\n";

    sessionStorage.removeItem("installer_test");

    let result = await checkAllInstallers();
    result = normalizeResult(result);

    out.textContent = JSON.stringify(result, null, 2);

    // отправка на сервер
    fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    })
      .then(r => r.json())
      .then(serverRes => {
        out.textContent += "\n\nОтвет сервера:\n" +
          JSON.stringify(serverRes, null, 2);
      })
      .catch(err => {
        out.textContent += "\n\nОшибка отправки на сервер:\n" + err;
      });
  });
});
