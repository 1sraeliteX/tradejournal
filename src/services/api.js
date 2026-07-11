const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  auth: {
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },
  trades: {
    list: (query) => request(`/trades?${query}`),
    create: (body) => request('/trades', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/trades/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/trades/${id}`, { method: 'DELETE' }),
  },
  stats: {
    get: (query) => request(`/stats?${query}`),
    getAllTime: (accountId) => request(`/stats?all_time=1${accountId ? `&account_id=${accountId}` : ''}`),
    getYear: (year, accountId) => request(`/stats?year=${year}${accountId ? `&account_id=${accountId}` : ''}`),
  },
  settings: {
    get: () => request('/settings'),
    update: (body) => request('/settings', { method: 'PUT', body: JSON.stringify(body) }),
  },
  accounts: {
    list: () => request('/accounts'),
    create: (body) => request('/accounts', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/accounts/${id}`, { method: 'DELETE' }),
  },
};
