const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Users endpoint - Coming soon' });
});

module.exports = router;