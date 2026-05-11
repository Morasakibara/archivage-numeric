import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';

const loginSchema = z.object({
  identifiant: z.string().min(1, 'Identifiant requis'),
  motDePasse: z.string().min(1, 'Mot de passe requis'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">Archivage Élec</h1>
          <p className="text-gray-500">Connectez-vous à votre espace</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
            {(error as any)?.response?.data?.error?.message || 'Identifiants incorrects'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Identifiant"
            placeholder="votre_identifiant"
            {...register('identifiant')}
            error={errors.identifiant?.message}
          />
          
          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            {...register('motDePasse')}
            error={errors.motDePasse?.message}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Se connecter
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          © 2026 Entreprise d'Électricité - Système d'Archivage Numérique
        </div>
      </div>
    </div>
  );
}
