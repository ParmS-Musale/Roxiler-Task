const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validateSearch } = require('../middleware/validation');
const {
  getDashboard,
  getAdminUsers
} = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard', authenticate, authorize('admin'), getDashboard);

router.get('/users', authenticate, authorize('admin'), getAdminUsers);

module.exports = router;