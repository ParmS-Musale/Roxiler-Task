const { validationResult } = require('express-validator');
const Rating = require('../models/Rating');
const User = require('../models/User');

// Get all ratings (Admin only)
const getAllRatings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      storeId,
      userId,
      rating,
      minRating,
      maxRating,
      hasReview,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    if (storeId) filters.storeId = parseInt(storeId);
    if (userId) filters.userId = parseInt(userId);
    if (rating) filters.rating = parseInt(rating);
    if (minRating) filters.minRating = parseInt(minRating);
    if (maxRating) filters.maxRating = parseInt(maxRating);
    if (hasReview === 'true') filters.hasReview = true;

    const ratings = await Rating.findAll(filters);
    const totalRatings = await Rating.count(filters);
    const totalPages = Math.ceil(totalRatings / filters.limit);

    res.json({
      success: true,
      data: ratings,
      pagination: {
        currentPage: filters.page,
        totalPages,
        totalItems: totalRatings,
        itemsPerPage: filters.limit,
        hasNextPage: filters.page < totalPages,
        hasPrevPage: filters.page > 1
      }
    });
  } catch (error) {
    console.error('Get all ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ratings',
      error: error.message
    });
  }
};

// Get ratings for a specific store (Public)
const getStoreRatings = async (req, res) => {
  try {
    const { storeId } = req.params;
    const {
      page = 1,
      limit = 10,
      rating,
      minRating,
      hasReview,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    if (rating) filters.rating = parseInt(rating);
    if (minRating) filters.minRating = parseInt(minRating);
    if (hasReview === 'true') filters.hasReview = true;

    const ratings = await Rating.findByStore(parseInt(storeId), filters);
    const totalRatings = await Rating.count({ storeId: parseInt(storeId), ...filters });
    const totalPages = Math.ceil(totalRatings / filters.limit);

    // Get store statistics
    const storeStats = await Rating.getStoreStats(parseInt(storeId));

    res.json({
      success: true,
      data: ratings,
      statistics: storeStats,
      pagination: {
        currentPage: filters.page,
        totalPages,
        totalItems: totalRatings,
        itemsPerPage: filters.limit,
        hasNextPage: filters.page < totalPages,
        hasPrevPage: filters.page > 1
      }
    });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store ratings',
      error: error.message
    });
  }
};

// Get user's ratings (Private)
const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user can access these ratings
    if (!req.user.canAccess(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own ratings.'
      });
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    const ratings = await Rating.findByUser(parseInt(userId), filters);
    const totalRatings = await Rating.count({ userId: parseInt(userId) });
    const totalPages = Math.ceil(totalRatings / filters.limit);

    res.json({
      success: true,
      data: ratings,
      pagination: {
        currentPage: filters.page,
        totalPages,
        totalItems: totalRatings,
        itemsPerPage: filters.limit,
        hasNextPage: filters.page < totalPages,
        hasPrevPage: filters.page > 1
      }
    });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user ratings',
      error: error.message
    });
  }
};

// Submit a new rating (Normal user)
const submitRating = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { rating, review, isAnonymous } = req.body;

    // Find the rating
    const existingRating = await Rating.findById(parseInt(id));
    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check if user can modify this rating
    if (!existingRating.canBeModifiedBy(req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own ratings.'
      });
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = parseInt(rating);
    if (review !== undefined) updateData.review = review;
    if (isAnonymous !== undefined) updateData.isAnonymous = isAnonymous;

    const updatedRating = await existingRating.update(updateData);

    res.json({
      success: true,
      message: 'Rating updated successfully',
      data: updatedRating
    });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update rating',
      error: error.message
    });
  }
};

// Delete rating (Admin or own rating)
const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the rating
    const rating = await Rating.findById(parseInt(id));
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check if user can delete this rating
    if (!rating.canBeModifiedBy(req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own ratings or you must be an admin.'
      });
    }

    await rating.delete();

    res.json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete rating',
      error: error.message
    });
  }
};

// Get rating statistics (Admin only)
const getRatingStats = async (req, res) => {
  try {
    const stats = await Rating.getOverallStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get rating stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating statistics',
      error: error.message
    });
  }
};

// Get specific store statistics (Public)
const getStoreStats = async (req, res) => {
  try {
    const { storeId } = req.params;
    const stats = await Rating.getStoreStats(parseInt(storeId));

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get store stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllRatings,
  getStoreRatings,
  getUserRatings,
  submitRating,
  updateRating,
  deleteRating,
  getRatingStats,
  getStoreStats
}; 