import apiClient from './client';

export const dossiersApi = {
  create: async (data: any) => {
    const response = await apiClient.post('/dossiers', data);
    return response.data;
  },
  search: async (params: any) => {
    const response = await apiClient.get('/dossiers', { params });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await apiClient.get(`/dossiers/${id}`);
    return response.data;
  },
};
