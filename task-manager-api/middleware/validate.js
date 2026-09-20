const validateTask = (req, res, next) => {
  // Reject if missing title for POST requests
  if (req.method === 'POST') {
    const { title } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title is required for a task.'
      });
    }
  }
  next();
};

module.exports = validateTask;
