const express = require('express');
const Task    = require('../models/Task');
const protect = require('../middleware/auth');

const router = express.Router();

// ── Normalize MongoDB _id → id so the frontend's task.id references work ──────
const normalize = (doc) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj._id.toString();
  return obj;
};

// All task routes require a valid JWT
router.use(protect);

// GET /tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, data: tasks.map(normalize) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tasks
router.post('/', async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const task = await Task.create({ user: req.user._id, title, description, priority });
    res.status(201).json({ success: true, message: 'Task created', data: normalize(task) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, message: 'Task updated', data: normalize(task) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, message: 'Task deleted', data: normalize(task) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
