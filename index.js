// ================================
//       Backend Server (Node.js)
// ================================

import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ===== STATIC FRONTEND =====
const PUBLIC_DIR = path.join(__dirname, "public");
app.use(express.static(PUBLIC_DIR));

// ===== ROOT → SERVE index.html =====
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// ===== API: RECEIVE INSTALLER REPORT =====
app.post("/api/check", (req, res) => {
  const data = req.body;

  console.log("\n=== INSTALLER REPORT RECEIVED ===");
  console.log(JSON.stringify(data, null, 2));
  console.log("=================================\n");

  res.json({
    ok: true,
    received: data
  });
});

// ===== HEALTH CHECK (Render) =====
app.get("/healthz", (req, res) => res.json({ ok: true }));

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}\n`);
});
