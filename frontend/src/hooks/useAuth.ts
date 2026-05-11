import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();
  const { login, logout, user, isAuthenticated } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: ({ identifiant, motDePasse }: { identifiant: string; motDePasse: string }) =>
      authApi.login(identifiant, motDePasse),
    onSuccess: (data) => {
      login(data.user as any, data.access_token);
      navigate('/');
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
