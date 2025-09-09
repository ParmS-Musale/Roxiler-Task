const Store = require('../models/Store');
const User = require('../models/User');
const { validationResult } = require('express-validator');

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
    
    const filters = {
      search: search.trim(),
      category: category.trim(),
      city: city.trim(),
      minRating: parseFloat(minRating),
      sortBy,
      sortOrder,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    // Get stores and total count
    const [stores, totalCount] = await Promise.all([
      Store.findAll(filters),
      Store.count(filters)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        stores,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalStores: totalCount,
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

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid store ID is required'
      });
    }

    const store = await Store.findById(parseInt(id));

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
    const owner = await User.findById(ownerId);
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

    const storeData = {
      name: name.trim(),
      description: description.trim(),
      category,
      address,
      location,
      contact: contact || {},
      owner_id: ownerId,
      images: images || [],
      operating_hours: operatingHours || {},
      tags: tags ? tags.map(tag => tag.toLowerCase().trim()) : []
    };

    const storeId = await Store.create(storeData);
    const newStore = await Store.findById(storeId);

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

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid store ID is required'
      });
    }

    const store = await Store.findById(parseInt(id));
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Check permissions: Admin or store owner
    if (userRole !== 'admin' && store.owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this store'
      });
    }

    const {
      name,
      email,
      address,
      isActive
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email ? email.trim() : null;
    if (address !== undefined) updateData.address = address ? address.trim() : null;
    if (isActive !== undefined && userRole === 'admin') updateData.is_active = isActive;

    const updated = await Store.update(parseInt(id), updateData);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'No changes made to store'
      });
    }

    const updatedStore = await Store.findById(parseInt(id));

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

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid store ID is required'
      });
    }

    const store = await Store.findById(parseInt(id));
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Soft delete by setting is_active to false
    const deleted = await Store.delete(parseInt(id));
    
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Error deleting store'
      });
    }

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