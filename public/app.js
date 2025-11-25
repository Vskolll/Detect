async function tryOpen(urlScheme) {
  return new Promise(resolve => {
    const timeout = 1500;
    let detected = false;
    let finished = false;

    const start = performance.now();

    // создаем невидимый iframe
    const iframe = document.createElement("iframe");
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.position = "absolute";
    iframe.style.top = "-9999px";

    const timer = setTimeout(() => {
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


  const result = {};

  for (let app of installers) {
    const ok = await tryOpen(app.scheme);
    result[app.name] = ok ? "INSTALLED" : "NOT FOUND";
    await new Promise(r => setTimeout(r, 250));
  }

  return result;
}

document.getElementById("checkBtn").addEventListener("click", async () => {
  const out = document.getElementById("output");

  out.textContent = "Проверяем...\n";

  const result = await checkAll();

  out.textContent = JSON.stringify(result, null, 2);

  // отправить на сервер
  const serverRes = await fetch("/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result)
  }).then(r => r.json());

  out.textContent += "\n\nОтвет сервера:\n" +
    JSON.stringify(serverRes, null, 2);
});
