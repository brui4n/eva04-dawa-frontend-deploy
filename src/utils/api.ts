let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
if (rawApiUrl && !rawApiUrl.endsWith('/api') && !rawApiUrl.endsWith('/api/')) {
  rawApiUrl = `${rawApiUrl.replace(/\/$/, '')}/api`;
}
export const API_URL = rawApiUrl;

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('lms_token') || '';
  }

  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Important for cookies
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Ocurrió un error al procesar la solicitud.');
  }

  return data;
}
