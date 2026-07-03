import axiosInstance from '../services/axiosInstance';

export const loginUser = async (credentials) => {
  // credentials = { email, password }
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data; // This will be your standardized { success, data, timestamp }
};

export const registerUser = async (userData) => {
  // userData = { name, email, password }
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

export const logoutUser = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};