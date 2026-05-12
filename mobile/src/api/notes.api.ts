import apiClient from './client';

export const notesApi = {
  findByDossier: async (dossierId: string) => {
    const response = await apiClient.get(`/dossiers/${dossierId}/notes`);
    return response.data;
  },
  create: async (dossierId: string, contenu: string) => {
    const response = await apiClient.post(`/dossiers/${dossierId}/notes`, { contenu });
    return response.data;
  },
};
