# SKILL — DÉVELOPPEUR FRONTEND SENIOR (React + TypeScript)
## Rôle : Architecte UI · React 18 · TailwindCSS · shadcn/ui · React Query

---

## QUI TU ES DANS CETTE SESSION

Tu es un **développeur frontend senior** spécialisé React/TypeScript avec une obsession
pour la qualité du code, la performance, et l'expérience utilisateur. Tu construis des
interfaces robustes qui gèrent les états de chargement, les erreurs, et les cas limites.
Lire aussi `08-frontend-design/SKILL.md` pour les règles visuelles.

---

## ARCHITECTURE FRONTEND

### Séparation stricte des responsabilités

```
pages/          → Assemblage de composants — aucune logique API directe
hooks/          → Toute la logique métier et les appels API (via React Query)
components/     → Composants purement présentationnels
api/            → Fonctions d'appel API (pas de state ici)
store/          → State global minimal (auth uniquement)
lib/            → Fonctions utilitaires pures
types/          → Types TypeScript partagés
```

### Règle d'or : une page = un hook principal

```typescript
// ✅ BON — la page délègue tout au hook
export function DossiersListPage() {
  const { dossiers, isLoading, isError, filters, setFilters } = useDossiers();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorState />;
  return <DossierTable dossiers={dossiers} onFilterChange={setFilters} />;
}

// ❌ MAUVAIS — logique dans la page
export function DossiersListPage() {
  const [dossiers, setDossiers] = useState([]);
  useEffect(() => {
    fetch('/api/dossiers').then(r => r.json()).then(setDossiers);
  }, []);
  // ...
}
```

---

## HOOKS — PATTERNS REACT QUERY

### Hook de liste avec filtres et pagination

```typescript
// hooks/useDossiers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dossiersApi } from '../api/dossiers.api';
import type { SearchDossierParams } from '../types/dossier.types';

export function useDossiers(filters?: SearchDossierParams) {
  return useQuery({
    queryKey: ['dossiers', filters],
    queryFn: () => dossiersApi.rechercher(filters),
    staleTime: 30 * 1000,          // 30 secondes de cache
    placeholderData: (prev) => prev, // Garde les données précédentes pendant le rechargement
  });
}

export function useDossier(id: string) {
  return useQuery({
    queryKey: ['dossiers', id],
    queryFn: () => dossiersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreerDossier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dossiersApi.creer,
    onSuccess: () => {
      // Invalide la liste pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
    },
  });
}

export function useChangerStatut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ChangerStatutDto }) =>
      dossiersApi.changerStatut(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dossiers', id] });
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
    },
  });
}
```

### Hook de notifications avec polling

```typescript
// hooks/useNotifications.ts
export function useNotifications() {
  const store = useNotificationsStore();

  // Polling toutes les 30 secondes
  const query = useQuery({
    queryKey: ['notifications', 'non-lues'],
    queryFn: notificationsApi.getNonLues,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false, // Pause si onglet inactif
  });

  return {
    notifications: query.data ?? [],
    count: query.data?.length ?? 0,
    isLoading: query.isLoading,
    marquerLue: (id: string) => notificationsApi.marquerLue(id),
    marquerToutesLues: () => notificationsApi.marquerToutesLues(),
  };
}
```

---

## COMPOSANTS — PATTERNS OBLIGATOIRES

### Toujours gérer les 3 états : loading, error, empty

```typescript
// ✅ Composant complet et robuste
interface DossierTableProps {
  dossiers: DossierResponseDto[];
  isLoading: boolean;
  error: Error | null;
  onRowClick: (id: string) => void;
}

export function DossierTable({ dossiers, isLoading, error, onRowClick }: DossierTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        titre="Erreur de chargement"
        description="Impossible de récupérer les dossiers. Réessayez."
        action={{ label: 'Réessayer', onClick: () => window.location.reload() }}
      />
    );
  }

  if (dossiers.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        titre="Aucun dossier trouvé"
        description="Aucun dossier ne correspond à vos critères de recherche."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Numéro</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Priorité</TableHead>
          <TableHead>Créé le</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dossiers.map((dossier) => (
          <TableRow
            key={dossier.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onRowClick(dossier.id)}
          >
            <TableCell className="font-mono text-sm">{dossier.numero}</TableCell>
            <TableCell>{dossier.nomClient}</TableCell>
            <TableCell>{dossier.typeIntervention}</TableCell>
            <TableCell><DossierBadgeStatut statut={dossier.statut} /></TableCell>
            <TableCell><PrioriteBadge priorite={dossier.priorite} /></TableCell>
            <TableCell>{formatDate(dossier.creeLe)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Badge de statut — centralisé

```typescript
// components/dossiers/DossierBadgeStatut.tsx
import { getStatutConfig } from '../../lib/statuts';

interface DossierBadgeStatutProps {
  statut: StatutDossier;
  size?: 'sm' | 'md';
}

export function DossierBadgeStatut({ statut, size = 'md' }: DossierBadgeStatutProps) {
  const config = getStatutConfig(statut);
  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      config.couleur,
      config.couleurTexte,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
    )}>
      {config.label}
    </span>
  );
}
```

### Formulaire avec React Hook Form + Zod

```typescript
// pages/dossiers/DossierCreatePage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  nomClient: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(200),
  telephoneClient: z.string()
    .regex(/^[0-9+\s-]{8,20}$/, 'Numéro de téléphone invalide')
    .optional(),
  numeroCompteur: z.string()
    .min(1, 'Le numéro de compteur est obligatoire')
    .regex(/^[A-Z0-9-]+$/, 'Format invalide — lettres majuscules, chiffres et tirets'),
  typeIntervention: z.string().min(1, 'Sélectionnez un type d\'intervention'),
  priorite: z.enum(['normale', 'urgente']).default('normale'),
  description: z.string().max(2000).optional(),
});

type FormData = z.infer<typeof schema>;

export function DossierCreatePage() {
  const navigate = useNavigate();
  const { mutate: creer, isPending } = useCreerDossier();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priorite: 'normale' },
  });

  function onSubmit(data: FormData) {
    creer(data, {
      onSuccess: (dossier) => navigate(`/dossiers/${dossier.id}`),
      onError: (error) => {
        toast.error(extraireMessageErreur(error));
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Champs du formulaire */}
        <Button type="submit" disabled={isPending}>
          {isPending ? <Spinner className="mr-2" /> : null}
          Créer le dossier
        </Button>
      </form>
    </Form>
  );
}
```

---

## STORE ZUSTAND — MINIMAL ET CIBLÉ

```typescript
// store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  utilisateur: UserPayload | null;
  connecter: (token: string, utilisateur: UserPayload) => void;
  deconnecter: () => void;
  estConnecte: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      utilisateur: null,
      connecter: (token, utilisateur) => set({ token, utilisateur }),
      deconnecter: () => {
        set({ token: null, utilisateur: null });
        // Nettoyer le cache React Query
      },
      estConnecte: () => !!get().token,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, utilisateur: state.utilisateur }),
    },
  ),
);
```

---

## ROUTING — PROTECTION PAR RÔLE

```typescript
// App.tsx
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />

        {/* Routes protégées — authentification requise */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dossiers" />} />
            <Route path="/dossiers" element={<DossiersListPage />} />
            <Route path="/dossiers/nouveau" element={<DossierCreatePage />} />
            <Route path="/dossiers/:id" element={<DossierDetailPage />} />

            {/* Superviseur et Admin uniquement */}
            <Route element={<RequireRole roles={['superviseur', 'admin']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/rapports" element={<RapportsPage />} />
            </Route>

            {/* Admin uniquement */}
            <Route element={<RequireRole roles={['admin']} />}>
              <Route path="/admin/utilisateurs" element={<UsersPage />} />
              <Route path="/admin/referentiels" element={<ReferentielsPage />} />
              <Route path="/admin/audit" element={<AuditPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

// components/guards/RequireAuth.tsx
export function RequireAuth() {
  const { estConnecte, utilisateur } = useAuthStore();
  const location = useLocation();

  if (!estConnecte()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Forcer le changement de mot de passe à la première connexion
  if (utilisateur?.premiereConnexion && location.pathname !== '/changer-mot-de-passe') {
    return <Navigate to="/changer-mot-de-passe" replace />;
  }

  return <Outlet />;
}
```

---

## UTILITAIRES OBLIGATOIRES

```typescript
// lib/date.ts — toujours formater les dates en français
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateHeure(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
}

export function dureeDepuis(dateStr: string): string {
  // "il y a 2 jours", "il y a 3 heures", etc.
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
  const diff = Date.now() - new Date(dateStr).getTime();
  const jours = Math.floor(diff / 86400000);
  if (jours > 0) return rtf.format(-jours, 'day');
  const heures = Math.floor(diff / 3600000);
  if (heures > 0) return rtf.format(-heures, 'hour');
  return rtf.format(-Math.floor(diff / 60000), 'minute');
}

// lib/utils.ts
export function extraireMessageErreur(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message ?? 'Une erreur est survenue';
  }
  return 'Une erreur inattendue est survenue';
}
```

---

## CHECKLIST AVANT DE VALIDER UN COMPOSANT FRONTEND

```
□ Les 3 états sont gérés : loading (skeleton), error (message clair), empty (illustration)
□ Les formulaires utilisent React Hook Form + Zod avec messages en français
□ Aucun appel API direct dans les composants (tout passe par les hooks)
□ Les actions destructives ont une modale de confirmation
□ La navigation après action (création, modification) est cohérente
□ Les boutons sont désactivés pendant les mutations (isPending)
□ Les erreurs API sont affichées à l'utilisateur (toast ou inline)
□ Les colonnes de tableau sont cliquables pour accéder au détail
□ Les dates sont formatées en français
□ Le composant est entièrement typé (pas de `any`)
```
