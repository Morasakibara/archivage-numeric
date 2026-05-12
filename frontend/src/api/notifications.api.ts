import apiClient from './client';
import { ApiResponse } from '../types/api.types';

export interface Notification {
  id: string;
  destinataireId: string;
  dossierId?: string;
  type: string;
  message: string;
  lu: boolean;
  creeLe: string;
}

export const notificationsApi = {
  findAll: async () => {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications');
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await apiClient.patch(`/notifications/${id}/lire`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await apiClient.patch('/notifications/lire-tout');
    return response.data;
  },
};
