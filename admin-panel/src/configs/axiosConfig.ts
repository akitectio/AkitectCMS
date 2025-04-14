import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Check if the request is for the login endpoint
    const isLoginRequest = config.url?.includes('/auth/login');
    
    // Add token to authorization header for all requests except login
    if (token && config.headers && !isLoginRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(error?.message || 'Unknown error'));
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Handle the response data
    return response;
  },
  (error) => {
    // Handle unauthorized access (401)
    if (error.response && error.response.status === 401) {
      // Don't redirect if we're already on the login page
      if (!window.location.pathname.includes('/login')) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    // Handle other errors
    return Promise.reject(error instanceof Error ? error : new Error(error?.message || 'Unknown error'));
  }
);

export default axiosInstance;