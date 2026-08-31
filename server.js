import express from "express";
import cors from "cors";
import pg from "pg";
import { calculate } from "./calculate.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 5000
});

// ALB isi ko ping karega. DB check jaan-boojh ke nahi -
// DB down ho to bhi container healthy rehna chahiye, warna restart loop
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/calculate", async (req, res) => {
  const { expression } = req.body || {};

  let result;
  try {
    result = calculate(expression);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  // DB fail ho to bhi answer bhejo
  try {
    await pool.query(
      "INSERT INTO calculations (expression, result) VALUES ($1, $2)",
      [expression, result]
    );
  } catch (err) {
    console.error("DB insert failed:", err.message);
  }

  res.json({ result });
});

app.get("/api/history", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT expression, result FROM calculations ORDER BY id DESC LIMIT 20"
    );
    res.json(rows);
  } catch (err) {
    res.status(503).json({ error: "History unavailable" });
  }
});

const server = app.listen(port, () => console.log("Listening on " + port));

// ECS SIGTERM bhejta hai task band karte waqt
process.on("SIGTERM", () => server.close(() => pool.end()));
