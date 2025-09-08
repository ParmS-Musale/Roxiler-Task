const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordUpdate
} = require('../middleware/validation');
const {
  register,
  login,
  getMe,
  updatePassword,
  logout
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', validateUserRegistration, register);

router.post('/login', validateUserLogin, login);

router.get('/me', authenticate, getMe);

router.put('/password', authenticate, validatePasswordUpdate, updatePassword);

router.post('/logout', authenticate, logout);

module.exports = router;