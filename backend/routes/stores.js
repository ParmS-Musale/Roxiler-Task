const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validateStoreCreation,
  validateStoreUpdate,
  validateStoreSearch
} = require('../middleware/validation');
const {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore
} = require('../controllers/storeController');

const router = express.Router();

// GET /api/stores - Get all stores with search/pagination (Public)
router.get('/', validateStoreSearch, getAllStores);

// GET /api/stores/:id - Get store details (Public)
router.get('/:id', getStoreById);

// POST /api/stores - Create store (Admin only)
router.post('/',createStore);

// PUT /api/stores/:id - Update store (Admin/Store Owner)
router.put('/:id', authenticate, authorize('admin', 'store_owner'), validateStoreUpdate, updateStore);

// DELETE /api/stores/:id - Delete store (Admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteStore);

module.exports = router;