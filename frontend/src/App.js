import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Star, Shield, Store, BarChart3, LogOut, Menu, X, Plus, Edit2, Trash2 } from 'lucide-react';
import './index.css';


// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API Service
const API_BASE_URL = 'http://localhost:5000/api';

const apiService = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  },

  // Auth endpoints
  login: (credentials) => apiService.request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  register: (userData) => apiService.request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  getProfile: () => apiService.request('/auth/me'),

  // Admin endpoints
  getDashboard: () => apiService.request('/admin/dashboard'),
  getUsers: (params = '') => apiService.request(`/admin/users${params}`),

  // Store endpoints
  getStores: (params = '') => apiService.request(`/stores${params}`),
  createStore: (storeData) => apiService.request('/stores', {
    method: 'POST',
    body: JSON.stringify(storeData),
  }),

  // Rating endpoints
  getStoreRatings: (storeId) => apiService.request(`/ratings/store/${storeId}`),
  createRating: (ratingData) => apiService.request('/ratings', {
    method: 'POST',
    body: JSON.stringify(ratingData),
  }),

  getUserRatings: (userId) => apiService.request(`/ratings/user/${userId}`),
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiService.getProfile()
        .then(response => setUser(response.data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await apiService.login(credentials);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response;
  };

  const register = async (userData) => {
    const response = await apiService.register(userData);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component
const LoginForm = ({ onToggle }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Store className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to Store Rating Platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button onClick={onToggle} className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Register Component
const RegisterForm = ({ onToggle }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-emerald-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <User className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join Store Rating Platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name (20+ characters)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="8-16 chars, 1 uppercase, 1 special char"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter your address (optional)"
              rows="3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button onClick={onToggle} className="text-emerald-600 hover:text-emerald-700 font-medium">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 rounded-lg p-2">
              <Store className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Store Rating Platform</h1>
              <p className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'Admin Panel' : user?.role === 'store_owner' ? 'Store Owner' : 'User Dashboard'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-1">
                {user?.role === 'admin' && <Shield className="w-4 h-4 text-indigo-600" />}
                {user?.role === 'store_owner' && <Store className="w-4 h-4 text-green-600" />}
                {user?.role === 'normal_user' && <User className="w-4 h-4 text-blue-600" />}
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={logout}
              className="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
                {user?.role === 'admin' && <Shield className="w-4 h-4 text-indigo-600" />}
                {user?.role === 'store_owner' && <Store className="w-4 h-4 text-green-600" />}
                {user?.role === 'normal_user' && <User className="w-4 h-4 text-blue-600" />}
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      apiService.getDashboard()
        .then(response => setDashboardData(response.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'admin' ? 'Manage your platform from here' : 
           user?.role === 'store_owner' ? 'Track your store performance' : 
           'Discover and rate amazing stores'}
        </p>
      </div>

      {user?.role === 'admin' && dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalUsers}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stores</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalStores}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Store className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalRatings}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.averageRatingAcrossStores}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user?.role === 'admin' && (
            <>
              <button className="flex items-center space-x-3 p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <User className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-600">Add, edit, or remove users</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Store className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Manage Stores</p>
                  <p className="text-sm text-gray-600">Add or edit store information</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">View Analytics</p>
                  <p className="text-sm text-gray-600">Platform statistics and reports</p>
                </div>
              </button>
            </>
          )}
          
          {user?.role === 'normal_user' && (
            <>
              <button className="flex items-center space-x-3 p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Store className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Browse Stores</p>
                  <p className="text-sm text-gray-600">Discover new places to visit</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Star className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Rate Stores</p>
                  <p className="text-sm text-gray-600">Share your experience</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">My Ratings</p>
                  <p className="text-sm text-gray-600">View your rating history</p>
                </div>
              </button>
            </>
          )}

          {user?.role === 'store_owner' && (
            <>
              <button className="flex items-center space-x-3 p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Store className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">My Store</p>
                  <p className="text-sm text-gray-600">View store details</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Star className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Customer Reviews</p>
                  <p className="text-sm text-gray-600">See what customers say</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Analytics</p>
                  <p className="text-sm text-gray-600">Track performance</p>
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <AuthProvider>
      <AuthGuard showLogin={showLogin} setShowLogin={setShowLogin} />
    </AuthProvider>
  );
};

const AuthGuard = ({ showLogin, setShowLogin }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <LoginForm onToggle={() => setShowLogin(false)} />
    ) : (
      <RegisterForm onToggle={() => setShowLogin(true)} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Dashboard />
    </div>
  );
};

export default App;