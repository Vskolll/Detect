// index.js — полностью рабочий сервер под Render
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Разрешаем CORS (если нужно)
app.use(cors());

// Нужен сырой текст для получения mobileconfig (XML)
app.use("/api/mobileconfig", express.text({ type: "*/*" }));

// Отдача статики (index.html, css, js)
app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"]
}));

// =========================================
// 1. ОТДАЧА mobileconfig правильным MIME
// =========================================
app.get("/profile.mobileconfig", (req, res) => {
  const filePath = path.join(__dirname, "public", "profile.mobileconfig");

  res.setHeader("Content-Type", "application/x-apple-aspen-config");
  res.setHeader("Content-Disposition", "attachment; filename=profile.mobileconfig");

  res.sendFile(filePath);
});

// =========================================
// 2. ПРИЁМ ДАННЫХ ОТ ПРОФИЛЯ
// =========================================
app.post("/api/mobileconfig", (req, res) => {
  console.log("============== MOBILECONFIG REPORT ==============");
  console.log(req.body);
  console.log("=================================================");

  // Можно распарсить XML → JSON → сохранить/отправить в Telegram
  // Я могу добавить это по запросу

  // Ответ iPhone ОБЯЗАТЕЛЬНО
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

// =========================================
// 3. HEALTH CHECK (Render требует)
// =========================================
app.get("/healthz", (req, res) => {
  res.json({ ok: true });
});

// =========================================
// 4. Запуск
// =========================================
app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
