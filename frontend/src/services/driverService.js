import api from './api';

export const getDrivers = async (filters = {}) => {
  const response = await api.get('/drivers', { params: filters });
  return response.data;
};

export const getDriver = async (id) => {
  const response = await api.get(`/drivers/${id}`);
  return response.data;
};

export const createDriver = async (data) => {
  const response = await api.post('/drivers', data);
  return response.data;
};

export const updateDriver = async (id, data) => {
  const response = await api.put(`/drivers/${id}`, data);
  return response.data;
};

export const suspendDriver = async (id) => {
  const response = await api.put(`/drivers/${id}/suspend`);
  return response.data;
};

export const deleteDriver = async (id) => {
  const response = await api.delete(`/drivers/${id}`);
  return response.data;
};
