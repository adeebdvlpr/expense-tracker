import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

//create exported const for login
export const login = async (userData) => {
  const response = await api.post('/api/auth/login', userData);
  return response.data;
}; 

//create exported const for register
export const register = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

// export const getExpenses = () => api.get('/expenses');
// export const getExpenses = async () => {
//   try {
//     const response = await api.get('/api/expenses');
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching expenses:', error.response?.data || error.message);
//     throw error;
//   }
// };
export const getExpenses = async (params = {}) => {
  try {
    const response = await api.get('/api/expenses', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error.response?.data || error.message);
    throw error;
  }
};


export const addExpense = async (expense) => {
  const response = await api.post('/api/expenses', expense);
  return response.data;
};
export const deleteExpense = (id) => api.delete(`/api/expenses/${id}`);

///    ---------   user\account APIs ONLY below

export const getMe = async () => {
  const response = await api.get('/api/users/me');
  return response.data;
};

export const updateMe = async (updates) => {
  const response = await api.patch('/api/users/me', updates);
  return response.data;
};

/// --------- budgets APIs (v1)
export const getBudgets = async ({ period, includeSpent = true } = {}) => {
    const response = await api.get('/api/budgets', {
      params: { period, includeSpent },
    });
    return response.data;
  };
  
  // v1: POST is upsert by (period, category)
  export const upsertBudget = async (payload) => {
    const response = await api.post('/api/budgets', payload);
    return response.data;
  };
  
  export const deleteBudget = async (id) => {
    const response = await api.delete(`/api/budgets/${id}`);
    return response.data;
  };
    
    /// --------- goals APIs (v1)
   export const getGoals = async (params = {}) => {
     const response = await api.get('/api/goals', { params });
     return response.data;
    };
    
    export const createGoal = async (payload) => {
      const response = await api.post('/api/goals', payload);
      return response.data;
    };
    
    export const updateGoal = async (id, payload) => {
      const response = await api.patch(`/api/goals/${id}`, payload);
      return response.data;
    };
    
    export const deleteGoal = async (id) => {
      const response = await api.delete(`/api/goals/${id}`);
      return response.data;
    };


export default api; 