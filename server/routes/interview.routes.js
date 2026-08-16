const express = require('express');
const router = express.Router();

// POST /api/interview/questions -> generate questions for a role
router.post('/questions', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /api/interview/feedback -> score a submitted answer
router.post('/feedback', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;
