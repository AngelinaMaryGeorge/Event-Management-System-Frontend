import axiosInstance from '../services/axiosInstance';

export const getSystemReports = async () => {
  const response = await axiosInstance.get('/reports');
  return response.data;
};