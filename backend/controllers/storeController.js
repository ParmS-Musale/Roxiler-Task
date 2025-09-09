const Store = require('../models/Store');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// GET /api/stores - Get all stores with search/pagination (Public)
const getAllStores = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      city = '',
      minRating = 0,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { isActive: true };

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search.toLowerCase()] } }
      ];
    }

    // Category filter
    if (category) {
      whereClause.category = category;
    }

    // City filter
    if (city) {
      whereClause['address.city'] = { [Op.iLike]: `%${city}%` };
    }

    // Rating filter
    if (minRating > 0) {
      whereClause.averageRating = { [Op.gte]: minRating };
    }

    // Valid sort fields
    const validSortFields = ['name', 'averageRating', 'totalRatings', 'createdAt'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const orderDirection = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    const { count, rows: stores } = await Store.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email']
      }],
      order: [[orderField, orderDirection]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        stores,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalStores: count,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stores',
      error: error.message
    });
  }
};

// GET /api/stores/:id - Get store details (Public)
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findOne({
      where: { id, isActive: true },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'createdAt']
      }]
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.json({
      success: true,
      data: store
    });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching store',
      error: error.message
    });
  }
};

// POST /api/stores - Create store (Admin only)
const createStore = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      category,
      address,
      location,
      contact,
      ownerId,
      images,
      operatingHours,
      tags
    } = req.body;

    // Verify owner exists and has appropriate role
    const owner = await User.findByPk(ownerId);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    if (!['admin', 'store_owner'].includes(owner.role)) {
      return res.status(400).json({
        success: false,
        message: 'User must be admin or store owner'
      });
    }

    const store = await Store.create({
      name,
      description,
      category,
      address,
      location,
      contact: contact || {},
      ownerId,
      images: images || [],
      operatingHours: operatingHours || {},
      tags: tags ? tags.map(tag => tag.toLowerCase()) : []
    });

    const newStore = await Store.findByPk(store.id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: newStore
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating store',
      error: error.message
    });
  }
};

// PUT /api/stores/:id - Update store (Admin/Owner)
const updateStore = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Check permissions: Admin or store owner
    if (userRole !== 'admin' && store.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this store'
      });
    }

    const {
      name,
      description,
      category,
      address,
      location,
      contact,
      images,
      operatingHours,
      tags,
      isActive
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (address !== undefined) updateData.address = address;
    if (location !== undefined) updateData.location = location;
    if (contact !== undefined) updateData.contact = contact;
    if (images !== undefined) updateData.images = images;
    if (operatingHours !== undefined) updateData.operatingHours = operatingHours;
    if (tags !== undefined) updateData.tags = tags.map(tag => tag.toLowerCase());
    if (isActive !== undefined && userRole === 'admin') updateData.isActive = isActive;

    await store.update(updateData);

    const updatedStore = await Store.findByPk(id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.json({
      success: true,
      message: 'Store updated successfully',
      data: updatedStore
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating store',
      error: error.message
    });
  }
};

// DELETE /api/stores/:id - Delete store (Admin only)
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Soft delete by setting isActive to false
    await store.update({ isActive: false });

    res.json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting store',
      error: error.message
    });
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore
};