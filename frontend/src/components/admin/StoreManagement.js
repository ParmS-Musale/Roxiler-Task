import React, { useState } from 'react';
import { storeAPI, userAPI } from '../../services/api';
import { usePaginatedApi, useApiCall } from '../../hooks/useApi';
import { validateStoreName, validateAddress, validateEmail, validatePhone, validateUrl } from '../../utils/validation';
import { STORE_CATEGORIES } from '../../utils/constants';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const StoreManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const {
    data: stores,
    pagination,
    loading,
    error,
    updateParams,
    refetch,
    goToPage
  } = usePaginatedApi(storeAPI.getStores, {
    page: 1,
    limit: 10,
    search: searchTerm,
    category: categoryFilter
  });

  const { execute: deleteStore, loading: deleteLoading } = useApiCall();

  const handleSearch = () => {
    updateParams({
      search: searchTerm,
      category: categoryFilter
    });
  };

  const handleDeleteStore = async (storeId) => {
    if (window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      const result = await deleteStore(storeAPI.deleteStore, storeId);
      if (result.success) {
        refetch();
      }
    }
  };

  const handleEditStore = (store) => {
    setSelectedStore(store);
    setShowEditModal(true);
  };

  const handleViewDetails = (store) => {
    setSelectedStore(store);
    setShowDetailsModal(true);
  };

  if (loading && !stores) {
    return <Loading message="Loading stores..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Store Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage all stores, their information, and status
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Store
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by store name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {STORE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="form-group flex items-end">
                <button
                  onClick={handleSearch}
                  className="btn btn-primary w-full"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage 
              message={error} 
              onRetry={refetch}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Stores Table */}
        <div className="card">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Store</th>
                    <th>Category</th>
                    <th>Owner</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stores && stores.length > 0 ? (
                    stores.map((store) => (
                      <tr key={store.id}>
                        <td>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{store.name}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {store.description || 'No description'}
                              </div>
                              <div className="text-xs text-gray-400">{store.address}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-primary">{store.category}</span>
                        </td>
                        <td>
                          <div className="text-sm text-gray-900">{store.ownerName || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{store.ownerEmail || ''}</div>
                        </td>
                        <td>
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= (store.averageRating || 0)
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-1 text-sm text-gray-600">
                              {store.averageRating ? store.averageRating.toFixed(1) : '0.0'}
                            </span>
                            <span className="ml-1 text-xs text-gray-400">
                              ({store.totalRatings || 0})
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${store.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {store.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-sm text-gray-500">
                          {new Date(store.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(store)}
                              className="btn btn-ghost btn-sm text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEditStore(store)}
                              className="btn btn-ghost btn-sm text-green-600 hover:text-green-800"
                              title="Edit Store"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteStore(store.id)}
                              className="btn btn-ghost btn-sm text-red-600 hover:text-red-800"
                              title="Delete Store"
                              disabled={deleteLoading}
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-gray-500">
                        No stores found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              <p>
                Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span>{' '}
                of <span className="font-medium">{pagination.totalItems}</span> results
              </p>
            </div>
            <div className="pagination-nav">
              <button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Create Store Modal */}
        {showCreateModal && (
          <CreateStoreModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              refetch();
            }}
          />
        )}

        {/* Edit Store Modal */}
        {showEditModal && selectedStore && (
          <EditStoreModal
            store={selectedStore}
            onClose={() => {
              setShowEditModal(false);
              setSelectedStore(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedStore(null);
              refetch();
            }}
          />
        )}

        {/* Store Details Modal */}
        {showDetailsModal && selectedStore && (
          <StoreDetailsModal
            store={selectedStore}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedStore(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Create Store Modal Component
const CreateStoreModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    ownerId: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [owners, setOwners] = useState([]);
  const { execute: createStore, loading } = useApiCall();

  // Fetch store owners
  React.useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await userAPI.getUsers({ role: 'store_owner', limit: 100 });
        if (response.data.success) {
          setOwners(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch store owners:', error);
      }
    };
    fetchOwners();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const nameValidation = validateStoreName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.message;
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    const addressValidation = validateAddress(formData.address);
    if (!addressValidation.isValid) {
      newErrors.address = addressValidation.message;
    }

    if (!formData.ownerId) {
      newErrors.ownerId = 'Store owner is required';
    }

    if (formData.email) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.message;
      }
    }

    if (formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.message;
      }
    }

    if (formData.website) {
      const urlValidation = validateUrl(formData.website);
      if (!urlValidation.isValid) {
        newErrors.website = urlValidation.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await createStore(storeAPI.createStore, formData);
    if (result.success) {
      onSuccess();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Store</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Store Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {STORE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="form-error">{errors.category}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-input"
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address *</label>
            <textarea
              name="address"
              className="form-input"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              required
            />
            {errors.address && <p className="form-error">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Website</label>
              <input
                type="url"
                name="website"
                className="form-input"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
              {errors.website && <p className="form-error">{errors.website}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Store Owner *</label>
              <select
                name="ownerId"
                className="form-input"
                value={formData.ownerId}
                onChange={handleChange}
                required
              >
                <option value="">Select Owner</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
              {errors.ownerId && <p className="form-error">{errors.ownerId}</p>}
            </div>
          </div>

          <div className="form-group">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active Store
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Store Modal Component
const EditStoreModal = ({ store, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: store.name || '',
    description: store.description || '',
    category: store.category || '',
    address: store.address || '',
    phone: store.phone || '',
    email: store.email || '',
    website: store.website || '',
    ownerId: store.ownerId || '',
    isActive: store.isActive !== undefined ? store.isActive : true
  });
  const [errors, setErrors] = useState({});
  const [owners, setOwners] = useState([]);
  const { execute: updateStore, loading } = useApiCall();

  // Fetch store owners
  React.useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await userAPI.getUsers({ role: 'store_owner', limit: 100 });
        if (response.data.success) {
          setOwners(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch store owners:', error);
      }
    };
    fetchOwners();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const nameValidation = validateStoreName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.message;
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    const addressValidation = validateAddress(formData.address);
    if (!addressValidation.isValid) {
      newErrors.address = addressValidation.message;
    }

    if (!formData.ownerId) {
      newErrors.ownerId = 'Store owner is required';
    }

    if (formData.email) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.message;
      }
    }

    if (formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.message;
      }
    }

    if (formData.website) {
      const urlValidation = validateUrl(formData.website);
      if (!urlValidation.isValid) {
        newErrors.website = urlValidation.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await updateStore(storeAPI.updateStore, store.id, formData);
    if (result.success) {
      onSuccess();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Edit Store</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Store Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {STORE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="form-error">{errors.category}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-input"
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address *</label>
            <textarea
              name="address"
              className="form-input"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              required
            />
            {errors.address && <p className="form-error">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Website</label>
              <input
                type="url"
                name="website"
                className="form-input"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
              {errors.website && <p className="form-error">{errors.website}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Store Owner *</label>
              <select
                name="ownerId"
                className="form-input"
                value={formData.ownerId}
                onChange={handleChange}
                required
              >
                <option value="">Select Owner</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
              {errors.ownerId && <p className="form-error">{errors.ownerId}</p>}
            </div>
          </div>

          <div className="form-group">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active Store
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Store Details Modal Component
const StoreDetailsModal = ({ store, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Store Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Basic Information</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Name:</span>
                  <p className="text-sm font-medium text-gray-900">{store.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Category:</span>
                  <p className="text-sm font-medium text-gray-900">{store.category}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className={`badge ${store.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {store.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Phone:</span>
                  <p className="text-sm font-medium text-gray-900">{store.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="text-sm font-medium text-gray-900">{store.email || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Website:</span>
                  {store.website ? (
                    <a
                      href={store.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {store.website}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">Not provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-700">
              {store.description || 'No description provided'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Address</h4>
            <p className="text-sm text-gray-700">{store.address}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Owner Information</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Name:</span> {store.ownerName || 'Unknown'}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Email:</span> {store.ownerEmail || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Rating Statistics</h4>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Average Rating:</span>{' '}
                  {store.averageRating ? store.averageRating.toFixed(1) : 'No ratings'}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Total Ratings:</span> {store.totalRatings || 0}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Dates</h4>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(store.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Updated:</span>{' '}
                  {new Date(store.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="btn btn-outline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreManagement;