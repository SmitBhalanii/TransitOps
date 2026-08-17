import api from './api';

export const getAnalyticsOverview = async () => {
  const response = await api.get('/reports/overview');
  return response.data;
};

export const getVehicleRoi = async () => {
  const response = await api.get('/reports/roi');
  return response.data;
};

export const getCostliestVehicles = async () => {
  const response = await api.get('/reports/costliest-vehicles');
  return response.data;
};
