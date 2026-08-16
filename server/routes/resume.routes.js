const express = require('express');
const router = express.Router();

// POST /api/resume/analyze  -> upload resume + JD, return match score + gaps
router.post('/analyze', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;
