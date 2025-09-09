const { body, validationResult, param, query } = require("express-validator");

// Validation result handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors for better response
    const formattedErrors = {};
    errors.array().forEach((error) => {
      if (!formattedErrors[error.path]) {
        formattedErrors[error.path] = [];
      }
      formattedErrors[error.path].push(error.msg);
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }
  next();
};

// User Registration Validation Rules
const validateUserRegistration = [
  body("name")
    .isLength({ min: 20, max: 60 })
    .withMessage("Name must be between 20 and 60 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces")
    .trim(),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .toLowerCase(),

  body("password")
    .isLength({ min: 8, max: 16 })
    .withMessage("Password must be between 8 and 16 characters long")
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
    .withMessage(
      'Password must contain at least one uppercase letter and one special character (!@#$%^&*(),.?":{}|<>)'
    ),

  body("address")
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 400 })
    .withMessage("Address must not exceed 400 characters")
    .trim(),

  body("role")
    .optional()
    .isIn(["admin", "normal_user", "store_owner"])
    .withMessage("Role must be one of: admin, normal_user, store_owner"),

  handleValidationErrors,
];

// User Login Validation Rules
const validateUserLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .toLowerCase(),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

// Password Update Validation Rules
const validatePasswordUpdate = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 8, max: 16 })
    .withMessage("New password must be between 8 and 16 characters long")
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
    .withMessage(
      'New password must contain at least one uppercase letter and one special character (!@#$%^&*(),.?":{}|<>)'
    ),

  handleValidationErrors,
];

// User Creation/Update Validation (Admin)
const validateUserCreation = [
  body("name")
    .isLength({ min: 20, max: 60 })
    .withMessage("Name must be between 20 and 60 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces")
    .trim(),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .toLowerCase(),

  body("password")
    .isLength({ min: 8, max: 16 })
    .withMessage("Password must be between 8 and 16 characters long")
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
    .withMessage(
      "Password must contain at least one uppercase letter and one special character"
    ),

  body("address")
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 400 })
    .withMessage("Address must not exceed 400 characters")
    .trim(),

  body("role")
    .isIn(["admin", "normal_user", "store_owner"])
    .withMessage("Role must be one of: admin, normal_user, store_owner"),

  handleValidationErrors,
];

const validateUserUpdate = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("User ID must be a valid positive integer"),

  body("name")
    .optional()
    .isLength({ min: 20, max: 60 })
    .withMessage("Name must be between 20 and 60 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces")
    .trim(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .toLowerCase(),

  body("address")
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 400 })
    .withMessage("Address must not exceed 400 characters")
    .trim(),

  body("role")
    .optional()
    .isIn(["admin", "normal_user", "store_owner"])
    .withMessage("Role must be one of: admin, normal_user, store_owner"),

  handleValidationErrors,
];

// ID Parameter Validation
const validateIdParam = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID must be a valid positive integer"),

  handleValidationErrors,
];

// Query Parameter Validation
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

const validateStoreCreation = [
  // Debug middleware to see what we're receiving
  (req, res, next) => {
    console.log('🔍 DEBUG - Request body received:', req.body);
    console.log('🔍 DEBUG - Request headers:', req.headers);
    console.log('🔍 DEBUG - Content-Type:', req.headers['content-type']);
    next();
  },
  
  body('name')
    .exists()
    .withMessage('Name field is missing')
    .notEmpty()
    .withMessage('Store name cannot be empty')
    .isLength({ min: 1, max: 255 })
    .withMessage('Store name must be between 1-255 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),
  
  body('address')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Address must not exceed 1000 characters'),
  
  body('ownerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid owner ID is required'),

  // Validation result handler with detailed logging
  (req, res, next) => {
    const errors = validationResult(req);
    
    console.log('🔍 DEBUG - Validation errors:', errors.array());
    console.log('🔍 DEBUG - Processed body after validation:', req.body);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        debug: {
          receivedBody: req.body,
          contentType: req.headers['content-type']
        }
      });
    }
    next();
  }
];

const validateStoreUpdate = [
  // Debug middleware
  (req, res, next) => {
    console.log('🔍 DEBUG UPDATE - Request body:', req.body);
    console.log('🔍 DEBUG UPDATE - Params:', req.params);
    next();
  },
  
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid store ID is required'),
  
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Store name cannot be empty')
    .isLength({ min: 1, max: 255 })
    .withMessage('Store name must be between 1-255 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  
  body('address')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Address must not exceed 1000 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        debug: {
          receivedBody: req.body,
          params: req.params
        }
      });
    }
    next();
  }
];

const validateStoreSearch = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1-100'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1-100 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search parameters',
        errors: errors.array()
      });
    }
    next();
  }
];

const validateRatingSubmission = [
  body('storeId')
    .isInt({ min: 1 })
    .withMessage('Store ID must be a positive integer'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  
  body('review')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Review must be a string with maximum 1000 characters')
    .trim(),
  
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean value')
];

// Validate rating update
const validateRatingUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Rating ID must be a positive integer'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  
  body('review')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Review must be a string with maximum 1000 characters')
    .trim(),
  
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean value')
];

// Validate rating ID parameter
const validateRatingId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Rating ID must be a positive integer')
];

// Validate store ID parameter
const validateStoreId = [
  param('storeId')
    .isInt({ min: 1 })
    .withMessage('Store ID must be a positive integer')
];

// Validate user ID parameter
const validateUserId = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
];

// Validate rating query parameters
const validateRatingQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating filter must be between 1 and 5'),
  
  query('minRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Min rating must be between 1 and 5'),
  
  query('maxRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Max rating must be between 1 and 5'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'rating'])
    .withMessage('Sort by must be one of: createdAt, updatedAt, rating'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC'),
  
  query('hasReview')
    .optional()
    .isBoolean()
    .withMessage('hasReview must be a boolean value'),
  
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User ID filter must be a positive integer'),
  
  query('storeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Store ID filter must be a positive integer')
];

// Validate store rating query parameters
const validateStoreRatingQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating filter must be between 1 and 5'),
  
  query('minRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Min rating must be between 1 and 5'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'rating'])
    .withMessage('Sort by must be one of: createdAt, updatedAt, rating'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC'),
  
  query('hasReview')
    .optional()
    .isBoolean()
    .withMessage('hasReview must be a boolean value')
];

// Validate user rating query parameters
const validateUserRatingQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'rating'])
    .withMessage('Sort by must be one of: createdAt, updatedAt, rating'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC')
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordUpdate,
  // handleValidationErrors,
  validateStoreCreation,
  validateStoreUpdate,
  validateStoreSearch,validateRatingSubmission,
  validateRatingUpdate,
  validateRatingId,
  validateStoreId,
  validateUserId,
  validateRatingQuery,
  validateStoreRatingQuery,
  validateUserRatingQuery
};
