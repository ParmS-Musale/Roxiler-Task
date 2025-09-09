const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 500]
    }
  },
  category: {
    type: DataTypes.ENUM(
      'Restaurant', 'Clothing', 'Electronics', 'Grocery', 'Pharmacy', 
      'Books', 'Sports', 'Beauty', 'Home & Garden', 'Automotive', 'Other'
    ),
    allowNull: false
  },
  address: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidAddress(value) {
        if (!value.street || !value.city || !value.state || !value.zipCode) {
          throw new Error('Complete address is required');
        }
      }
    }
  },
  location: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true
  },
  contact: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  operatingHours: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  averageRating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0.0,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['category'] },
    { fields: ['ownerId'] },
    { fields: ['averageRating'] },
    { fields: ['isActive'] }
  ]
});

// Associations
Store.associate = (models) => {
  Store.belongsTo(models.User, {
    foreignKey: 'ownerId',
    as: 'owner'
  });
  
  Store.hasMany(models.Rating, {
    foreignKey: 'storeId',
    as: 'ratings'
  });
};

module.exports = Store;