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

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, getMe);

// @route   PUT /api/auth/password
// @desc    Update user password
// @access  Private
router.put('/password', authenticate, updatePassword);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, logout);

module.exports = router;