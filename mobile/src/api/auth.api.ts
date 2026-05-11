import apiClient from './client';
import { AuthResponse } from '../types/user.types';

export const authApi = {
  login: async (identifiant: string, motDePasse: string) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      identifiant,
      motDePasse,
    });
    return response.data;
  },
};
