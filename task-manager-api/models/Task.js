/**
 * models/Task.js
 * Mongoose Schema and Model for the Task resource.
 * Practical 6: Full Stack Integration — ITUE301
 * (Extends Practical 5: MongoDB Integration with Mongoose)
 *
 * Schema fields:
 *   title       — String, required
 *   description — String, optional
 *   completed   — Boolean, default false
 *   priority    — String,  enum ['low','medium','high'], default 'medium'  (Supplementary)
 *   createdAt   — Date,    auto-managed by Mongoose timestamps option
 *   updatedAt   — Date,    auto-managed by Mongoose timestamps option      (Practical 6)
 *
 * Schema options:
 *   timestamps  — Automatically adds/updates createdAt & updatedAt        (Practical 6)
 *   toJSON      — Exposes the virtual 'id' field and strips '__v'          (Practical 6)
 *
 * Pre-save hook: trims whitespace from title before saving.         (Supplementary)
 */

const mongoose = require('mongoose');

// ─── Schema Definition ────────────────────────────────────────────────────────
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required.'],
    },

    description: {
      type: String,
      default: '',
    },

    completed: {
      type: Boolean,
      default: false,
    },

    // ── Supplementary: priority field ──────────────────────────────────────────
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '"{VALUE}" is not a valid priority. Must be low, medium, or high.',
      },
      default: 'medium',
    },
  },
  {
    // ── Practical 6: timestamps ───────────────────────────────────────────────
    // Mongoose auto-creates and updates createdAt and updatedAt on every save.
    // Removes the need to manually define createdAt as a schema field.
    timestamps: true,

    // ── Practical 6: toJSON transform ─────────────────────────────────────────
    // Adds the virtual 'id' (string form of _id) to every JSON response,
    // and strips the internal '__v' version key from API output.
    // This ensures the React frontend can reliably use task.id everywhere.
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Supplementary: Pre-save hook — trim whitespace from title ─────────────────
//    Runs before every .save() call; keeps data clean at the schema level.
//    Uses async syntax (recommended in Mongoose 9) instead of the next() callback.
taskSchema.pre('save', async function () {
  if (this.title) {
    this.title = this.title.trim();
  }
  if (this.description) {
    this.description = this.description.trim();
  }
});

// ─── Model Export ─────────────────────────────────────────────────────────────
module.exports = mongoose.model('Task', taskSchema);
