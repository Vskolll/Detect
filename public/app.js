async function tryOpen(urlScheme, timeout = 1200) {
  return new Promise(resolve => {
    let opened = false;
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = urlScheme;
    document.body.appendChild(iframe);

    const start = Date.now();

    setTimeout(() => {
      document.body.removeChild(iframe);
      const diff = Date.now() - start;
      if (diff < timeout - 150) opened = true;

      resolve(opened);
    }, timeout);
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
