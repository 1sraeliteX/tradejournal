const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  } catch {
    throw new Error('Network error — please check your connection and try again.');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned ${res.status} with no JSON body.`);
  }

  if (!res.ok) {
    const msg = data.error || 'Request failed';
    const detail = data.fields ? data.fields.join(', ') : '';
    throw new Error(detail ? `${msg}: ${detail}` : msg);
  }
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
    export: (params) => request(`/trades/export?${new URLSearchParams(params)}`),
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
