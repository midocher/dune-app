// src/services/api.js
import axios from 'axios';

// ⚠️ REMPLACEZ par votre vraie URL Render
const API_BASE_URL = 'https://dune-backend-iu8u.onrender.com/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dune-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ========== AUTH ==========
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  register: async (username, password, role) => {
    const response = await api.post('/auth/register', { username, password, role });
    return response.data;
  },
};

// ========== PROJECTS ==========
export const projectsAPI = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },
  
  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data.project;
  },
  
  update: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data.project;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

// ========== BLOCKS ==========
export const blocksAPI = {
  getByProject: async (projectId) => {
    const response = await api.get(`/blocks/project/${projectId}`);
    return response.data;
  },
  
  create: async (blockData) => {
    const response = await api.post('/blocks', blockData);
    return response.data;
  },
  
  update: async (id, blockData) => {
    const response = await api.put(`/blocks/${id}`, blockData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/blocks/${id}`);
    return response.data;
  },
};

// ========== LOTS ==========
export const lotsAPI = {
  getByProject: async (projectId) => {
    const response = await api.get(`/lots/project/${projectId}`);
    return response.data;
  },
  
  create: async (lotData) => {
    const response = await api.post('/lots', lotData);
    return response.data;
  },
  
  update: async (id, lotData) => {
    const response = await api.put(`/lots/${id}`, lotData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/lots/${id}`);
    return response.data;
  },
};

// ========== PLANS ==========
export const plansAPI = {
  getByProject: async (projectId) => {
    const response = await api.get(`/plans/project/${projectId}`);
    return response.data;
  },
  
  create: async (planData) => {
    const response = await api.post('/plans', planData);
    return response.data;
  },
  
  update: async (id, planData) => {
    const response = await api.put(`/plans/${id}`, planData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/plans/${id}`);
    return response.data;
  },
};

export default api;
