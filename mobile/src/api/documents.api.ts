import apiClient from './client';

export const documentsApi = {
  upload: async (dossierId: string, fileUri: string) => {
    const formData = new FormData();
    
    // Sur mobile, on crée l'objet file différemment
    const uriParts = fileUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('file', {
      uri: fileUri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    const response = await apiClient.post(`/dossiers/${dossierId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
