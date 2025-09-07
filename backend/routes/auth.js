const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updatePassword,
  logout
} = require('../controllers/authController');

const router = express.Router();

// Placeholder routes - we'll implement these next
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - Coming soon' });
});

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - Coming soon' });
});

module.exports = router;