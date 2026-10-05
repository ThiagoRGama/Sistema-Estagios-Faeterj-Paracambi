import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD ? '/api/v1' : 'http://localhost:3000/api/v1'),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      if (typeof config.headers?.delete === 'function') {
        config.headers.delete('Content-Type');
        config.headers.delete('content-type');
      } else {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    } else {
      if (typeof config.headers?.set === 'function') {
        config.headers.set('Content-Type', 'application/json');
      } else {
        config.headers['Content-Type'] = 'application/json';
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url || '');
    const isPublicAuthRequest =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/recuperar-senha');

    if (status === 401 && !isPublicAuthRequest) {
      localStorage.removeItem('token');
      error.message = 'Sessao expirada. Faca login novamente.';
      window.location.href = '/login';
      return Promise.reject(error);
    }

    error.message =
      error.response?.data?.erro ||
      error.response?.data?.message ||
      error.message ||
      'Erro de comunicacao com o servidor.';

    return Promise.reject(error);
  }
);

export default api;
