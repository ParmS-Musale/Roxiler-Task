import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Custom hook for API calls with loading states
const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const executeApi = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      
      if (response.data.success) {
        setData(response.data.data);
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.msg || 
                          err.message || 
                          'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, dependencies);

  const refetch = useCallback(() => {
    return executeApi();
  }, [executeApi]);

  return {
    data,
    loading,
    error,
    executeApi,
    refetch,
    setData,
    setError,
    setLoading
  };
};

// Hook for manual API calls (doesn't auto-execute)
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      
      if (response.data.success) {
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.msg || 
                          err.message || 
                          'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError
  };
};

// Hook for paginated API calls
export const usePaginatedApi = (apiFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 10, ...initialParams });

  const fetchData = useCallback(async (newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const finalParams = { ...params, ...newParams };
      const response = await apiFunction(finalParams);
      
      if (response.data.success) {
        setData(response.data.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
        setParams(finalParams);
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.msg || 
                          err.message || 
                          'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, params]);

  const goToPage = useCallback((page) => {
    fetchData({ page });
  }, [fetchData]);

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      goToPage(pagination.currentPage + 1);
    }
  }, [pagination, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrevPage) {
      goToPage(pagination.currentPage - 1);
    }
  }, [pagination, goToPage]);

  const updateParams = useCallback((newParams) => {
    fetchData({ ...newParams, page: 1 });
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData(params);
  }, [fetchData, params]);

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    params,
    fetchData,
    goToPage,
    nextPage,
    prevPage,
    updateParams,
    refetch
  };
};

export default useApi;