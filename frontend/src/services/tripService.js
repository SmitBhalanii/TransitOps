import api from './api';

export const getTrips = async (filters = {}) => {
  const response = await api.get('/trips', { params: filters });
  return response.data;
};

export const createTrip = async (data) => {
  const response = await api.post('/trips', data);
  return response.data;
};

export const updateTrip = async (id, data) => {
  const response = await api.put(`/trips/${id}`, data);
  return response.data;
};

export const deleteTrip = async (id) => {
  const response = await api.delete(`/trips/${id}`);
  return response.data;
};

export const dispatchTrip = async (id) => {
  const response = await api.put(`/trips/${id}/dispatch`);
  return response.data;
};

export const completeTrip = async (id, completionData) => {
  const response = await api.put(`/trips/${id}/complete`, completionData);
  return response.data;
};

export const cancelTrip = async (id, cancellationData) => {
  const response = await api.put(`/trips/${id}/cancel`, cancellationData);
  return response.data;
};
