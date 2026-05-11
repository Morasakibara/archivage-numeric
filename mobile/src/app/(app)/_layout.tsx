import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();

  // Si non connecté, rediriger vers login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Mes Dossiers' }} />
      <Stack.Screen name="nouveau" options={{ title: 'Nouveau Dossier' }} />
      <Stack.Screen name="dossier/[id]" options={{ title: 'Détail Dossier' }} />
    </Stack>
  );
}
