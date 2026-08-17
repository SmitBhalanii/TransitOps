import api from './api';

export const getDashboardStats = async (filters = {}) => {
  const response = await api.get('/dashboard', { params: filters });
  return response.data;
};
