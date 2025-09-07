const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - Coming soon' });
});

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - Coming soon' });
});

module.exports = router;