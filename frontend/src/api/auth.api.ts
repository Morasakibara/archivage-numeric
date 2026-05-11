import apiClient from './client';
import { AuthResponse, User } from '../types/user.types';
import { ApiResponse } from '../types/api.types';

export const authApi = {
  login: async (identifiant: string, motDePasse: string) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      identifiant,
      motDePasse,
    });
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
  changePassword: async (ancienMotDePasse: string, nouveauMotDePasse: string) => {
    const response = await apiClient.post('/auth/change-password', {
      ancienMotDePasse,
      nouveauMotDePasse,
    });
    return response.data;
  },
};
