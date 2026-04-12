import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send HttpOnly cookies on every request
});

// ── Auth-failure callback ───────────────────────────────────────────────────
// App.js registers () => setIsAuthenticated(false) here on mount so the
// interceptor can flip React state instead of doing a hard redirect.
let _onAuthFailure = null;
export function registerAuthFailureCallback(fn) {
  _onAuthFailure = fn;
}

function handleSessionExpired() {
  _onAuthFailure?.();
}

// ── Refresh-token logic ─────────────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue = []; // pending requests waiting for a new access token

function drainQueue(error) {
  refreshQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // The refresh endpoint itself returned 401 → session is truly dead
    if (original.url === '/api/auth/refresh') {
      drainQueue(error);
      handleSessionExpired();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        // Queue this request until the in-flight refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then(() => api(original))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        await api.post('/api/auth/refresh');
        drainQueue(null);
        return api(original);
      } catch (refreshError) {
        // drainQueue already called inside the /refresh branch above
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth ────────────────────────────────────────────────────────────────────
export const login = async (userData) => {
  const response = await api.post('/api/auth/login', userData);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

export const logout = async () => {
  await api.post('/api/auth/logout');
};

// ── Expenses ────────────────────────────────────────────────────────────────
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

// ── User / Account ──────────────────────────────────────────────────────────
export const getMe = async () => {
  const response = await api.get('/api/users/me');
  return response.data;
};

export const updateMe = async (updates) => {
  const response = await api.patch('/api/users/me', updates);
  return response.data;
};

// ── Budgets ─────────────────────────────────────────────────────────────────
export const getBudgets = async ({ period, includeSpent = true } = {}) => {
  const response = await api.get('/api/budgets', { params: { period, includeSpent } });
  return response.data;
};

export const upsertBudget = async (payload) => {
  const response = await api.post('/api/budgets', payload);
  return response.data;
};

export const deleteBudget = async (id) => {
  const response = await api.delete(`/api/budgets/${id}`);
  return response.data;
};

// ── Goals ───────────────────────────────────────────────────────────────────
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

// ── Income ──────────────────────────────────────────────────────────────────
export const getIncome = async () => {
  const response = await api.get('/api/income');
  return response.data;
};

export const addIncome = async (payload) => {
  const response = await api.post('/api/income', payload);
  return response.data;
};

export const deleteIncome = async (id) => {
  const response = await api.delete(`/api/income/${id}`);
  return response.data;
};

// ── Recurring Payments ──────────────────────────────────────────────────────
export const getRecurring = async () => {
  const response = await api.get('/api/recurring');
  return response.data;
};

export const createRecurring = async (payload) => {
  const response = await api.post('/api/recurring', payload);
  return response.data;
};

export const updateRecurring = async (id, payload) => {
  const response = await api.patch(`/api/recurring/${id}`, payload);
  return response.data;
};

export const deleteRecurring = async (id) => {
  const response = await api.delete(`/api/recurring/${id}`);
  return response.data;
};

export const triggerRecurring = async (id) => {
  const response = await api.post(`/api/recurring/${id}/trigger`);
  return response.data;
};

// ── Assets ──────────────────────────────────────────────────────────────────
export const getAssets = async () => {
  const response = await api.get('/api/assets');
  return response.data;
};

export const createAsset = async (payload) => {
  const response = await api.post('/api/assets', payload);
  return response.data;
};

export const updateAsset = async (id, payload) => {
  const response = await api.patch(`/api/assets/${id}`, payload);
  return response.data;
};

export const deleteAsset = async (id) => {
  const response = await api.delete(`/api/assets/${id}`);
  return response.data;
};

// ── Life Events ─────────────────────────────────────────────────────────────
export const getLifeEvents = async () => {
  const response = await api.get('/api/life-events');
  return response.data;
};

export const createLifeEvent = async (payload) => {
  const response = await api.post('/api/life-events', payload);
  return response.data;
};

export const updateLifeEvent = async (id, payload) => {
  const response = await api.patch(`/api/life-events/${id}`, payload);
  return response.data;
};

export const deleteLifeEvent = async (id) => {
  const response = await api.delete(`/api/life-events/${id}`);
  return response.data;
};

// ── Predictions ─────────────────────────────────────────────────────────────
export const predictions = {
  getAll:                () => api.get('/api/predictions'),
  generateForAsset:      (assetId) => api.post(`/api/predictions/asset/${assetId}`),
  generateForLifeEvent:  (eventId) => api.post(`/api/predictions/life-event/${eventId}`),
  delete:                (id) => api.delete(`/api/predictions/${id}`),
  globalAudit:           () => api.get('/api/predictions/global-audit'),
  advisorChat:           (question) => api.post('/api/predictions/advisor-chat', { question }),
};

// ── Notifications ───────────────────────────────────────────────────────────
export const getNotifications = async () => {
  const response = await api.get('/api/notifications');
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.patch(`/api/notifications/${id}`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.patch('/api/notifications/mark-all-read');
  return response.data;
};

export const dismissNotification = async (id) => {
  const response = await api.patch(`/api/notifications/${id}`, { dismissed: true });
  return response.data;
};

export const triggerChecklistNotifications = async () => {
  const response = await api.post('/api/notifications/checklist');
  return response.data;
};

export default api;
