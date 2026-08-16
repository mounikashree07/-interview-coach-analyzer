const express = require('express');
const router = express.Router();

// POST /api/media/analyze -> transcribe + analyze audio/video answer
router.post('/analyze', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;
