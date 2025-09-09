const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validateRatingSubmission,
  validateRatingUpdate,
  validateRatingId,
  validateStoreId,
  validateUserId,
  validateRatingQuery,
  validateStoreRatingQuery,
  validateUserRatingQuery
} = require('../middleware/validation');
const {
  getAllRatings,
  getStoreRatings,
  getUserRatings,
  submitRating,
  updateRating,
  deleteRating,
  getRatingStats,
  getStoreStats
} = require('../controllers/ratingController');

const router = express.Router();

// GET /api/ratings - Get all ratings (Admin only)
router.get(
  '/',
  authenticate,
  authorize('admin'),
  validateRatingQuery,
  getAllRatings
);

// GET /api/ratings/store/:storeId - Get ratings for store (Public)
router.get(
  '/store/:storeId',
  validateStoreId,
  validateStoreRatingQuery,
  getStoreRatings
);

// GET /api/ratings/store/:storeId/stats - Get store statistics (Public)
router.get(
  '/store/:storeId/stats',
  validateStoreId,
  getStoreStats
);

// GET /api/ratings/user/:userId - Get user's ratings (Private - own ratings or admin)
router.get(
  '/user/:userId',
  authenticate,
  validateUserId,
  validateUserRatingQuery,
  getUserRatings
);

// GET /api/ratings/stats - Get rating statistics (Admin only)
router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  getRatingStats
);

// POST /api/ratings - Submit rating (Normal user only)
router.post(
  '/',
  authenticate,
  authorize('user'),
  validateRatingSubmission,
  submitRating
);

// PUT /api/ratings/:id - Update rating (Own rating only or admin)
router.put(
  '/:id',
  authenticate,
  validateRatingUpdate,
  updateRating
);

// DELETE /api/ratings/:id - Delete rating (Admin or own rating)
router.delete(
  '/:id',
  authenticate,
  validateRatingId,
  deleteRating
);

module.exports = router;