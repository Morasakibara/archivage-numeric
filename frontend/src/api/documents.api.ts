import apiClient from './client';
import { ApiResponse } from '../types/api.types';

export interface Document {
  id: string;
  dossierId: string;
  nomFichier: string;
  cheminStockage: string;
  tailleOctets: number;
  typeMime: string;
  ordre: number;
  valide: boolean;
  uploadeParId: string;
  uploadeLe: string;
}

export const documentsApi = {
  findByDossier: async (dossierId: string) => {
    const response = await apiClient.get<ApiResponse<Document[]>>(`/dossiers/${dossierId}/documents`);
    return response.data;
  },
  getPresignedUrl: async (documentId: string) => {
    const response = await apiClient.get<ApiResponse<string>>(`/documents/${documentId}/url`);
    return response.data;
  },
  upload: async (dossierId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<Document>>(`/dossiers/${dossierId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  invalidate: async (documentId: string) => {
    const response = await apiClient.patch<ApiResponse<Document>>(`/documents/${documentId}/invalider`);
    return response.data;
  },
};
