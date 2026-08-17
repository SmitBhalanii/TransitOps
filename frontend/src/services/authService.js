import api from './api';

export const loginUser = async (email, password, role) => {
  const response = await api.post('/auth/login', { email, password, role });
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getMeUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
