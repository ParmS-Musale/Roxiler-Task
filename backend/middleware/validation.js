const { body, validationResult, param, query } = require('express-validator');

// Validation result handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors for better response
    const formattedErrors = {};
    errors.array().forEach(error => {
      if (!formattedErrors[error.path]) {
        formattedErrors[error.path] = [];
      }
      formattedErrors[error.path].push(error.msg);
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  next();
};

// User Registration Validation Rules
const validateUserRegistration = [
  body('name')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters long')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces')
    .trim(),
    
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
    
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters long')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
    .withMessage('Password must contain at least one uppercase letter and one special character (!@#$%^&*(),.?":{}|<>)'),
    
  body('address')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters')
    .trim(),
    
  body('role')
    .optional()
    .isIn(['admin', 'normal_user', 'store_owner'])
    .withMessage('Role must be one of: admin, normal_user, store_owner'),
    
  handleValidationErrors
];

// User Login Validation Rules
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  handleValidationErrors
];

// Password Update Validation Rules
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be between 8 and 16 characters long')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
    .withMessage('New password must contain at least one uppercase letter and one special character (!@#$%^&*(),.?":{}|<>)'),
    
  handleValidationErrors
];

// Store Validation Rules
const validateStoreCreation = [
  body('name')
    .isLength({ min: 1, max: 255 })
    .withMessage('Store name is required and must not exceed 255 characters')
    .trim(),
    
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
    
  body('address')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters')
    .trim(),
    
  body('owner_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Owner ID must be a valid positive integer'),
    
  handleValidationErrors
];

const validateStoreUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Store ID must be a valid positive integer'),
    
  body('name')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Store name must not exceed 255 characters')
    .trim(),
    
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
    
  body('address')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters')
    .trim(),
    
  handleValidationErrors
];

// Rating Validation Rules
const validateRatingCreation = [
  body('store_id')
    .isInt({ min: 1 })
    .withMessage('Store ID is required and must be a valid positive integer'),
    
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
    
  body('comment')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters')
    .trim(),
    
  handleValidationErrors
];

const validateRatingUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Rating ID must be a valid positive integer'),
    
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
    
  body('comment')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters')
    .trim(),
    
  handleValidationErrors
];

// User Management Validation (Admin)
const validateUserCreation = [
  body('name')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters long')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces')
    .trim(),
    
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
    
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters long')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
    .withMessage('Password must contain at least one uppercase letter and one special character'),
    
  body('address')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters')
    .trim(),
    
  body('role')
    .isIn(['admin', 'normal_user', 'store_owner'])
    .withMessage('Role must be one of: admin, normal_user, store_owner'),
    
  handleValidationErrors
];

const validateUserUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a valid positive integer'),
    
  body('name')
    .optional()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters long')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces')
    .trim(),
    
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
    
  body('address')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters')
    .trim(),
    
  body('role')
    .optional()
    .isIn(['admin', 'normal_user', 'store_owner'])
    .withMessage('Role must be one of: admin, normal_user, store_owner'),
    
  handleValidationErrors
];

// Query Parameter Validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  handleValidationErrors
];

const validateSearch = [
  query('search')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Search term must be between 1 and 255 characters')
    .trim(),
    
  ...validatePagination
];

// ID Parameter Validation
const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a valid positive integer'),
    
  handleValidationErrors
];

module.exports = {
  // User validations
  validateUserRegistration,
  validateUserLogin,
  validatePasswordUpdate,
  validateUserCreation,
  validateUserUpdate,
  
  // Store validations
  validateStoreCreation,
  validateStoreUpdate,
  
  // Rating validations
  validateRatingCreation,
  validateRatingUpdate,
  
  // Query validations
  validatePagination,
  validateSearch,
  validateIdParam,
  
  // Utility
  handleValidationErrors
};