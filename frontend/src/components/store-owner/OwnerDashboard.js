import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storeOwnerAPI, ratingAPI } from '../../services/api';
import { usePaginatedApi } from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const OwnerDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await storeOwnerAPI.getDashboard();
      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Store Owner Dashboard
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user?.name}! Here's how your store is performing.
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={fetchDashboardData}
                className="btn btn-outline btn-sm mr-3"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <Link
                to="/owner/store/edit"
                className="btn btn-primary btn-sm"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Store
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage 
              message={error} 
              onRetry={fetchDashboardData}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Stats Overview */}
        {dashboardStats && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard
                title="Total Ratings"
                value={dashboardStats.totalRatings || 0}
                change={`+${dashboardStats.recentRatings || 0} this month`}
                changeType="positive"
                icon="star"
                color="yellow"
              />
              <StatCard
                title="Average Rating"
                value={dashboardStats.averageRating ? dashboardStats.averageRating.toFixed(1) : '0.0'}
                change="Overall rating"
                changeType="neutral"
                icon="chart"
                color="green"
              />
              <StatCard
                title="Total Reviews"
                value={dashboardStats.totalReviews || 0}
                change={`+${dashboardStats.recentReviews || 0} this month`}
                changeType="positive"
                icon="message"
                color="blue"
              />
              <StatCard
                title="Store Views"
                value={dashboardStats.storeViews || 0}
                change={`+${dashboardStats.recentViews || 0} this month`}
                changeType="positive"
                icon="eye"
                color="purple"
              />
            </div>

            {/* Rating Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Rating Distribution</h3>
                </div>
                <div className="card-body">
                  {dashboardStats.ratingDistribution ? (
                    <div className="space-y-4">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = dashboardStats.ratingDistribution[rating] || 0;
                        const percentage = dashboardStats.totalRatings ? 
                          ((count / dashboardStats.totalRatings) * 100).toFixed(1) : 0;
                        
                        return (
                          <div key={rating} className="flex items-center">
                            <div className="flex items-center w-20">
                              <span className="text-sm font-medium text-gray-900 mr-2">{rating}</span>
                              <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                            <div className="flex-1 mx-4">
                              <div className="bg-gray-200 rounded-full h-3">
                                <div
                                  className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">{percentage}%</span>
                              <span className="text-sm text-gray-500">({count})</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <p className="text-gray-500">No ratings yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Encourage customers to rate your store
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Recent Performance</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <PerformanceItem
                      icon="star"
                      title="New Ratings"
                      value={dashboardStats.recentRatings || 0}
                      subtitle="This month"
                      trend={dashboardStats.ratingTrend}
                    />
                    <PerformanceItem
                      icon="message"
                      title="New Reviews"
                      value={dashboardStats.recentReviews || 0}
                      subtitle="This month"
                      trend={dashboardStats.reviewTrend}
                    />
                    <PerformanceItem
                      icon="eye"
                      title="Store Views"
                      value={dashboardStats.recentViews || 0}
                      subtitle="This month"
                      trend={dashboardStats.viewTrend}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Store Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <StoreInfoCard store={dashboardStats.store} />
              </div>
              <div>
                <QuickActionsCard />
              </div>
            </div>
          </>
        )}

        {/* Recent Reviews */}
        <RecentReviewsTable />
      </div>
    </div>
  );
};

// Statistics Card Component
const StatCard = ({ title, value, change, changeType, icon, color }) => {
  const getIconComponent = (iconName) => {
    const iconProps = { className: "h-6 w-6" };
    
    switch (iconName) {
      case 'star':
        return (
          <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'message':
        return (
          <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'eye':
        return (
          <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-600';
      case 'green':
        return 'bg-green-50 text-green-600';
      case 'yellow':
        return 'bg-yellow-50 text-yellow-600';
      case 'purple':
        return 'bg-purple-50 text-purple-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getChangeColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-lg ${getColorClasses(color)}`}>
            {getIconComponent(icon)}
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-semibold text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
      <div className="mt-4">
        <div className={`text-sm ${getChangeColor(changeType)}`}>
          {change}
        </div>
      </div>
    </div>
  );
};

// Performance Item Component
const PerformanceItem = ({ icon, title, value, subtitle, trend }) => {
  const getTrendIcon = (trend) => {
    if (trend === 'up') {
      return (
        <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    } else if (trend === 'down') {
      return (
        <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="text-2xl mr-3">
          {icon === 'star' && '⭐'}
          {icon === 'message' && '💬'}
          {icon === 'eye' && '👁️'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-lg font-semibold text-gray-900">{value}</span>
        {getTrendIcon(trend)}
      </div>
    </div>
  );
};

// Store Info Card Component
const StoreInfoCard = ({ store }) => {
  if (!store) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Store Information</h3>
        </div>
        <div className="card-body">
          <div className="text-center py-6">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-500">No store found</p>
            <Link to="/owner/store/create" className="btn btn-primary btn-sm mt-4">
              Create Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Store Information</h3>
        <Link to="/owner/store/edit" className="btn btn-outline btn-sm">
          Edit Store
        </Link>
      </div>
      <div className="card-body">
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{store.name}</h4>
            <span className="badge badge-primary">{store.category}</span>
          </div>
          
          {store.description && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Description</h5>
              <p className="text-sm text-gray-600">{store.description}</p>
            </div>
          )}

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">Address</h5>
            <p className="text-sm text-gray-600">{store.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {store.phone && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Phone</h5>
                <p className="text-sm text-gray-600">{store.phone}</p>
              </div>
            )}
            
            {store.email && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Email</h5>
                <p className="text-sm text-gray-600">{store.email}</p>
              </div>
            )}
          </div>

          {store.website && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Website</h5>
              <a
                href={store.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {store.website}
              </a>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className={`badge ${store.isActive ? 'badge-success' : 'badge-danger'}`}>
              {store.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className="text-sm text-gray-500">
              Created {new Date(store.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Actions Card Component
const QuickActionsCard = () => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Quick Actions</h3>
      </div>
      <div className="card-body space-y-3">
        <Link
          to="/owner/ratings"
          className="btn btn-outline w-full justify-start"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          View All Ratings
        </Link>

        <Link
          to="/owner/analytics"
          className="btn btn-outline w-full justify-start"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Detailed Analytics
        </Link>

        <Link
          to="/owner/customers"
          className="btn btn-outline w-full justify-start"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          View Customers
        </Link>

        <Link
          to="/owner/store/edit"
          className="btn btn-outline w-full justify-start"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Store Info
        </Link>
      </div>
    </div>
  );
};

// Recent Reviews Table Component
const RecentReviewsTable = () => {
  const {
    data: reviews,
    loading,
    error
  } = usePaginatedApi(
    (params) => storeOwnerAPI.getRatings({ ...params, limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' })
  );

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Reviews</h3>
        </div>
        <div className="card-body">
          <Loading size="small" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Reviews</h3>
        </div>
        <div className="card-body">
          <ErrorMessage message={error} variant="danger" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="card-title">Recent Reviews</h3>
        <Link to="/owner/ratings" className="text-sm text-blue-600 hover:text-blue-800">
          View all →
        </Link>
      </div>
      <div className="card-body p-0">
        <div className="overflow-hidden">
          {reviews && reviews.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {review.isAnonymous ? '?' : (review.userName ? review.userName.charAt(0).toUpperCase() : 'U')}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {review.isAnonymous ? 'Anonymous' : review.userName}
                          </p>
                          <div className="flex items-center mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {review.review && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">{review.review}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500">No reviews yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Customer reviews will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;