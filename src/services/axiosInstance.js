import axios from 'axios';

const axiosInstance = axios.create({
  
  baseURL: 'http://localhost:5000/api', // Replace with your backend API URL 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach the token if it exists
axiosInstance.interceptors.request.use(
  (config) => {
    // We will store the token in localStorage for now
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch global errors (like token expiration)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If the backend says the token is invalid, clear it and force a logout
      console.warn('Unauthorized. Token might be expired.');
      localStorage.removeItem('token');
      // In a full app, you might redirect to /login here
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;