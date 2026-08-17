import api from './api';

export const getExpenses = async (filters = {}) => {
  const response = await api.get('/expenses', { params: filters });
  return response.data;
};

export const createExpense = async (data) => {
  const response = await api.post('/expenses', data);
  return response.data;
};

export const getOperationalCost = async (filters = {}) => {
  const response = await api.get('/expenses/operational-cost', { params: filters });
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};
