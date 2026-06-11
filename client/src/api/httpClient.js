const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Não foi possível concluir a requisição.');
  }
  return data;
}

export const httpClient = {
  get: path => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })
};
