const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

class Rating {
  constructor(ratingData) {
    this.id = ratingData.id;
    this.userId = ratingData.userId;
    this.storeId = ratingData.storeId;
    this.rating = ratingData.rating;
    this.review = ratingData.review;
    this.isAnonymous = ratingData.isAnonymous || false;
    this.createdAt = ratingData.createdAt;
    this.updatedAt = ratingData.updatedAt;
    
    // Include user and store data if joined
    this.user = ratingData.user;
    this.store = ratingData.store;
    this.userName = ratingData.userName;
    this.userEmail = ratingData.userEmail;
    this.storeName = ratingData.storeName;
    this.storeCategory = ratingData.storeCategory;
  }

  // Create a new rating
  static async create(ratingData) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      // Check if user already rated this store
      const [existingRating] = await connection.execute(
        'SELECT id FROM ratings WHERE userId = ? AND storeId = ?',
        [ratingData.userId, ratingData.storeId]
      );

      if (existingRating.length > 0) {
        throw new Error('User has already rated this store');
      }

      const [result] = await connection.execute(
        `INSERT INTO ratings (userId, storeId, rating, review, isAnonymous, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          ratingData.userId,
          ratingData.storeId,
          ratingData.rating,
          ratingData.review || null,
          ratingData.isAnonymous || false
        ]
      );

      const newRating = await this.findById(result.insertId);
      return newRating;
    } finally {
      await connection.end();
    }
  }

  // Find rating by ID
  static async findById(id) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [rows] = await connection.execute(
        `SELECT r.*, u.name as userName, u.email as userEmail, 
                s.name as storeName, s.category as storeCategory
         FROM ratings r
         LEFT JOIN users u ON r.userId = u.id
         LEFT JOIN stores s ON r.storeId = s.id
         WHERE r.id = ?`,
        [id]
      );

      if (rows.length === 0) return null;
      
      return new Rating(rows[0]);
    } finally {
      await connection.end();
    }
  }

  // Get all ratings with filtering and pagination
  static async findAll(filters = {}) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      let query = `
        SELECT r.*, u.name as userName, u.email as userEmail, 
               s.name as storeName, s.category as storeCategory
        FROM ratings r
        LEFT JOIN users u ON r.userId = u.id
        LEFT JOIN stores s ON r.storeId = s.id
        WHERE 1=1
      `;
      let params = [];

      // Apply filters
      if (filters.userId) {
        query += ' AND r.userId = ?';
        params.push(filters.userId);
      }

      if (filters.storeId) {
        query += ' AND r.storeId = ?';
        params.push(filters.storeId);
      }

      if (filters.rating) {
        query += ' AND r.rating = ?';
        params.push(filters.rating);
      }

      if (filters.minRating) {
        query += ' AND r.rating >= ?';
        params.push(filters.minRating);
      }

      if (filters.maxRating) {
        query += ' AND r.rating <= ?';
        params.push(filters.maxRating);
      }

      if (filters.hasReview) {
        query += ' AND r.review IS NOT NULL AND r.review != ""';
      }

      // Add sorting
      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'DESC';
      query += ` ORDER BY r.${sortBy} ${sortOrder}`;

      // Add pagination
      if (filters.limit) {
        const limit = parseInt(filters.limit);
        const offset = filters.page ? (parseInt(filters.page) - 1) * limit : 0;
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
      }

      const [rows] = await connection.execute(query, params);
      
      return rows.map(row => new Rating(row));
    } finally {
      await connection.end();
    }
  }

  // Get ratings for a specific store (public endpoint)
  static async findByStore(storeId, filters = {}) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      let query = `
        SELECT r.*, 
               CASE 
                 WHEN r.isAnonymous = true THEN 'Anonymous'
                 ELSE u.name
               END as userName,
               s.name as storeName, s.category as storeCategory
        FROM ratings r
        LEFT JOIN users u ON r.userId = u.id
        LEFT JOIN stores s ON r.storeId = s.id
        WHERE r.storeId = ?
      `;
      let params = [storeId];

      // Apply filters
      if (filters.rating) {
        query += ' AND r.rating = ?';
        params.push(filters.rating);
      }

      if (filters.minRating) {
        query += ' AND r.rating >= ?';
        params.push(filters.minRating);
      }

      if (filters.hasReview) {
        query += ' AND r.review IS NOT NULL AND r.review != ""';
      }

      // Add sorting
      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'DESC';
      query += ` ORDER BY r.${sortBy} ${sortOrder}`;

      // Add pagination
      if (filters.limit) {
        const limit = parseInt(filters.limit);
        const offset = filters.page ? (parseInt(filters.page) - 1) * limit : 0;
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
      }

      const [rows] = await connection.execute(query, params);
      
      return rows.map(row => new Rating(row));
    } finally {
      await connection.end();
    }
  }

  // Get ratings by a specific user (private endpoint)
  static async findByUser(userId, filters = {}) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      let query = `
        SELECT r.*, u.name as userName, u.email as userEmail,
               s.name as storeName, s.category as storeCategory
        FROM ratings r
        LEFT JOIN users u ON r.userId = u.id
        LEFT JOIN stores s ON r.storeId = s.id
        WHERE r.userId = ?
      `;
      let params = [userId];

      // Add sorting
      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'DESC';
      query += ` ORDER BY r.${sortBy} ${sortOrder}`;

      // Add pagination
      if (filters.limit) {
        const limit = parseInt(filters.limit);
        const offset = filters.page ? (parseInt(filters.page) - 1) * limit : 0;
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
      }

      const [rows] = await connection.execute(query, params);
      
      return rows.map(row => new Rating(row));
    } finally {
      await connection.end();
    }
  }

  // Count total ratings
  static async count(filters = {}) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      let query = 'SELECT COUNT(*) as total FROM ratings WHERE 1=1';
      let params = [];

      if (filters.userId) {
        query += ' AND userId = ?';
        params.push(filters.userId);
      }

      if (filters.storeId) {
        query += ' AND storeId = ?';
        params.push(filters.storeId);
      }

      if (filters.rating) {
        query += ' AND rating = ?';
        params.push(filters.rating);
      }

      if (filters.minRating) {
        query += ' AND rating >= ?';
        params.push(filters.minRating);
      }

      if (filters.hasReview) {
        query += ' AND review IS NOT NULL AND review != ""';
      }

      const [rows] = await connection.execute(query, params);
      return rows[0].total;
    } finally {
      await connection.end();
    }
  }

  // Update rating
  async update(updateData) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const fields = [];
      const params = [];

      if (updateData.rating !== undefined) {
        fields.push('rating = ?');
        params.push(updateData.rating);
      }

      if (updateData.review !== undefined) {
        fields.push('review = ?');
        params.push(updateData.review);
      }

      if (updateData.isAnonymous !== undefined) {
        fields.push('isAnonymous = ?');
        params.push(updateData.isAnonymous);
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      fields.push('updatedAt = NOW()');
      params.push(this.id);

      await connection.execute(
        `UPDATE ratings SET ${fields.join(', ')} WHERE id = ?`,
        params
      );

      // Return updated rating
      const updatedRating = await Rating.findById(this.id);
      Object.assign(this, updatedRating);
      
      return this;
    } finally {
      await connection.end();
    }
  }

  // Delete rating
  async delete() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      await connection.execute('DELETE FROM ratings WHERE id = ?', [this.id]);
      return true;
    } finally {
      await connection.end();
    }
  }

  // Get store rating statistics
  static async getStoreStats(storeId) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [stats] = await connection.execute(
        `SELECT 
           COUNT(*) as totalRatings,
           AVG(rating) as averageRating,
           SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as fiveStars,
           SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as fourStars,
           SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as threeStars,
           SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as twoStars,
           SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as oneStar,
           COUNT(CASE WHEN review IS NOT NULL AND review != '' THEN 1 END) as reviewCount
         FROM ratings 
         WHERE storeId = ?`,
        [storeId]
      );

      return {
        storeId,
        totalRatings: stats[0].totalRatings,
        averageRating: parseFloat(stats[0].averageRating) || 0,
        reviewCount: stats[0].reviewCount,
        distribution: {
          5: stats[0].fiveStars,
          4: stats[0].fourStars,
          3: stats[0].threeStars,
          2: stats[0].twoStars,
          1: stats[0].oneStar
        }
      };
    } finally {
      await connection.end();
    }
  }

  // Get overall rating statistics (for admin dashboard)
  static async getOverallStats() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [stats] = await connection.execute(
        `SELECT 
           COUNT(*) as totalRatings,
           AVG(rating) as averageRating,
           COUNT(CASE WHEN review IS NOT NULL AND review != '' THEN 1 END) as reviewCount,
           COUNT(DISTINCT storeId) as ratedStores,
           COUNT(DISTINCT userId) as ratingUsers
         FROM ratings`
      );

      const [recentRatings] = await connection.execute(
        `SELECT COUNT(*) as total FROM ratings 
         WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
      );

      return {
        totalRatings: stats[0].totalRatings,
        averageRating: parseFloat(stats[0].averageRating) || 0,
        reviewCount: stats[0].reviewCount,
        ratedStores: stats[0].ratedStores,
        ratingUsers: stats[0].ratingUsers,
        recentRatings: recentRatings[0].total
      };
    } finally {
      await connection.end();
    }
  }

  // Check if user can modify this rating
  canBeModifiedBy(userId, userRole) {
    return userRole === 'admin' || this.userId === parseInt(userId);
  }

  // Sanitize output for anonymous ratings
  toJSON() {
    const ratingObject = { ...this };
    
    if (this.isAnonymous) {
      ratingObject.userName = 'Anonymous';
      delete ratingObject.userEmail;
      delete ratingObject.user;
    }
    
    return ratingObject;
  }
}

module.exports = Rating;