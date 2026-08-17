import api from './api';

export const getMaintenanceLogs = async (filters = {}) => {
  const response = await api.get('/maintenance', { params: filters });
  return response.data;
};

export const createMaintenance = async (data) => {
  const response = await api.post('/maintenance', data);
  return response.data;
};

export const updateMaintenance = async (id, data) => {
  const response = await api.put(`/maintenance/${id}`, data);
  return response.data;
};

export const deleteMaintenance = async (id) => {
  const response = await api.delete(`/maintenance/${id}`);
  return response.data;
};
