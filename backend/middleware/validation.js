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
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Store name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Store name must be between 1-255 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Address must not exceed 1000 characters'),
  
  body('ownerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid owner ID is required'),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

const validateStoreUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid store ID is required'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Store name cannot be empty')
    .isLength({ min: 1, max: 255 })
    .withMessage('Store name must be between 1-255 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Address must not exceed 1000 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
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
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1-100 characters'),
  
  query('ownerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Owner ID must be a positive integer'),
  
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0-5'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'average_rating', 'total_ratings', 'created_at'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Sort order must be ASC or DESC'),

  // Validation result handler (optional for search since we can continue with invalid params)
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

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordUpdate,
  // handleValidationErrors,
  validateStoreCreation,
  validateStoreUpdate,
  validateStoreSearch
};
