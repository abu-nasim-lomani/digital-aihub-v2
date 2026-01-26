import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle 401 Unauthorized
            if (error.response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                window.location.href = '/login';
            }

            // Return error message
            const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
            return Promise.reject(new Error(message));
        }

        return Promise.reject(error);
    }
);

export default api;

// API endpoints
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me')
};

export const projectsAPI = {
    getAll: () => api.get('/projects'),
    getById: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`)
};

export const initiativesAPI = {
    getAll: (params) => api.get('/initiatives', { params }),
    getById: (id) => api.get(`/initiatives/${id}`),
    create: (data) => api.post('/initiatives', data),
    update: (id, data) => api.put(`/initiatives/${id}`, data),
    delete: (id) => api.delete(`/initiatives/${id}`)
};

export const eventsAPI = {
    getAll: (params) => api.get('/events', { params }),
    getById: (id) => api.get(`/events/${id}`),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.put(`/events/${id}`, data),
    delete: (id) => api.delete(`/events/${id}`)
};

export const learningAPI = {
    getAll: () => api.get('/learning'),
    getById: (id) => api.get(`/learning/${id}`),
    create: (data) => api.post('/learning', data),
    update: (id, data) => api.put(`/learning/${id}`, data),
    delete: (id) => api.delete(`/learning/${id}`)
};

export const standardsAPI = {
    getAll: (params) => api.get('/standards', { params }),
    getById: (id) => api.get(`/standards/${id}`),
    create: (data) => api.post('/standards', data),
    update: (id, data) => api.put(`/standards/${id}`, data),
    delete: (id) => api.delete(`/standards/${id}`)
};

export const teamAPI = {
    getAll: (params) => api.get('/team', { params }),
    getById: (id) => api.get(`/team/${id}`),
    create: (data) => api.post('/team', data),
    update: (id, data) => api.put(`/team/${id}`, data),
    delete: (id) => api.delete(`/team/${id}`)
};

export const supportRequestsAPI = {
    getAll: () => api.get('/support-requests'),
    getById: (id) => api.get(`/support-requests/${id}`),
    create: (data) => api.post('/support-requests', data),
    update: (id, data) => api.put(`/support-requests/${id}`, data),
    updateStatus: (id, status) => api.patch(`/support-requests/${id}/status`, { status }),
    updateProgress: (id, progress, workUpdate) => api.patch(`/support-requests/${id}/progress`, { progress, workUpdate }),
    delete: (id) => api.delete(`/support-requests/${id}`)
};

// File upload helper
export const uploadFile = async (file, folder = 'uploads') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};
