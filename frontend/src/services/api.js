import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

export const expenseAPI = {
  // Get all expenses with query filters (search, category, paymentMethod, startDate, endDate, sortBy, order)
  getAll: (params = {}) => apiClient.get('/expenses', { params }),

  // Get single expense by ID
  getById: (id) => apiClient.get(`/expenses/${id}`),

  // Create a new expense
  create: (data) => apiClient.post('/expenses', data),

  // Update existing expense
  update: (id, data) => apiClient.put(`/expenses/${id}`, data),

  // Delete an expense
  delete: (id) => apiClient.delete(`/expenses/${id}`),

  // Dashboard summary metrics
  getSummary: () => apiClient.get('/expenses/stats/summary'),

  // Detailed Analytics
  getAnalytics: (params = {}) => apiClient.get('/expenses/stats/analytics', { params }),

  // Seed sample records for evaluation/demo
  seedDemo: () => apiClient.post('/expenses/seed'),

  // System & Database info for Settings page
  getInfo: () => apiClient.get('/info')
};

export default apiClient;
