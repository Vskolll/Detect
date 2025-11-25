// index.js — сервер под Render с mobileconfig поддержкой
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Разрешаем CORS
app.use(cors());

// Нам нужно принимать сырые XML данные от mobileconfig
app.use("/api/mobileconfig", express.text({ type: "*/*" }));

// ====== Храним последнее устройство ======
let lastDeviceReport = null;

// ====== Раздача index.html и других статических файлов ======
app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"]
}));

// =======================================
// 1. ОТДАЧА mobileconfig ПРАВИЛЬНЫМ MIME
// =======================================
app.get("/profile.mobileconfig", (req, res) => {
  const filePath = path.join(__dirname, "public", "profile.mobileconfig");

  res.setHeader("Content-Type", "application/x-apple-aspen-config");
  res.setHeader("Content-Disposition", "attachment; filename=profile.mobileconfig");

  res.sendFile(filePath);
});

// =======================================
// 2. ПРИЁМ ДАННЫХ ОТ ПРОФИЛЯ (iPhone)
// =======================================
app.post("/api/mobileconfig", (req, res) => {
  console.log("=========== MOBILECONFIG REPORT RECEIVED ===========");
  console.log(req.body);
  console.log("====================================================");

  // сохраняем XML для вывода на сайт
  lastDeviceReport = req.body;

  // ОБЯЗАТЕЛЬНО: ответ iPhone
  res.set("Content-Type", "application/xml");
  res.send(`
    <?xml version="1.0" encoding="UTF-8"?>
    <plist version="1.0">
    <dict>
      <key>Status</key><string>OK</string>
    </dict>
    </plist>
  `);
});

// =======================================
// 3. Эндпоинт для index.html → показать XML
// =======================================
app.get("/get-last-device", (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send(lastDeviceReport || "Пока данных нет. Установите профиль.");
});

// =======================================
// 4. HEALTH CHECK для Render
// =======================================
app.get("/healthz", (req, res) => {
  res.json({ ok: true });
});

// =======================================
// 5. Запуск сервера
// =======================================
app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
