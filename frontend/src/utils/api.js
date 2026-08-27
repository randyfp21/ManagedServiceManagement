const API_BASE_URL = '/api';

export const getToken = () => localStorage.getItem('token');

export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const isViewerUser = () => {
  const user = getUser();
  if (!user || !user.role) return false;
  const role = user.role.toString().toLowerCase();
  return role === 'viewer' || role === 'viewonly' || role === 'guest';
};

export const setUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (response.status === 401) {
    // Unauthorized token expired
    if (!endpoint.includes('/auth/login')) {
      logout();
    }
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP ${response.status} Error`);
  }

  return data;
};
