import api from './api';

export const getFuelLogs = async (filters = {}) => {
  const response = await api.get('/fuel', { params: filters });
  return response.data;
};

export const createFuelLog = async (data) => {
  const response = await api.post('/fuel', data);
  return response.data;
};

export const deleteFuelLog = async (id) => {
  const response = await api.delete(`/fuel/${id}`);
  return response.data;
};
