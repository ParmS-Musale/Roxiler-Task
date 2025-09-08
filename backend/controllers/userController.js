const { executeQuery, executeTransaction } = require('../config/database');
const bcrypt = require('bcryptjs');

// Helper function to hash password
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  return await bcrypt.hash(password, saltRounds);
};

// @desc    Get all users with filtering and pagination
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build WHERE clause for filtering
    let whereConditions = ['is_active = TRUE'];
    let queryParams = [];

    // Search filter (name, email, address)
    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ? OR address LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Role filter
    if (role) {
      whereConditions.push('role = ?');
      queryParams.push(role);
    }

    const whereClause = whereConditions.join(' AND ');

    // Validate sort parameters
    const allowedSortFields = ['name', 'email', 'role', 'created_at', 'updated_at'];
    const allowedSortOrders = ['asc', 'desc'];
    
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`;
    const totalResult = await executeQuery(countQuery, queryParams);
    const totalUsers = totalResult[0].total;

    // Get users with pagination
    const usersQuery = `
      SELECT id, name, email, address, role, created_at, updated_at
      FROM users 
      WHERE ${whereClause}
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT ? OFFSET ?
    `;

    const users = await executeQuery(usersQuery, [...queryParams, parseInt(limit), offset]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin or own profile)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is accessing their own profile or if they're admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
    }

    const userQuery = `
      SELECT id, name, email, address, role, created_at, updated_at
      FROM users 
      WHERE id = ? AND is_active = TRUE
    `;

    const users = await executeQuery(userQuery, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If user is store owner, get their store info
    let storeInfo = null;
    if (users[0].role === 'store_owner') {
      const storeQuery = 'SELECT id, name, average_rating, total_ratings FROM stores WHERE owner_id = ? AND is_active = TRUE';
      const stores = await executeQuery(storeQuery, [id]);
      if (stores.length > 0) {
        storeInfo = stores[0];
      }
    }

    res.json({
      success: true,
      data: {
        user: users[0],
        ...(storeInfo && { store: storeInfo })
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    // Validation is handled by middleware
    const { name, email, password, address, role = 'normal_user' } = req.body;

    // Check if user already exists
    const existingUserQuery = 'SELECT id FROM users WHERE email = ?';
    const existingUsers = await executeQuery(existingUserQuery, [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert new user
    const insertUserQuery = `
      INSERT INTO users (name, email, password_hash, address, role) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(insertUserQuery, [
      name,
      email,
      hashedPassword,
      address || null,
      role
    ]);

    // Get the created user (without password)
    const getUserQuery = `
      SELECT id, name, email, address, role, created_at 
      FROM users 
      WHERE id = ?
    `;

    const newUser = await executeQuery(getUserQuery, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: newUser[0]
      }
    });

  } catch (error) {
    console.error('Create user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or own profile)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, role } = req.body;

    // Check if user is updating their own profile or if they're admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.'
      });
    }

    // Non-admin users cannot change their role
    if (req.user.role !== 'admin' && role && role !== req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'You cannot change your own role.'
      });
    }

    // Check if user exists
    const existingUserQuery = 'SELECT id, role FROM users WHERE id = ? AND is_active = TRUE';
    const existingUsers = await executeQuery(existingUserQuery, [id]);

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email) {
      const emailCheckQuery = 'SELECT id FROM users WHERE email = ? AND id != ?';
      const emailCheck = await executeQuery(emailCheckQuery, [email, id]);
      
      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address || null);
    }
    if (role && req.user.role === 'admin') {
      updateFields.push('role = ?');
      updateValues.push(role);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;

    await executeQuery(updateQuery, updateValues);

    // Get updated user
    const getUserQuery = `
      SELECT id, name, email, address, role, created_at, updated_at
      FROM users 
      WHERE id = ?
    `;

    const updatedUser = await executeQuery(getUserQuery, [id]);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser[0]
      }
    });

  } catch (error) {
    console.error('Update user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUserQuery = 'SELECT id, role FROM users WHERE id = ? AND is_active = TRUE';
    const existingUsers = await executeQuery(existingUserQuery, [id]);

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Soft delete (set is_active to false)
    const deleteQuery = `
      UPDATE users 
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    await executeQuery(deleteQuery, [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};