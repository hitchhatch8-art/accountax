const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  data?: any;
}

async function fetchApi(endpoint: string, options: RequestOptions = {}) {
  const { data, headers: customHeaders, ...customOptions } = options;

  // Retrieve token from localStorage directly to avoid cyclical dependency with useStore
  // Zustnad Persist creates 'accountax-storage' in localStorage
  const storageData = localStorage.getItem('accountax-storage');
  let token = '';
  if (storageData) {
    try {
      const parsed = JSON.parse(storageData);
      token = parsed.state?.token || '';
    } catch {}
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    body: data ? JSON.stringify(data) : undefined,
    headers,
    ...customOptions,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Auto-logout on invalid/expired token
    if (response.status === 401) {
      console.warn('🔐 Token expired or invalid — logging out');
      localStorage.removeItem('accountax-storage');
      window.location.href = '/login';
      throw new Error('Session expirée — veuillez vous reconnecter / انتهت الجلسة — الرجاء إعادة تسجيل الدخول');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    // For DELETE actions that might not return a JSON body
    if (response.status === 204) {
        return null;
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  get: (endpoint: string, options?: RequestOptions) => fetchApi(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, data: any, options?: RequestOptions) => fetchApi(endpoint, { ...options, method: 'POST', data }),
  put: (endpoint: string, data: any, options?: RequestOptions) => fetchApi(endpoint, { ...options, method: 'PUT', data }),
  patch: (endpoint: string, data: any, options?: RequestOptions) => fetchApi(endpoint, { ...options, method: 'PATCH', data }),
  delete: (endpoint: string, options?: RequestOptions) => fetchApi(endpoint, { ...options, method: 'DELETE' }),
};
