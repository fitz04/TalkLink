// API utility functions for TalkLink

const API_BASE = '/api';

export async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

export async function apiPost(endpoint, data = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

export async function apiPut(endpoint, data = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

export async function apiDelete(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

// Auth APIs
export const auth = {
  setup: (email, password, name, profile) =>
    apiPost('/auth/setup', { email, password, name, profile }),
  login: (email, password) =>
    apiPost('/auth/login', { email, password }),
  me: () => apiGet('/auth/me')
};

// Room APIs
export const rooms = {
  list: () => apiGet('/rooms'),
  create: (name) => apiPost('/rooms', { name }),
  get: (id) => apiGet(`/rooms/${id}`),
  delete: (id) => apiDelete(`/rooms/${id}`),
  getByInvite: (code) => apiGet(`/rooms/invite/${code}`),
  join: (id, nickname) => apiPost(`/rooms/${id}/join`, { nickname })
};

// Message APIs
export const messages = {
  getHistory: (roomId, limit = 100) =>
    apiGet(`/rooms/${roomId}/messages?limit=${limit}`)
};

// Translation APIs
export const translate = {
  text: (text, tone = 'professional') =>
    apiPost('/translate', { text, tone }),
  detect: (text) => apiPost('/translate/detect', { text })
};

// Email APIs
export const email = {
  polish: (text) => apiPost('/email/polish', { text }),
  summarize: (text) => apiPost('/email/summarize', { text }),
  getHistory: (limit = 20) => apiGet(`/email/history?limit=${limit}`)
};

// Proposal APIs
export const proposal = {
  generate: (roomIds, instructions, profile) =>
    apiPost('/proposal/generate', { room_ids: roomIds, instructions, profile }),
  getHistory: () => apiGet('/proposal/history')
};

// Settings APIs
export const settings = {
  getAll: () => apiGet('/settings'),
  set: (key, value) => apiPut('/settings', { key, value }),
  setApiKey: (provider, apiKey) => apiPut('/settings/api-key', { provider, apiKey }),
  getProfile: () => apiGet('/profile'),
  setProfile: (profile) => apiPut('/profile', { profile })
};

// Template APIs
export const templates = {
  list: () => apiGet('/templates'),
  create: (title, content, category) =>
    apiPost('/templates', { title, content, category }),
  update: (id, title, content, category) =>
    apiPut(`/templates/${id}`, { title, content, category }),
  delete: (id) => apiDelete(`/templates/${id}`)
};

// Assistant APIs
export const assistant = {
  analyze: (text, roomId) => apiPost('/assistant/analyze', { text, room_id: roomId }),
  search: (query, roomId) => apiPost('/assistant/search', { query, room_id: roomId })
};

// Integration APIs
export const integrations = {
  getDiscord: (roomId) => apiGet(`/integrations/${roomId}/integration`),
  updateDiscord: (roomId, { botToken, channelId, isActive }) =>
    apiPost(`/integrations/${roomId}/integration`, { botToken, channelId, isActive })
};
