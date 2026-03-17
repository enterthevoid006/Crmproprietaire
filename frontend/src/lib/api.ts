import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Normalize errors + handle 401s
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        // 401 — force logout
        if (status === 401) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Normalize the error message — never expose raw backend internals
        const raw = error.response?.data?.message;
        let message: string;

        if (status >= 500 || !status) {
            // Server error or network failure — always generic
            message = 'Une erreur est survenue';
        } else if (status === 403) {
            message = 'Accès refusé';
        } else if (typeof raw === 'string' && raw.length > 0) {
            message = raw;
        } else if (Array.isArray(raw) && raw.length > 0) {
            message = raw[0];
        } else {
            message = 'Une erreur est survenue';
        }

        const normalized = new Error(message) as Error & { status: number; originalError: unknown };
        normalized.status = status;
        normalized.originalError = error;
        return Promise.reject(normalized);
    }
);

export default api;
