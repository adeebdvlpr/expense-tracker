// import axios from 'axios';
// // import axios from 'axios';

// const BASE_URL = 'http://localhost:5001/api';
// const EXPENSES_URL = `${BASE_URL}/expenses`;
// const AUTH_URL = `${BASE_URL}/auth`;

// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });


// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers['x-auth-token'] = token;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // api.interceptors.request.use(config => {
// //   console.log('Making request to:', config.url, 'with data:', config.data);
// //   return config;
// // }, error => {
// //   console.error('Request error:', error);
// //   return Promise.reject(error);
// // });

// api.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response && error.response.status === 401) {
//       // Unauthorized, clear token and redirect to login
//       localStorage.removeItem('token');
//       window.location = '/auth';
//     }
//     return Promise.reject(error);
//   }
// );

// export const getExpenses = async () => {
//   try {
//     const response = await api.get(EXPENSES_URL);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching expenses:', error.response?.data || error.message);
//     throw error;
//   }
// };

// export const addExpense = async (expense) => {
//   try {
//     const response = await api.post(EXPENSES_URL, expense);
//     return response.data;
//   } catch (error) {
//     console.error('Error adding expense:', error.response?.data || error.message);
//     throw error;
//   }
// };


// export const deleteExpense = async (id) => {
//   try {
//     await api.delete(`${EXPENSES_URL}/${id}`);
//   } catch (error) {
//     console.error('Error deleting expense:', error.response?.data || error.message);
//     throw error;
//   }
// };

// // export const register = (userData) => api.post('/auth/register', userData);
// // export const login = (userData) => api.post('/auth/login', userData);
// export const register = (userData) => axios.post(`${AUTH_URL}/register`, userData);
// export const login = (userData) => axios.post(`${AUTH_URL}/login`, userData);


import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';
const EXPENSES_URL = `${BASE_URL}/expenses`;
const AUTH_URL = `${BASE_URL}/auth`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location = '/auth';
    }
    return Promise.reject(error);
  }
);

export const getExpenses = async () => {
  try {
    const response = await api.get(EXPENSES_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error.response?.data || error.message);
    throw error;
  }
};

export const addExpense = async (expense) => {
  try {
    const response = await api.post(EXPENSES_URL, expense);
    return response.data;
  } catch (error) {
    console.error('Error adding expense:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteExpense = async (id) => {
  try {
    await api.delete(`${EXPENSES_URL}/${id}`);
  } catch (error) {
    console.error('Error deleting expense:', error.response?.data || error.message);
    throw error;
  }
};

export const register = (userData) => api.post(`${AUTH_URL}/register`, userData);
export const login = (userData) => api.post(`${AUTH_URL}/login`, userData);

export default api;