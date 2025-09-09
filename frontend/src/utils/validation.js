// Email validation
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  if (email.length > 100) {
    return { isValid: false, message: 'Email must not exceed 100 characters' };
  }

  return { isValid: true, message: '' };
};

// Password validation
export const validatePassword = (password) => {
  if (!password || !password.trim()) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  return { isValid: true, message: '' };
};

// Name validation
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, message: 'Name is required' };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, message: 'Name must not exceed 50 characters' };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true, message: '' };
};

// Phone validation
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: true, message: '' }; // Optional field
  }

  const trimmedPhone = phone.trim();
  
  // Remove common formatting characters
  const cleanPhone = trimmedPhone.replace(/[\s\-\(\)\+]/g, '');
  
  // Check if it contains only digits after cleaning
  if (!/^\d+$/.test(cleanPhone)) {
    return { isValid: false, message: 'Phone number can only contain digits, spaces, hyphens, parentheses, and plus sign' };
  }

  // Check length (10-15 digits is reasonable for international numbers)
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return { isValid: false, message: 'Phone number must be between 10 and 15 digits' };
  }

  return { isValid: true, message: '' };
};

// Rating validation
export const validateRating = (rating) => {
  if (rating === null || rating === undefined || rating === '') {
    return { isValid: false, message: 'Rating is required' };
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating)) {
    return { isValid: false, message: 'Rating must be a number' };
  }

  if (!Number.isInteger(numericRating)) {
    return { isValid: false, message: 'Rating must be a whole number' };
  }

  if (numericRating < 1 || numericRating > 5) {
    return { isValid: false, message: 'Rating must be between 1 and 5' };
  }

  return { isValid: true, message: '' };
};

// Review validation
export const validateReview = (review) => {
  if (!review || !review.trim()) {
    return { isValid: true, message: '' }; // Optional field
  }

  const trimmedReview = review.trim();
  if (trimmedReview.length > 1000) {
    return { isValid: false, message: 'Review must not exceed 1000 characters' };
  }

  return { isValid: true, message: '' };
};

// Store name validation
export const validateStoreName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, message: 'Store name is required' };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    return { isValid: false, message: 'Store name must be at least 2 characters long' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, message: 'Store name must not exceed 100 characters' };
  }

  return { isValid: true, message: '' };
};

// Store description validation
export const validateStoreDescription = (description) => {
  if (!description || !description.trim()) {
    return { isValid: true, message: '' }; // Optional field
  }

  const trimmedDescription = description.trim();
  if (trimmedDescription.length > 500) {
    return { isValid: false, message: 'Store description must not exceed 500 characters' };
  }

  return { isValid: true, message: '' };
};

// Address validation
export const validateAddress = (address) => {
  if (!address || !address.trim()) {
    return { isValid: false, message: 'Address is required' };
  }

  const trimmedAddress = address.trim();
  if (trimmedAddress.length < 10) {
    return { isValid: false, message: 'Address must be at least 10 characters long' };
  }

  if (trimmedAddress.length > 200) {
    return { isValid: false, message: 'Address must not exceed 200 characters' };
  }

  return { isValid: true, message: '' };
};

// URL validation
export const validateUrl = (url) => {
  if (!url || !url.trim()) {
    return { isValid: true, message: '' }; // Optional field
  }

  const trimmedUrl = url.trim();
  try {
    new URL(trimmedUrl);
    return { isValid: true, message: '' };
  } catch {
    return { isValid: false, message: 'Please enter a valid URL' };
  }
};

// Generic required field validation
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true, message: '' };
};

// Generic length validation
export const validateLength = (value, minLength, maxLength, fieldName = 'Field') => {
  if (!value) {
    return { isValid: true, message: '' };
  }

  const stringValue = String(value).trim();
  
  if (minLength && stringValue.length < minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${minLength} characters long` };
  }

  if (maxLength && stringValue.length > maxLength) {
    return { isValid: false, message: `${fieldName} must not exceed ${maxLength} characters` };
  }

  return { isValid: true, message: '' };
};

// Password confirmation validation
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword || !confirmPassword.trim()) {
    return { isValid: false, message: 'Password confirmation is required' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }

  return { isValid: true, message: '' };
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};

  for (const [field, rules] of Object.entries(validationRules)) {
    for (const rule of rules) {
      const result = rule(formData[field], formData);
      if (!result.isValid) {
        errors[field] = result.message;
        break; // Stop at first error for this field
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sanitize input (remove potentially harmful characters)
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>&'"]/g, (char) => {
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&#x27;',
        '"': '&quot;'
      };
      return entities[char];
    });
};

// Check if string contains only alphanumeric characters
export const isAlphanumeric = (str) => {
  return /^[a-zA-Z0-9]+$/.test(str);
};

// Check if string contains only letters
export const isAlpha = (str) => {
  return /^[a-zA-Z]+$/.test(str);
};

// Check if string contains only numbers
export const isNumeric = (str) => {
  return /^[0-9]+$/.test(str);
};

// Format validation errors for display
export const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map(error => error.msg || error.message || error).join(', ');
  }
  
  if (typeof errors === 'object' && errors !== null) {
    return Object.values(errors).join(', ');
  }
  
  return String(errors);
};

export default {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateRating,
  validateReview,
  validateStoreName,
  validateStoreDescription,
  validateAddress,
  validateUrl,
  validateRequired,
  validateLength,
  validatePasswordConfirmation,
  validateForm,
  sanitizeInput,
  isAlphanumeric,
  isAlpha,
  isNumeric,
  formatValidationErrors
};