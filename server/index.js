import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ===== STATIC FRONTEND =====
const PUBLIC = path.join(__dirname, "public");
app.use(express.static(PUBLIC));

// ===== API =====
app.post("/api/check", async (req, res) => {
  const result = req.body;

  console.log("CHECK RESULT:");
  console.log(result);

  res.json({
    ok: true,
    received: result
  });
});

// ===== HEALTH CHECK =====
app.get("/healthz", (req, res) => res.json({ ok: true }));

// ===== ROOT =====
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC, "index.html"));
});

app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
