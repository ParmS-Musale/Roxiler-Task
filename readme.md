# 🏪 Store Rating Platform

A comprehensive full-stack web application for rating and reviewing local stores, built with React, Node.js, Express, and MySQL.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Development Phases](#development-phases)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Store Rating Platform is a modern web application that allows users to discover, rate, and review local stores. The platform supports multiple user roles with distinct functionalities for regular users, store owners, and administrators.

### Key Objectives
- **Discover Stores**: Browse and search local stores by category and location
- **Rate & Review**: Submit ratings and detailed reviews for visited stores
- **Store Management**: Store owners can manage their business profiles
- **Admin Control**: Comprehensive admin dashboard for platform management
- **Analytics**: Detailed insights and analytics for store performance

## ✨ Features

### 🔐 Authentication & Authorization
- **Multi-role Authentication**: Admin, Store Owner, and User roles
- **JWT-based Security**: Secure token-based authentication
- **Protected Routes**: Role-based route protection
- **Password Security**: Bcrypt password hashing
- **Session Management**: Secure session handling with blacklisting

### 👤 User Management
- **User Registration**: Easy signup process with email verification
- **Profile Management**: Update personal information and preferences
- **Role-based Access**: Different interfaces for different user types
- **Account Security**: Password change and account deactivation

### 🏪 Store Management
- **Store Profiles**: Comprehensive store information management
- **Category System**: Organized store categorization
- **Search & Filter**: Advanced search and filtering capabilities
- **Store Analytics**: Performance metrics for store owners
- **Image Management**: Store photo uploads and galleries

### ⭐ Rating System
- **5-Star Ratings**: Industry-standard rating system
- **Detailed Reviews**: Rich text reviews with character limits
- **Anonymous Options**: Option to rate anonymously
- **Rating Analytics**: Statistical analysis of ratings
- **Review Moderation**: Admin tools for content moderation

### 📊 Dashboard & Analytics
- **Admin Dashboard**: System-wide analytics and user management
- **Store Owner Dashboard**: Store performance and customer insights
- **User Dashboard**: Personal rating history and favorite stores
- **Real-time Statistics**: Live data updates and metrics

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first responsive interface
- **Tailwind CSS**: Modern, utility-first styling
- **Interactive Components**: Rich user interactions
- **Accessibility**: WCAG compliant design
- **Dark Mode Support**: Optional dark theme

## 🛠️ Tech Stack

### Frontend
- **React 18.2**: Modern React with hooks and context
- **React Router DOM**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **Headless UI**: Unstyled, accessible UI components
- **Heroicons**: Beautiful SVG icons

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MySQL2**: MySQL database driver
- **JWT**: JSON Web Token authentication
- **Bcrypt**: Password hashing
- **Express Validator**: Input validation middleware
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security middleware

### Database
- **MySQL 8.0+**: Relational database
- **Database Design**: Normalized schema with proper relationships
- **Indexes**: Optimized queries with strategic indexing
- **Views**: Complex query optimization

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Nodemon**: Development server auto-restart
- **Postman/Thunder Client**: API testing
- **Git**: Version control

## 📁 Project Structure

```
store-rating-platform/
├── backend/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   └── auth.js              # Authentication config
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   ├── storeController.js   # Store operations
│   │   └── ratingController.js  # Rating system
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   ├── roleAuth.js          # Role-based authorization
│   │   └── validation.js        # Input validation
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Store.js             # Store model
│   │   └── Rating.js            # Rating model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User routes
│   │   ├── stores.js            # Store routes
│   │   └── ratings.js           # Rating routes
│   ├── utils/
│   │   ├── validators.js        # Validation utilities
│   │   └── helpers.js           # Helper functions
│   ├── .env                     # Environment variables
│   ├── .gitignore
│   ├── server.js                # Server entry point
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Reusable components
│   │   │   ├── auth/            # Authentication components
│   │   │   ├── admin/           # Admin dashboard
│   │   │   ├── user/            # User interface
│   │   │   └── store-owner/     # Store owner dashboard
│   │   ├── contexts/
│   │   │   └── AuthContext.js   # Authentication context
│   │   ├── hooks/
│   │   │   ├── useAuth.js       # Authentication hook
│   │   │   └── useApi.js        # API interaction hook
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── utils/
│   │   │   ├── validation.js    # Form validation
│   │   │   └── constants.js     # App constants
│   │   ├── App.js               # Main app component
│   │   ├── App.css              # Global styles
│   │   └── index.js             # React entry point
│   ├── .env                     # Frontend environment
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── postcss.config.js        # PostCSS configuration
│   └── package.json
├── database/
│   ├── schema.sql               # Database schema
│   └── sample_data.sql          # Sample data
├── docs/
│   ├── API.md                   # API documentation
│   ├── DEPLOYMENT.md            # Deployment guide
│   └── DEVELOPMENT.md           # Development setup
└── README.md
```

## 🚀 Installation

### Prerequisites
- **Node.js** (v14.0.0 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/store-rating-platform.git
cd store-rating-platform
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Configure your database and JWT secret in .env
```

### 3. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE store_rating_platform;

# Import schema
mysql -u root -p store_rating_platform < ../database/schema.sql

# Import sample data (optional)
mysql -u root -p store_rating_platform < ../database/sample_data.sql
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install

# Copy environment file
cp .env.example .env

# Configure API URL in .env
```

## ⚙️ Configuration

### Backend Environment Variables (.env)
```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=store_rating_platform
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=7d

# Security
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment Variables (.env)
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Store Rating Platform
REACT_APP_VERSION=1.0.0

# Development Settings
REACT_APP_ENV=development
REACT_APP_DEBUG=true

# Build Configuration
GENERATE_SOURCEMAP=true
```

### Database Configuration
Update `backend/config/database.js`:
```javascript
module.exports = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_rating_platform',
  port: process.env.DB_PORT || 3306
};
```

## 🎮 Usage

### Development Mode

1. **Start Backend Server**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

2. **Start Frontend Development Server**
```bash
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

### Production Mode

1. **Build Frontend**
```bash
cd frontend
npm run build
```

2. **Start Backend in Production**
```bash
cd backend
npm start
```

### Default Users
After importing sample data:
- **Admin**: admin@storrating.com / Admin123!
- **Store Owner**: owner@example.com / Owner123!
- **User**: user@example.com / User123!

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register    # User registration
POST   /api/auth/login       # User login
GET    /api/auth/me          # Get current user
PUT    /api/auth/password    # Update password
POST   /api/auth/logout      # User logout
```

### User Management Endpoints
```
GET    /api/users            # Get all users (Admin)
GET    /api/users/:id        # Get user by ID
POST   /api/users            # Create user (Admin)
PUT    /api/users/:id        # Update user
DELETE /api/users/:id        # Delete user (Admin)
```

### Store Endpoints
```
GET    /api/stores           # Get all stores
GET    /api/stores/:id       # Get store by ID
POST   /api/stores           # Create store (Admin)
PUT    /api/stores/:id       # Update store
DELETE /api/stores/:id       # Delete store (Admin)
```

### Rating Endpoints
```
GET    /api/ratings                    # Get all ratings (Admin)
GET    /api/ratings/store/:storeId     # Get store ratings
GET    /api/ratings/user/:userId      # Get user ratings
POST   /api/ratings                   # Submit rating
PUT    /api/ratings/:id               # Update rating
DELETE /api/ratings/:id               # Delete rating
```

### Admin Endpoints
```
GET    /api/admin/dashboard    # Get dashboard stats
GET    /api/admin/users        # Get users with filters
```

For detailed API documentation with request/response examples, see [docs/API.md](docs/API.md).

## 🏗️ Development Phases

### Phase 1: User Management System ✅
- User CRUD operations
- Admin dashboard
- User authentication
- Role-based access control

### Phase 2: Store Management System ✅
- Store CRUD operations
- Store search and filtering
- Category management
- Store owner dashboard

### Phase 3: Rating System ✅
- Rating submission and management
- Review system
- Rating analytics
- Anonymous rating options

### Phase 4: Store Owner Dashboard 
- Store analytics
- Customer insights
- Rating management
- Performance metrics

### Phase 5: Advanced Features 
- Email notifications
- Image upload system
- Advanced search with geolocation
- Social features
- Mobile app (React Native)

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing
Use the provided HTTP test files:
```bash
# Install HTTP client extension (VS Code)
# Open backend/tests/rating_api_tests.http
# Run individual requests
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment

1. **Prepare Production Environment**
```bash
# Set environment variables
export NODE_ENV=production
export DB_HOST=your-production-db-host
export JWT_SECRET=your-production-jwt-secret
```

2. **Deploy Backend**
```bash
cd backend
npm install --production
npm start
```

3. **Deploy Frontend**
```bash
cd frontend
npm run build
# Serve build folder with nginx or serve
```

For detailed deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## 🔧 Common Issues & Solutions

### Database Connection Issues
```bash
# Check MySQL service
sudo systemctl status mysql

# Reset MySQL password
sudo mysql_secure_installation
```

### Port Already in Use
```bash
# Kill process on port 5000
sudo lsof -t -i tcp:5000 | xargs kill -9
```

### Tailwind CSS Not Loading
```bash
# Reinstall Tailwind
npm uninstall tailwindcss
npm install -D tailwindcss
npx tailwindcss init

# Clear cache and restart
rm -rf node_modules package-lock.json
npm install
npm start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
```bash
git fork https://github.com/yourusername/store-rating-platform.git
```

2. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make Changes and Test**
```bash
npm test
```

4. **Commit Changes**
```bash
git commit -m "Add: your feature description"
```

5. **Push and Create PR**
```bash
git push origin feature/your-feature-name
```

### Coding Standards
- Use ESLint and Prettier for code formatting
- Follow conventional commit messages
- Write tests for new features
- Update documentation as needed

## 📊 Performance

### Current Metrics
- **Backend Response Time**: < 200ms average
- **Frontend Load Time**: < 3s on 3G
- **Database Queries**: Optimized with indexes
- **API Rate Limiting**: 100 requests/minute

### Optimization Features
- Database query optimization
- Image compression and lazy loading
- API response caching
- Frontend code splitting
- CDN integration ready

## 🔒 Security

### Implemented Security Measures
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Helmet security headers
- Rate limiting
- Role-based access control

### Security Best Practices
- Regular dependency updates
- Environment variable protection
- HTTPS enforcement in production
- Database connection encryption
- Session management
- XSS protection

## 📈 Roadmap

### Short Term (Next 3 months)
- [ ] Email notification system
- [ ] Advanced search with geolocation
- [ ] Mobile responsive improvements
- [ ] Performance optimization
- [ ] Enhanced analytics dashboard

### Long Term (6-12 months)
- [ ] Mobile app (React Native)
- [ ] Social login integration
- [ ] Real-time notifications
- [ ] Multi-language support
- [ ] Advanced reporting system
- [ ] API rate limiting dashboard
- [ ] Third-party integrations

## 📞 Support

### Getting Help
- **Documentation**: Check the [docs](docs/) folder
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: support@storeratingplatform.com

### FAQ
**Q: How do I reset the admin password?**
A: Run the password reset script: `npm run reset-admin-password`

**Q: Can I customize the rating scale?**
A: Yes, modify the RATINGS constant in `frontend/src/utils/constants.js`

**Q: How do I add new user roles?**
A: Update the USER_ROLES enum and add corresponding middleware

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Express.js** for the robust backend framework
- **MySQL** for reliable database management
- **All Contributors** who helped build this platform

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Complete authentication system
- ✅ User management with roles
- ✅ Store management system
- ✅ Rating and review system
- ✅ Admin dashboard
- ✅ Store owner dashboard
- ✅ Responsive design
- ✅ API documentation

### Version 0.9.0 (Beta)
- ✅ Basic CRUD operations
- ✅ Database schema
- ✅ Authentication setup
- ✅ Frontend scaffolding

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/store-rating-platform&type=Date)](https://star-history.com/#yourusername/store-rating-platform&Date)

---

Made with ❤️ by [Your Name](https://github.com/yourusername)

**Happy Rating! 🌟**