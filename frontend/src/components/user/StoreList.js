import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { storeAPI } from '../../services/api';
import { usePaginatedApi } from '../../hooks/useApi';
import { STORE_CATEGORIES } from '../../utils/constants';
import useAuth from '../../hooks/useAuth';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const StoreList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { isAuthenticated, user } = useAuth();

  const {
    data: stores,
    pagination,
    loading,
    error,
    updateParams,
    goToPage
  } = usePaginatedApi(storeAPI.getStores, {
    page: 1,
    limit: 12,
    search: searchTerm,
    category: categoryFilter,
    sortBy: sortBy
  });

  const handleSearch = () => {
    updateParams({
      search: searchTerm,
      category: categoryFilter,
      sortBy: sortBy
    });
  };

  if (loading && !stores) {
    return <Loading message="Loading stores..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Discover Local Stores</h1>
          <p className="mt-2 text-lg text-gray-600">
            Find and rate the best stores in your area
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 form-group">
                <label className="form-label">Search Stores</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by name or description..."
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
          <ErrorMessage message={error} className="mb-6" />
        )}

        {/* Results Info */}
        {stores && (
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-600">
              {pagination?.totalItems || 0} stores found
            </p>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                className="text-sm border-gray-300 rounded-md"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="averageRating">Rating</option>
                <option value="createdAt">Newest</option>
              </select>
            </div>
          </div>
        )}

        {/* Store Grid */}
        {stores && stores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} isAuthenticated={isAuthenticated} user={user} />
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-12">
            <svg className="h-24 w-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <div className="pagination-nav">
              <button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="pagination-btn"
              >
                Previous
              </button>
              {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                const page = index + Math.max(1, pagination.currentPage - 2);
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`pagination-btn ${page === pagination.currentPage ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                );
              })}
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
      </div>
    </div>
  );
};

// Store Card Component
const StoreCard = ({ store, isAuthenticated, user }) => {
  const canRate = isAuthenticated && user?.role === 'user';

  return (
    <div className="card hover-lift">
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              <Link to={`/stores/${store.id}`} className="hover:text-primary-600">
                {store.name}
              </Link>
            </h3>
            <span className="badge badge-primary">{store.category}</span>
          </div>
          <div className="text-right">
            {store.averageRating ? (
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-900">
                  {store.averageRating.toFixed(1)}
                </span>
                <svg className="h-5 w-5 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            ) : (
              <span className="text-sm text-gray-500">No ratings</span>
            )}
            <div className="text-sm text-gray-500">
              {store.totalRatings || 0} review{store.totalRatings !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {store.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {store.description}
          </p>
        )}

        <div className="text-sm text-gray-500 mb-4">
          <p className="flex items-center">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {store.address}
          </p>
        </div>

        <div className="flex space-x-2">
          <Link
            to={`/stores/${store.id}`}
            className="btn btn-outline btn-sm flex-1"
          >
            View Details
          </Link>
          {canRate && (
            <Link
              to={`/user/rate/${store.id}`}
              className="btn btn-primary btn-sm flex-1"
            >
              Rate Store
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreList;