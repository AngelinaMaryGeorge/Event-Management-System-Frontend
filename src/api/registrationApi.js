// src/api/registrationApi.js
import axiosInstance from '../services/axiosInstance';

export const registerForEvent = async (eventId) => {
  const response = await axiosInstance.post(`/registrations/${eventId}/register`);
  return response.data;
};

//Fetch all events the logged-in user has registered for
export const getMyEvents = async () => {
  const response = await axiosInstance.get('/registrations/my-events');
  return response.data;
};

// Cancel a registration
export const cancelRegistration = async (eventId) => {
  const response = await axiosInstance.delete(`/registrations/${eventId}/cancel`);
  return response.data;
};

// Mark participant attendance
export const markAttendance = async (registrationId) => {
  const response = await axiosInstance.patch(`/registrations/${registrationId}/attendance`);
  return response.data;
};

// Admin route to kick a user out of an event
export const removeParticipantAdmin = async (registrationId) => {
  const response = await axiosInstance.delete(`/registrations/admin/${registrationId}`);
  return response.data;
};