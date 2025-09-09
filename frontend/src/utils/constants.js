// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STORE_OWNER: 'store_owner',
  USER: 'user'
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.STORE_OWNER]: 'Store Owner',
  [USER_ROLES.USER]: 'Customer'
};

// Routes
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  STORES: '/stores',
  STORE_DETAIL: '/stores/:id',
  FORGOT_PASSWORD: '/forgot-password',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',

  // Dashboard routes
  DASHBOARD: '/dashboard',
  
  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    STORES: '/admin/stores',
    RATINGS: '/admin/ratings',
    ANALYTICS: '/admin/analytics'
  },

  // Store Owner routes
  OWNER: {
    DASHBOARD: '/owner/dashboard',
    STORE: '/owner/store',
    RATINGS: '/owner/ratings',
    CUSTOMERS: '/owner/customers',
    ANALYTICS: '/owner/analytics'
  },

  // User routes
  USER: {
    DASHBOARD: '/user/dashboard',
    PROFILE: '/user/profile',
    RATINGS: '/user/ratings',
    STORES: '/user/stores'
  }
};

// Rating System
export const RATINGS = {
  MIN: 1,
  MAX: 5,
  LABELS: {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  },
  COLORS: {
    1: 'text-red-500',
    2: 'text-orange-500',
    3: 'text-yellow-500',
    4: 'text-green-500',
    5: 'text-green-600'
  },
  ICONS: {
    FILLED: '★',
    EMPTY: '☆'
  }
};

// Store Categories
export const STORE_CATEGORIES = [
  'Restaurant',
  'Grocery',
  'Electronics',
  'Clothing',
  'Books',
  'Sports',
  'Beauty',
  'Home & Garden',
  'Automotive',
  'Health & Pharmacy',
  'Toys & Games',
  'Pet Supplies',
  'Services',
  'Other'
];

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_PAGE_SIZE: 100
};

// Form Validation
export const VALIDATION = {
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 100,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 100,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s\-']+$/
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    PATTERN: /^[\d\s\-\(\)\+]+$/
  },
  ADDRESS: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 200
  },
  REVIEW: {
    MAX_LENGTH: 1000
  },
  STORE_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  },
  STORE_DESCRIPTION: {
    MAX_LENGTH: 500
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  PREFERENCES: 'user_preferences'
};

// Status Types
export const STATUS_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading'
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  TIMEOUT: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  LOGOUT: 'Successfully logged out!',
  REGISTER: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_UPDATED: 'Password updated successfully!',
  RATING_SUBMITTED: 'Rating submitted successfully!',
  RATING_UPDATED: 'Rating updated successfully!',
  RATING_DELETED: 'Rating deleted successfully!',
  STORE_CREATED: 'Store created successfully!',
  STORE_UPDATED: 'Store updated successfully!',
  STORE_DELETED: 'Store deleted successfully!'
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  ISO: 'yyyy-MM-dd',
  RELATIVE: 'relative' // for relative time like "2 hours ago"
};

// Theme Configuration
export const THEME = {
  PRIMARY_COLORS: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a'
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px'
  }
};

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILES: 5
};

// Search Configuration
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  MAX_RESULTS: 50
};

// Dashboard Cards
export const DASHBOARD_CARDS = {
  ADMIN: [
    { title: 'Total Users', key: 'totalUsers', color: 'blue' },
    { title: 'Total Stores', key: 'totalStores', color: 'green' },
    { title: 'Total Ratings', key: 'totalRatings', color: 'purple' },
    { title: 'Recent Activity', key: 'recentActivity', color: 'yellow' }
  ],
  STORE_OWNER: [
    { title: 'My Stores', key: 'myStores', color: 'blue' },
    { title: 'Total Ratings', key: 'totalRatings', color: 'green' },
    { title: 'Average Rating', key: 'averageRating', color: 'yellow' },
    { title: 'Recent Reviews', key: 'recentReviews', color: 'purple' }
  ],
  USER: [
    { title: 'My Ratings', key: 'myRatings', color: 'blue' },
    { title: 'Favorite Stores', key: 'favoriteStores', color: 'green' },
    { title: 'Recent Activity', key: 'recentActivity', color: 'purple' }
  ]
};

// Table Column Configurations
export const TABLE_COLUMNS = {
  USERS: [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'isActive', label: 'Status', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ],
  STORES: [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'ownerName', label: 'Owner', sortable: true },
    { key: 'averageRating', label: 'Rating', sortable: true },
    { key: 'totalRatings', label: 'Reviews', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ],
  RATINGS: [
    { key: 'rating', label: 'Rating', sortable: true },
    { key: 'storeName', label: 'Store', sortable: true },
    { key: 'userName', label: 'User', sortable: true },
    { key: 'review', label: 'Review', sortable: false },
    { key: 'createdAt', label: 'Date', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ]
};

export default {
  API_CONFIG,
  USER_ROLES,
  ROLE_LABELS,
  ROUTES,
  RATINGS,
  STORE_CATEGORIES,
  PAGINATION,
  VALIDATION,
  STORAGE_KEYS,
  STATUS_TYPES,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DATE_FORMATS,
  THEME,
  ANIMATION,
  FILE_UPLOAD,
  SEARCH,
  DASHBOARD_CARDS,
  TABLE_COLUMNS
};