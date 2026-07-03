// frontend/src/api/userApi.js
import axiosInstance from '../services/axiosInstance';

// Fetch the logged-in user's profile
export const getUserProfile = async () => {
  const response = await axiosInstance.get('/users/profile');
  return response.data;
};

// Update the user's profile information
export const updateUserProfile = async (profileData) => {
  const response = await axiosInstance.put('/users/profile', profileData);
  return response.data;
};

// Submit application to host events
export const submitOrganizerApplication = async () => {
  const response = await axiosInstance.post('/users/apply-organizer');
  return response.data;
};

// SUPER ADMIN: Fetch global records
export const getAdminUserList = async () => {
  const response = await axiosInstance.get('/users/admin/list');
  return response.data;
};

// SUPER ADMIN: Modify permissions (actionType: 'APPROVE' | 'REJECT' | 'DEMOTE')
export const executeRoleAction = async (targetUserId, actionType) => {
  const response = await axiosInstance.post('/users/admin/manage-role', { targetUserId, actionType });
  return response.data;
};

// SUPER ADMIN: Prune accounts
export const executeUserDeletion = async (userId) => {
  const response = await axiosInstance.delete(`/users/admin/user/${userId}`);
  return response.data;
};