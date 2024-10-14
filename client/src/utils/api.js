import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('token');
      window.location = '/auth';
    }
    return Promise.reject(error);
  }
);


export const login = (userData) => api.post('/auth/login', userData);
export const register = (userData) => api.post('/auth/register', userData);
// export const getExpenses = () => api.get('/expenses');
export const getExpenses = async () => {
  try {
    const response = await api.get('/expenses');
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error.response?.data || error.message);
    throw error;
  }
};
// export const addExpense = (expense) => api.post('/expenses', expense);
export const addExpense = async (expense) => {
  try {
    const response = await api.post('/expenses', expense);
    return response.data;
  } catch (error) {
    console.error('Error adding expense:', error.response?.data || error.message);
    throw error;
  }
};
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

export default api;