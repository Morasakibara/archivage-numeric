import apiClient from './client';
import { ApiResponse } from '../types/api.types';

export interface Note {
  id: string;
  dossierId: string;
  contenu: string;
  auteurId: string;
  auteur: {
    nom: string;
    prenom: string;
  };
  creeLe: string;
}

export const notesApi = {
  findByDossier: async (dossierId: string) => {
    const response = await apiClient.get<ApiResponse<Note[]>>(`/dossiers/${dossierId}/notes`);
    return response.data;
  },
  create: async (dossierId: string, contenu: string) => {
    const response = await apiClient.post<ApiResponse<Note>>(`/dossiers/${dossierId}/notes`, { contenu });
    return response.data;
  },
};
