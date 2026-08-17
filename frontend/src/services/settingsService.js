import api from './api';

export const getSystemSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSystemSettings = async (data) => {
  const response = await api.put('/settings', data);
  return response.data;
};
