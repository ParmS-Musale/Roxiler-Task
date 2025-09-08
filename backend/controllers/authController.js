const { executeQuery } = require('../config/database');
const { generateToken } = require('../config/auth');
const bcrypt = require('bcryptjs');

// Hash password helper
const hashPassword = async (password) => {
  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
};

// Compare password helper
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

const register = async (req, res) => {
  try {
    // Validation is handled by middleware, so we can trust the data
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

    // Generate JWT token
    const token = generateToken({
      id: newUser[0].id,
      email: newUser[0].email,
      role: newUser[0].role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser[0],
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Validation is handled by middleware
    const { email, password } = req.body;

    // Find user by email
    const userQuery = `
      SELECT id, name, email, password_hash, address, role, is_active 
      FROM users 
      WHERE email = ?
    `;
    
    const users = await executeQuery(userQuery, [email]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Return user data (without password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // User is already available from auth middleware
    const userQuery = `
      SELECT id, name, email, address, role, created_at, updated_at
      FROM users 
      WHERE id = ? AND is_active = TRUE
    `;
    
    const users = await executeQuery(userQuery, [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: users[0]
      }
    });

  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    // Validation is handled by middleware
    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const userQuery = 'SELECT password_hash FROM users WHERE id = ?';
    const users = await executeQuery(userQuery, [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, users[0].password_hash);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const newHashedPassword = await hashPassword(newPassword);

    // Update password
    const updateQuery = 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await executeQuery(updateQuery, [newHashedPassword, req.user.id]);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Update password error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const logout = async (req, res) => {
  try {
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  logout
};