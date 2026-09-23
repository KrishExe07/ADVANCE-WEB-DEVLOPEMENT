/**
 * server.js — Express + MongoDB backend
 * Practical 9: In-Memory Caching and Query Optimization (ITUE301)
 *
 * New in Practical 9:
 *   - X-Response-Time header added on every response (ms) for easy
 *     measurement in Postman / Thunder Client without a stopwatch.
 *   - Cache module (cache.js) is initialised once here; all routes share it.
 *
 * Routes:
 *   POST   /auth/register
 *   POST   /auth/login
 *   GET    /auth/me            (protected)
 *   GET    /tasks              (protected, cached 60s)
 *   GET    /tasks/:id          (protected, cached 60s - supplementary)
 *   POST   /tasks              (protected, invalidates cache)
 *   PUT    /tasks/:id          (protected, invalidates cache)
 *   DELETE /tasks/:id          (protected, invalidates cache)
 *   GET    /tasks/debug/cache  (protected, hit/miss stats - supplementary)
 */

require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app      = express();
const PORT     = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskmanager";

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// X-Response-Time header — lets Postman show processing time without extra plugins
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    res.setHeader("X-Response-Time", `${Date.now() - start}ms`);
  });
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/auth",  authRoutes);
app.use("/tasks", taskRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) =>
  res.json({ message: "Task Manager API — Practical 9 (Caching) running" })
);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ── Connect to MongoDB then start server ──────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected:", MONGO_URI);
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}  [Practical 9 — Caching enabled]`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
