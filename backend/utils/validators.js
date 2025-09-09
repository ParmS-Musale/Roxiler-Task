const bcrypt = require('bcryptjs');
const validator = require ("validator");
const { body, param, query, validationResult } = require('express-validator');

// Validation rules based on requirements
const validationRules = {
  name: {
    minLength: 20,
    maxLength: 60,
    pattern: /^[a-zA-Z\s]+$/
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    minLength: 8,
    maxLength: 16,
    pattern: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/
  },
  address: {
    maxLength: 400
  },
  rating: {
    min: 1,
    max: 5
  }
};

// Validate name
// const validateName = (name) => {
//   const errors = [];
  
//   if (!name || typeof name !== 'string') {
//     errors.push('Name is required');
//     return { isValid: false, errors };
//   }
  
//   const trimmedName = name.trim();
  
//   if (trimmedName.length < validationRules.name.minLength) {
//     errors.push(`Name must be at least ${validationRules.name.minLength} characters long`);
//   }
  
//   if (trimmedName.length > validationRules.name.maxLength) {
//     errors.push(`Name must be no more than ${validationRules.name.maxLength} characters long`);
//   }
  
//   if (!validationRules.name.pattern.test(trimmedName)) {
//     errors.push('Name can only contain letters and spaces');
//   }
  
//   return {
//     isValid: errors.length === 0,
//     errors,
//     sanitized: trimmedName
//   };
// };

// Validate email
const validateEmail = (email) => {
  const errors = [];
  
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  if (!validationRules.email.pattern.test(trimmedEmail)) {
    errors.push('Please provide a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: trimmedEmail
  };
};

// Validate password
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < validationRules.password.minLength) {
    errors.push(`Password must be at least ${validationRules.password.minLength} characters long`);
  }
  
  if (password.length > validationRules.password.maxLength) {
    errors.push(`Password must be no more than ${validationRules.password.maxLength} characters long`);
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate address
const validateAddress = (address) => {
  const errors = [];
  
  if (address !== null && address !== undefined) {
    if (typeof address !== 'string') {
      errors.push('Address must be a string');
      return { isValid: false, errors };
    }
    
    const trimmedAddress = address.trim();
    
    if (trimmedAddress.length > validationRules.address.maxLength) {
      errors.push(`Address must be no more than ${validationRules.address.maxLength} characters long`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: trimmedAddress || null
    };
  }
  
  return {
    isValid: true,
    errors: [],
    sanitized: null
  };
};

// Validate rating
const validateRating = (rating) => {
  const errors = [];
  
  if (rating === null || rating === undefined) {
    errors.push('Rating is required');
    return { isValid: false, errors };
  }
  
  const numRating = Number(rating);
  
  if (isNaN(numRating) || !Number.isInteger(numRating)) {
    errors.push('Rating must be a valid integer');
  } else if (numRating < validationRules.rating.min || numRating > validationRules.rating.max) {
    errors.push(`Rating must be between ${validationRules.rating.min} and ${validationRules.rating.max}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: numRating
  };
};

// Validate role
const validateRole = (role) => {
  const validRoles = ['admin', 'normal_user', 'store_owner'];
  const errors = [];
  
  if (!role) {
    return {
      isValid: true,
      errors: [],
      sanitized: 'normal_user' // default role
    };
  }
  
  if (!validRoles.includes(role)) {
    errors.push(`Role must be one of: ${validRoles.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: role
  };
};

// Hash password
const hashPassword = async (password) => {
  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Validate user registration data
const validateUserRegistration = async (userData) => {
  const { name, email, password, address, role } = userData;
  const errors = {};
  
  // Validate each field
  if (!validator.isLength(name,{min:20 , max:60})) {
    errors.name = "Name Validation Failed"
  }
  
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.errors;
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors;
  }
  
  const addressValidation = validateAddress(address);
  if (!addressValidation.isValid) {
    errors.address = addressValidation.errors;
  }
  
  const roleValidation = validateRole(role);
  if (!roleValidation.isValid) {
    errors.role = roleValidation.errors;
  }
  
  const isValid = Object.keys(errors).length === 0;
  
  let sanitizedData = null;
  if (isValid) {
    sanitizedData = {
      // name: nameValidation.sanitized,
      email: emailValidation.sanitized,
      address: addressValidation.sanitized,
      role: roleValidation.sanitized
    };
  }
  
  return {
    isValid,
    errors,
    sanitizedData
  };
};

const storeValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Store name is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Store name must be between 1-100 characters'),
    
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 1, max: 500 })
      .withMessage('Description must be between 1-500 characters'),
    
    body('category')
      .notEmpty()
      .withMessage('Category is required')
      .isIn([
        'Restaurant', 'Clothing', 'Electronics', 'Grocery', 'Pharmacy', 
        'Books', 'Sports', 'Beauty', 'Home & Garden', 'Automotive', 'Other'
      ])
      .withMessage('Invalid category'),
    
    body('address')
      .isObject()
      .withMessage('Address must be an object'),
    
    body('address.street')
      .trim()
      .notEmpty()
      .withMessage('Street address is required'),
    
    body('address.city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),
    
    body('address.state')
      .trim()
      .notEmpty()
      .withMessage('State is required'),
    
    body('address.zipCode')
      .trim()
      .notEmpty()
      .withMessage('Zip code is required')
      .matches(/^\d{5}(-\d{4})?$/)
      .withMessage('Invalid zip code format'),
    
    body('ownerId')
      .isInt({ min: 1 })
      .withMessage('Valid owner ID is required')
  ],

  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Valid store ID is required'),
    
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Store name cannot be empty')
      .isLength({ min: 1, max: 100 })
      .withMessage('Store name must be between 1-100 characters'),
    
    body('description')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Description cannot be empty')
      .isLength({ min: 1, max: 500 })
      .withMessage('Description must be between 1-500 characters')
  ]
};

module.exports = {
  // validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateRating,
  validateRole,
  hashPassword,
  comparePassword,
  validateUserRegistration,
  validationRules,
  storeValidation
};