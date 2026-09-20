/**
 * routes/tasks.js
 * Express Router for Task CRUD endpoints
 * Practical 5: MongoDB Integration with Mongoose — ITUE301
 *
 * All routes use Mongoose model methods instead of the in-memory array
 * from Practical 4. Validation errors from Mongoose are caught and returned
 * as clean, structured JSON — not raw Mongoose error objects.
 */

const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const validateTask = require('../middleware/validate');

const router = express.Router();

// ─── Helper: Format Mongoose validation errors as clean JSON ──────────────────
//    Extracts the human-readable message from each failed path.
const formatValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return messages.join(' ');
};

// ─── Helper: Check if a string is a valid MongoDB ObjectId ───────────────────
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── GET /tasks ───────────────────────────────────────────────────────────────
// Returns all tasks from MongoDB, newest first.
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /tasks/:id ───────────────────────────────────────────────────────────
// Returns a single task by its MongoDB ObjectId.
// Returns 404 if the task does not exist.                         (Supplementary)
router.get('/:id', async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format.',
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.params.id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /tasks ──────────────────────────────────────────────────────────────
// Creates a new task and saves it to MongoDB.
router.post('/', validateTask, async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;

    // Build the new document (Mongoose schema handles defaults & validation)
    const newTask = new Task({
      title,
      description,
      priority,
    });

    // .save() triggers the pre-save hook (trim) then schema validation
    const saved = await newTask.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: saved,
    });
  } catch (err) {
    // Catch Mongoose ValidationError and return a clean 400 response
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: formatValidationError(err),
      });
    }
    next(err);
  }
});

// ─── PUT /tasks/:id ───────────────────────────────────────────────────────────
// Updates an existing task by its MongoDB ObjectId.
router.put('/:id', async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format.',
      });
    }

    const { title, description, completed, priority } = req.body;

    // Build only the fields that were actually sent
    const updates = {};
    if (title !== undefined)       updates.title       = title;
    if (description !== undefined) updates.description = description;
    if (completed !== undefined)   updates.completed   = completed;
    if (priority !== undefined)    updates.priority    = priority;

    // runValidators: ensures schema rules (enum, required) apply on update too
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.params.id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updated,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: formatValidationError(err),
      });
    }
    next(err);
  }
});

// ─── DELETE /tasks/:id ────────────────────────────────────────────────────────
// Deletes a task by its MongoDB ObjectId.
router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format.',
      });
    }

    const deleted = await Task.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.params.id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Task "${deleted.title}" deleted successfully.`,
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
