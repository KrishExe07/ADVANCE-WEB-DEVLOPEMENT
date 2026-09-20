/**
 * server.js
 * Main Express Application Entry Point
 * Practical 6: Full Stack Integration — ITUE301
 * (Extends Practical 5: MongoDB Integration with Mongoose)
 *
 * Architecture:
 *   React Frontend (localhost:5173)
 *         | fetch/axios calls via src/api.js
 *         v
 *   Express Backend (localhost:5000)  ← CORS enabled for :5173
 *         | Mongoose ODM
 *         v
 *   MongoDB Database (tasks collection)
 *
 *   Client → [CORS] → [Logging] → [Content-Type]
 *          → [Express Router /tasks] → [404] → [Global Error Handler]
 *                        ↓
 *                  Mongoose ODM
 *                        ↓
 *                  MongoDB (tasks collection)
 */

require('dotenv').config(); // Load .env variables before anything else

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ══════════════════════════════════════════════════════════════════════════════
// 1. BUILT-IN MIDDLEWARE
// ══════════════════════════════════════════════════════════════════════════════

// Allow requests from the React dev server (Vite on port 5173)
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));

// Parse incoming JSON request bodies (makes req.body available)
app.use(express.json());

// ══════════════════════════════════════════════════════════════════════════════
// 2. CUSTOM MIDDLEWARE - Request Logger
//    Logs method, URL, and timestamp for every incoming request
//    Must call next() so the request continues through the pipeline
// ══════════════════════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. CUSTOM MIDDLEWARE - Content-Type Validator
//    Rejects POST and PUT requests that do NOT have Content-Type: application/json
//    Only applies to mutating methods, not GET/DELETE
// ══════════════════════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        error:
          'Content-Type must be application/json for POST and PUT requests.',
      });
    }
  }
  next();
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. ROUTES - Mount auth at /auth, task router at /tasks (protected)
// ══════════════════════════════════════════════════════════════════════════════
app.use('/auth', authRouter);
app.use('/tasks', authMiddleware, taskRouter);

// Root welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Manager API is running.',
    version: '3.0.0',
    database: mongoose.connection.readyState === 1 ? 'MongoDB connected' : 'MongoDB disconnected',
    endpoints: {
      getAllTasks:   'GET    /tasks',
      getTaskById:  'GET    /tasks/:id',
      createTask:   'POST   /tasks',
      updateTask:   'PUT    /tasks/:id',
      deleteTask:   'DELETE /tasks/:id',
    },
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. 404 HANDLER - Undefined Routes
//    Must be placed AFTER all valid routes
//    Returns a structured JSON response (not the default Express HTML page)
// ══════════════════════════════════════════════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route '${req.method} ${req.url}' not found.`,
    hint: 'Valid endpoints: GET /tasks, GET /tasks/:id, POST /tasks, PUT /tasks/:id, DELETE /tasks/:id',
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. GLOBAL ERROR HANDLER
//    Must have 4 parameters: (err, req, res, next) — Express identifies it as
//    an error handler ONLY if all 4 parameters are present.
//    Must be the LAST middleware in the pipeline.
//    Called when any route/middleware calls next(err).
//
//    NOTE: Raw error stacks are NOT sent to the client (security best practice).
//    Stack traces are logged server-side only.
// ══════════════════════════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`); // log full stack server-side only
  res.status(500).json({
    success: false,
    error: 'Something went wrong. Please try again later.',
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// START SERVER — only after MongoDB connects
// ══════════════════════════════════════════════════════════════════════════════
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('\n❌  MONGO_URI is not set. Please create a .env file.');
  console.error('    Copy .env.example → .env and fill in your connection string.\n');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('\n✅  MongoDB connected successfully.');
    app.listen(PORT, () => {
      console.log(`🚀  Task Manager API server is running on port ${PORT}`);
      console.log(`    Local: http://localhost:${PORT}`);
      console.log(`    Endpoints:`);
      console.log(`      GET    http://localhost:${PORT}/tasks`);
      console.log(`      GET    http://localhost:${PORT}/tasks/:id`);
      console.log(`      POST   http://localhost:${PORT}/tasks`);
      console.log(`      PUT    http://localhost:${PORT}/tasks/:id`);
      console.log(`      DELETE http://localhost:${PORT}/tasks/:id\n`);
    });
  })
  .catch((err) => {
    console.error(`\n❌  MongoDB connection failed: ${err.message}`);
    console.error('    Check your MONGO_URI in .env and ensure MongoDB is running.\n');
    process.exit(1);
  });
