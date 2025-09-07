const { verifyToken } = require('../config/auth');
const { executeQuery } = require('../config/database');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token is missing.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database to ensure user still exists and is active
    const userQuery = `
      SELECT id, name, email, role, is_active 
      FROM users 
      WHERE id = ? AND is_active = TRUE
    `;
    
    const users = await executeQuery(userQuery, [decoded.id]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found or inactive.'
      });
    }

    // Add user info to request
    req.user = {
      id: users[0].id,
      name: users[0].name,
      email: users[0].email,
      role: users[0].role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Access denied.'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// Optional authentication (for routes that work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
        const decoded = verifyToken(token);
        
        const userQuery = `
          SELECT id, name, email, role, is_active 
          FROM users 
          WHERE id = ? AND is_active = TRUE
        `;
        
        const users = await executeQuery(userQuery, [decoded.id]);
        
        if (users.length > 0) {
          req.user = {
            id: users[0].id,
            name: users[0].name,
            email: users[0].email,
            role: users[0].role
          };
        }
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't return errors, just proceed without user
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};