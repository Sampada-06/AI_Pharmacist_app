import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth';
    }
};

export const userService = {
    getProfile: () => api.get('/profile'),
};

export const medicineService = {
    getAll: () => api.get('/medicines'),
    getLowStock: () => api.get('/medicines/low-stock'),
};

export default api;
