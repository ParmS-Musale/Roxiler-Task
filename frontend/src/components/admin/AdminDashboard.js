import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, userAPI, storeAPI, ratingAPI } from '../../services/api';
import { usePaginatedApi } from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const AdminDashboard = () => {
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

      // Fetch dashboard statistics
      const response = await adminAPI.getDashboard();
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
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Admin Dashboard
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user?.name}! Here's what's happening on your platform.
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={fetchDashboardData}
                className="btn btn-outline btn-sm"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
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
                title="Total Users"
                value={dashboardStats.totalUsers || 0}
                change={`+${dashboardStats.recentUsers || 0} this month`}
                changeType="positive"
                icon="users"
                color="blue"
              />
              <StatCard
                title="Total Stores"
                value={dashboardStats.totalStores || 0}
                change={`+${dashboardStats.recentStores || 0} this month`}
                changeType="positive"
                icon="store"
                color="green"
              />
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
                change="Overall platform"
                changeType="neutral"
                icon="chart"
                color="purple"
              />
            </div>

            {/* User Role Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">User Distribution</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {dashboardStats.usersByRole && Object.entries(dashboardStats.usersByRole).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${getRoleColor(role)}`}></div>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {role.replace('_', ' ')}s
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Recent Activity</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <ActivityItem
                      type="user"
                      message="New users registered"
                      count={dashboardStats.recentUsers || 0}
                      time="This month"
                    />
                    <ActivityItem
                      type="store"
                      message="New stores added"
                      count={dashboardStats.recentStores || 0}
                      time="This month"
                    />
                    <ActivityItem
                      type="rating"
                      message="New ratings submitted"
                      count={dashboardStats.recentRatings || 0}
                      time="This month"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            title="Manage Users"
            description="View, create, edit, and delete user accounts"
            icon="users"
            link="/admin/users"
            color="blue"
          />
          <QuickActionCard
            title="Manage Stores"
            description="Oversee store listings and approvals"
            icon="store"
            link="/admin/stores"
            color="green"
          />
          <QuickActionCard
            title="View Ratings"
            description="Monitor and moderate ratings and reviews"
            icon="star"
            link="/admin/ratings"
            color="yellow"
          />
        </div>

        {/* Recent Users Table */}
        <RecentUsersTable />
      </div>
    </div>
  );
};

// Statistics Card Component
const StatCard = ({ title, value, change, changeType, icon, color }) => {
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'users':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case 'store':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'star':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'chart':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon, link, color }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'green':
        return 'bg-green-600 hover:bg-green-700';
      case 'yellow':
        return 'bg-yellow-600 hover:bg-yellow-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <div className="card hover-lift">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="mt-6">
        <Link
          to={link}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${getColorClasses(color)} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500 transition-colors`}
        >
          Manage
        </Link>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({ type, message, count, time }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'user':
        return '👤';
      case 'store':
        return '🏪';
      case 'rating':
        return '⭐';
      default:
        return '📊';
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-lg mr-3">{getIcon(type)}</span>
        <div>
          <p className="text-sm font-medium text-gray-900">{message}</p>
          <p className="text-sm text-gray-500">{time}</p>
        </div>
      </div>
      <span className="text-lg font-semibold text-gray-900">{count}</span>
    </div>
  );
};

// Recent Users Table Component
const RecentUsersTable = () => {
  const {
    data: users,
    loading,
    error
  } = usePaginatedApi(
    (params) => userAPI.getUsers({ ...params, limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' })
  );

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Users</h3>
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
          <h3 className="card-title">Recent Users</h3>
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
        <h3 className="card-title">Recent Users</h3>
        <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-800">
          View all →
        </Link>
      </div>
      <div className="card-body p-0">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'bg-red-400';
    case 'store_owner':
      return 'bg-blue-400';
    case 'user':
      return 'bg-green-400';
    default:
      return 'bg-gray-400';
  }
};

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'admin':
      return 'badge-danger';
    case 'store_owner':
      return 'badge-primary';
    case 'user':
      return 'badge-success';
    default:
      return 'badge-gray';
  }
};

export default AdminDashboard;