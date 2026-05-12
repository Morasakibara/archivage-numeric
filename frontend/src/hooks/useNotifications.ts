import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { notificationsApi } from '../api/notifications.api';
import { useNotificationsStore } from '../store/notifications.store';

export function useNotifications() {
  const queryClient = useQueryClient();
  const setNotifications = useNotificationsStore((state) => state.setNotifications);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.findAll,
    refetchInterval: 30000, // Polling toutes les 30 secondes
  });

  useEffect(() => {
    if (data?.data) {
      setNotifications(data.data);
    }
  }, [data, setNotifications]);

  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return {
    notifications: data?.data || [],
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
  };
}
