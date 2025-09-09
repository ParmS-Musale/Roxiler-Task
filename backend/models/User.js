const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dbConfig = require('../config/database');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.role = userData.role || 'user';
    this.phone = userData.phone;
    this.address = userData.address;
    this.isActive = userData.isActive !== undefined ? userData.isActive : true;
    this.createdAt = userData.createdAt;
    this.updatedAt = userData.updatedAt;
  }

  // Create a new user
  static async create(userData) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const [result] = await connection.execute(
        `INSERT INTO users (name, email, password, role, phone, address, isActive, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userData.name,
          userData.email,
          hashedPassword,
          userData.role || 'user',
          userData.phone || null,
          userData.address || null,
          userData.isActive !== undefined ? userData.isActive : true
        ]
      );

      const newUser = await this.findById(result.insertId);
      return newUser;
    } finally {
      await connection.end();
    }
  }

  // Find user by ID
  static async findById(id) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      if (rows.length === 0) return null;
      
      return new User(rows[0]);
    } finally {
      await connection.end();
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (rows.length === 0) return null;
      
      return new User(rows[0]);
    } finally {
      await connection.end();
    }
  }

  // Get all users with filtering and pagination
  static async findAll(filters = {}) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      let query = 'SELECT * FROM users WHERE 1=1';
      let params = [];

      // Apply filters
      if (filters.role) {
        query += ' AND role = ?';
        params.push(filters.role);
      }

      if (filters.isActive !== undefined) {
        query += ' AND isActive = ?';
        params.push(filters.isActive);
      }

      if (filters.search) {
        query += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      // Add sorting
      query += ' ORDER BY createdAt DESC';

      // Add pagination
      if (filters.limit) {
        const limit = parseInt(filters.limit);
        const offset = filters.page ? (parseInt(filters.page) - 1) * limit : 0;
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
      }

      const [rows] = await connection.execute(query, params);
      
      return rows.map(row => new User(row));
    } finally {
      await connection.end();
    }
  }

  // Count total users (for pagination)
  static async count(filters = {}) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      let query = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
      let params = [];

      // Apply same filters as findAll
      if (filters.role) {
        query += ' AND role = ?';
        params.push(filters.role);
      }

      if (filters.isActive !== undefined) {
        query += ' AND isActive = ?';
        params.push(filters.isActive);
      }

      if (filters.search) {
        query += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      const [rows] = await connection.execute(query, params);
      return rows[0].total;
    } finally {
      await connection.end();
    }
  }

  // Update user
  async update(updateData) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const fields = [];
      const params = [];

      // Build dynamic update query
      if (updateData.name !== undefined) {
        fields.push('name = ?');
        params.push(updateData.name);
      }
      
      if (updateData.email !== undefined) {
        fields.push('email = ?');
        params.push(updateData.email);
      }
      
      if (updateData.password !== undefined) {
        fields.push('password = ?');
        params.push(await bcrypt.hash(updateData.password, 12));
      }
      
      if (updateData.role !== undefined) {
        fields.push('role = ?');
        params.push(updateData.role);
      }
      
      if (updateData.phone !== undefined) {
        fields.push('phone = ?');
        params.push(updateData.phone);
      }
      
      if (updateData.address !== undefined) {
        fields.push('address = ?');
        params.push(updateData.address);
      }
      
      if (updateData.isActive !== undefined) {
        fields.push('isActive = ?');
        params.push(updateData.isActive);
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      fields.push('updatedAt = NOW()');
      params.push(this.id);

      await connection.execute(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        params
      );

      // Return updated user
      const updatedUser = await User.findById(this.id);
      Object.assign(this, updatedUser);
      
      return this;
    } finally {
      await connection.end();
    }
  }

  // Delete user
  async delete() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      await connection.execute('DELETE FROM users WHERE id = ?', [this.id]);
      return true;
    } finally {
      await connection.end();
    }
  }

  // Soft delete user (set isActive to false)
  async softDelete() {
    return await this.update({ isActive: false });
  }

  // Compare password
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Get user without password
  toJSON() {
    const userObject = { ...this };
    delete userObject.password;
    return userObject;
  }

  // Check if user has permission to access resource
  canAccess(resourceUserId) {
    return this.role === 'admin' || this.id === parseInt(resourceUserId);
  }

  // Check if user is admin
  isAdmin() {
    return this.role === 'admin';
  }

  // Check if user is store owner
  isStoreOwner() {
    return this.role === 'store_owner';
  }

  // Get user stats (for admin dashboard)
  static async getStats() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [totalUsers] = await connection.execute(
        'SELECT COUNT(*) as total FROM users'
      );
      
      const [activeUsers] = await connection.execute(
        'SELECT COUNT(*) as total FROM users WHERE isActive = true'
      );
      
      const [usersByRole] = await connection.execute(
        `SELECT role, COUNT(*) as count FROM users 
         WHERE isActive = true 
         GROUP BY role`
      );
      
      const [recentUsers] = await connection.execute(
        `SELECT COUNT(*) as total FROM users 
         WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
      );

      return {
        total: totalUsers[0].total,
        active: activeUsers[0].total,
        inactive: totalUsers[0].total - activeUsers[0].total,
        recent: recentUsers[0].total,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item.count;
          return acc;
        }, {})
      };
    } finally {
      await connection.end();
    }
  }
}

module.exports = User;