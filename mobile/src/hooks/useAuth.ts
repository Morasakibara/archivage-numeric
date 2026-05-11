import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { useRouter } from 'expo-router';

export function useAuth() {
  const router = useRouter();
  const { login, logout, user, isAuthenticated } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: ({ identifiant, motDePasse }: { identifiant: string; motDePasse: string }) =>
      authApi.login(identifiant, motDePasse),
    onSuccess: (data) => {
      login(data.user, data.access_token);
      router.replace('/(app)');
    },
  });

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    user,
    isAuthenticated,
    logout,
  };
}
