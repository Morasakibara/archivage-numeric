import apiClient from './client';
import { ApiResponse } from '../types/api.types';
import { Dossier, DossierListItem } from '../types/dossier.types';

export const dossiersApi = {
  search: async (params: any) => {
    const response = await apiClient.get<ApiResponse<DossierListItem[]>>('/dossiers', {
      params,
    });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Dossier>>(`/dossiers/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post<ApiResponse<Dossier>>('/dossiers', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put<ApiResponse<Dossier>>(`/dossiers/${id}`, data);
    return response.data;
  },
};
