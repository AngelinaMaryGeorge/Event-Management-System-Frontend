import axiosInstance from '../services/axiosInstance';

// Fetch all public events
export const getAllEvents = async () => {
  const response = await axiosInstance.get('/events');
  return response.data; 
};

// Fetch a single event by its ID
export const getEventById = async (id) => {
  const response = await axiosInstance.get(`/events/${id}`);
  return response.data;
};

// Create a new event (Handles image uploads)
export const createEvent = async (eventFormData) => {
  // When sending files, we MUST change the Content-Type header
  const response = await axiosInstance.post('/events', eventFormData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update an existing event (Handles image uploads)
export const updateEvent = async (id, eventFormData) => {
  const response = await axiosInstance.put(`/events/${id}`, eventFormData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete an event
export const deleteEvent = async (id) => {
  const response = await axiosInstance.delete(`/events/${id}`);
  return response.data;
};

// Fetch participants for a specific event
export const getEventParticipants = async (id) => {
  const response = await axiosInstance.get(`/events/${id}/participants`);
  return response.data;
};

// Fetch the pending approval queue (Super Admin Only)
export const getApprovalQueue = async () => {
  const response = await axiosInstance.get('/events/admin/queue');
  return response.data;
};

// Update event status (Approve/Reject)
export const updateEventStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/events/${id}/status`, { status });
  return response.data;
};