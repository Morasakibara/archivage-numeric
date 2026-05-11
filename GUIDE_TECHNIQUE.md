# GUIDE TECHNIQUE COMPLET — CLAUDE CODE
## Système d'archivage numérique · Entreprise d'électricité
**Ce document est le référentiel principal pour Claude Code. Lire intégralement avant toute action.**

---

## CONTEXTE ET CONTRAINTES ABSOLUES

```
Projet      : Application d'archivage numérique fullstack
Client      : Entreprise d'électricité (Cameroun)
Utilisateurs: 8 agents maximum
Hébergement : Serveur interne on-premise (Ubuntu Server 24.04 LTS)
Langue UI   : Français uniquement
Accès       : Web (navigateur) + Mobile (smartphone Android/iOS)
```

### Règles de développement non négociables
1. **TypeScript strict partout** — `"strict": true` dans tous les tsconfig
2. **Zéro suppression de données** — toujours archiver, jamais supprimer
3. **Audit trail sur toute action** — chaque écriture en base déclenche un log
4. **Validation double** — côté client (Zod) ET côté serveur (class-validator)
5. **Gestion d'erreur explicite** — pas de `any`, pas de `catch` vides
6. **Variables d'environnement** — zéro secret en dur dans le code
7. **Commentaires en français** — pour correspondre à la langue du client

---

## ORGANISATION GLOBALE DU PROJET

```
archivage-elec/
├── backend/                    # API NestJS
├── frontend/                   # App React web
├── mobile/                     # App React Native (Expo)
├── infrastructure/             # Docker, Nginx, scripts
├── database/                   # Migrations SQL, seeds
├── docs/                       # Documentation
│   ├── cahier-des-charges.md
│   └── guide-technique.md      # Ce fichier
└── docker-compose.yml          # Orchestration complète
```

---

## STRUCTURE DÉTAILLÉE — BACKEND (NestJS)

```
backend/
├── src/
│   ├── main.ts                             # Point d'entrée
│   ├── app.module.ts                       # Module racine
│   ├── app.controller.ts                   # Health check
│   │
│   ├── config/
│   │   ├── database.config.ts              # Config PostgreSQL
│   │   ├── redis.config.ts                 # Config Redis
│   │   ├── minio.config.ts                 # Config MinIO
│   │   ├── jwt.config.ts                   # Config JWT
│   │   └── app.config.ts                   # Config générale
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts   # @CurrentUser()
│   │   │   ├── roles.decorator.ts          # @Roles('admin')
│   │   │   └── public.decorator.ts         # @Public()
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts           # Vérifie JWT
│   │   │   └── roles.guard.ts              # Vérifie rôle
│   │   ├── interceptors/
│   │   │   ├── audit.interceptor.ts        # Log auto toute requête
│   │   │   └── transform.interceptor.ts    # Format réponse uniforme
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts    # Gestion erreurs globale
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts          # Validation DTO globale
│   │   ├── dto/
│   │   │   └── pagination.dto.ts           # Pagination générique
│   │   └── types/
│   │       ├── roles.enum.ts               # Enum rôles utilisateurs
│   │       └── statuts.enum.ts             # Enum statuts dossiers
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/                           # MODULE AUTHENTIFICATION
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── change-password.dto.ts
│   │   │
│   │   ├── users/                          # MODULE UTILISATEURS
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       ├── update-user.dto.ts
│   │   │       └── user-response.dto.ts
│   │   │
│   │   ├── dossiers/                       # MODULE DOSSIERS
│   │   │   ├── dossiers.module.ts
│   │   │   ├── dossiers.controller.ts
│   │   │   ├── dossiers.service.ts
│   │   │   ├── dossiers-numero.service.ts  # Génération ELC-AAAA-NNNNN
│   │   │   ├── entities/
│   │   │   │   └── dossier.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-dossier.dto.ts
│   │   │       ├── update-dossier.dto.ts
│   │   │       ├── search-dossier.dto.ts
│   │   │       └── dossier-response.dto.ts
│   │   │
│   │   ├── statuts/                        # MODULE WORKFLOW STATUTS
│   │   │   ├── statuts.module.ts
│   │   │   ├── statuts.controller.ts
│   │   │   ├── statuts.service.ts
│   │   │   ├── statuts-transitions.ts      # Matrice des transitions
│   │   │   ├── entities/
│   │   │   │   └── historique-statut.entity.ts
│   │   │   └── dto/
│   │   │       └── changer-statut.dto.ts
│   │   │
│   │   ├── documents/                      # MODULE DOCUMENTS/PHOTOS
│   │   │   ├── documents.module.ts
│   │   │   ├── documents.controller.ts
│   │   │   ├── documents.service.ts
│   │   │   ├── minio.service.ts            # Gestion stockage fichiers
│   │   │   ├── entities/
│   │   │   │   └── document.entity.ts
│   │   │   └── dto/
│   │   │       └── document-response.dto.ts
│   │   │
│   │   ├── notes/                          # MODULE NOTES
│   │   │   ├── notes.module.ts
│   │   │   ├── notes.controller.ts
│   │   │   ├── notes.service.ts
│   │   │   ├── entities/
│   │   │   │   └── note.entity.ts
│   │   │   └── dto/
│   │   │       └── create-note.dto.ts
│   │   │
│   │   ├── notifications/                  # MODULE NOTIFICATIONS
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── entities/
│   │   │   │   └── notification.entity.ts
│   │   │   └── dto/
│   │   │       └── notification-response.dto.ts
│   │   │
│   │   ├── audit/                          # MODULE AUDIT
│   │   │   ├── audit.module.ts
│   │   │   ├── audit.service.ts            # Écriture seule
│   │   │   ├── audit.controller.ts         # Lecture admin uniquement
│   │   │   └── entities/
│   │   │       └── audit-log.entity.ts
│   │   │
│   │   ├── dashboard/                      # MODULE TABLEAU DE BORD
│   │   │   ├── dashboard.module.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── dashboard.service.ts
│   │   │   └── dto/
│   │   │       └── stats-response.dto.ts
│   │   │
│   │   ├── rapports/                       # MODULE RAPPORTS
│   │   │   ├── rapports.module.ts
│   │   │   ├── rapports.controller.ts
│   │   │   ├── rapports.service.ts
│   │   │   └── dto/
│   │   │       └── rapport-params.dto.ts
│   │   │
│   │   └── referentiels/                   # MODULE LISTES CONFIGURABLES
│   │       ├── referentiels.module.ts
│   │       ├── referentiels.controller.ts
│   │       ├── referentiels.service.ts
│   │       └── entities/
│   │           └── type-intervention.entity.ts
│   │
│   └── database/
│       └── seeds/
│           ├── admin.seed.ts               # Compte admin initial
│           └── types-intervention.seed.ts  # Données de référence
│
├── test/
│   ├── auth.e2e-spec.ts
│   ├── dossiers.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env.example                            # Template variables d'env
├── .env                                    # Variables réelles (gitignored)
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

---

## STRUCTURE DÉTAILLÉE — FRONTEND WEB (React)

```
frontend/
├── src/
│   ├── main.tsx                            # Point d'entrée
│   ├── App.tsx                             # Router principal
│   │
│   ├── api/
│   │   ├── client.ts                       # Axios instance + interceptors
│   │   ├── auth.api.ts
│   │   ├── dossiers.api.ts
│   │   ├── documents.api.ts
│   │   ├── notes.api.ts
│   │   ├── notifications.api.ts
│   │   ├── dashboard.api.ts
│   │   ├── rapports.api.ts
│   │   └── users.api.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                      # Auth state + actions
│   │   ├── useDossiers.ts                  # React Query dossiers
│   │   ├── useDocuments.ts
│   │   ├── useNotifications.ts
│   │   └── useDashboard.ts
│   │
│   ├── store/
│   │   ├── auth.store.ts                   # Zustand auth
│   │   └── notifications.store.ts
│   │
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── dossier.types.ts
│   │   ├── document.types.ts
│   │   └── api.types.ts
│   │
│   ├── lib/
│   │   ├── utils.ts                        # Fonctions utilitaires
│   │   ├── date.ts                         # Formatage dates fr
│   │   ├── statuts.ts                      # Labels/couleurs statuts
│   │   └── validators.ts                   # Schémas Zod
│   │
│   ├── components/
│   │   ├── ui/                             # Composants shadcn/ui
│   │   ├── layout/
│   │   │   ├── AppShell.tsx               # Layout principal
│   │   │   ├── Sidebar.tsx                # Menu latéral
│   │   │   ├── Topbar.tsx                 # Barre du haut
│   │   │   └── NotificationsDrawer.tsx    # Panneau notifications
│   │   ├── dossiers/
│   │   │   ├── DossierCard.tsx            # Carte résumé dossier
│   │   │   ├── DossierTable.tsx           # Tableau liste
│   │   │   ├── DossierBadgeStatut.tsx     # Badge coloré statut
│   │   │   ├── DossierFilters.tsx         # Formulaire recherche
│   │   │   ├── DossierTimeline.tsx        # Historique visuel
│   │   │   └── DossierActions.tsx         # Boutons actions contextuelles
│   │   ├── documents/
│   │   │   ├── DocumentViewer.tsx         # Visionneuse photos
│   │   │   ├── DocumentUpload.tsx         # Zone upload
│   │   │   └── DocumentGrid.tsx           # Grille miniatures
│   │   ├── notes/
│   │   │   ├── NotesList.tsx              # Fil de notes
│   │   │   └── NoteForm.tsx               # Formulaire ajout note
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx             # Cartes chiffres clés
│   │   │   ├── DossiersParStatutChart.tsx # Graphique camembert
│   │   │   ├── VolumeChart.tsx            # Histogramme mensuel
│   │   │   └── DossiersEnRetard.tsx       # Liste alerte retards
│   │   └── shared/
│   │       ├── ConfirmDialog.tsx          # Modale confirmation
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   └── pages/
│       ├── auth/
│       │   ├── LoginPage.tsx
│       │   └── ChangePasswordPage.tsx
│       ├── dossiers/
│       │   ├── DossiersListPage.tsx        # Liste avec recherche
│       │   ├── DossierDetailPage.tsx       # Vue complète dossier
│       │   └── DossierCreatePage.tsx       # Formulaire création
│       ├── dashboard/
│       │   └── DashboardPage.tsx
│       ├── rapports/
│       │   └── RapportsPage.tsx
│       └── admin/
│           ├── UsersPage.tsx
│           ├── ReferentielsPage.tsx
│           └── AuditPage.tsx
│
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## STRUCTURE DÉTAILLÉE — MOBILE (React Native / Expo)

```
mobile/
├── src/
│   ├── app/                                # Expo Router (file-based routing)
│   │   ├── _layout.tsx                    # Layout racine
│   │   ├── (auth)/
│   │   │   └── login.tsx
│   │   └── (app)/
│   │       ├── _layout.tsx                # Tab bar
│   │       ├── index.tsx                  # Liste mes dossiers
│   │       ├── nouveau.tsx                # Créer un dossier
│   │       ├── dossier/
│   │       │   └── [id].tsx               # Détail dossier
│   │       └── notifications.tsx
│   │
│   ├── api/
│   │   ├── client.ts                      # Fetch API + auth headers
│   │   ├── auth.api.ts
│   │   ├── dossiers.api.ts
│   │   └── documents.api.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCamera.ts                   # Logique prise de vue
│   │   └── useUpload.ts                   # Upload avec progress
│   │
│   ├── store/
│   │   └── auth.store.ts                  # MMKV persistance token
│   │
│   ├── components/
│   │   ├── DossierCard.tsx
│   │   ├── StatutBadge.tsx
│   │   ├── PhotoCapture.tsx               # Composant caméra
│   │   ├── UploadProgress.tsx             # Barre progression
│   │   └── OfflineBanner.tsx              # Alerte si hors-ligne
│   │
│   ├── lib/
│   │   ├── image-compress.ts              # Compression avant upload
│   │   └── storage.ts                     # MMKV wrapper
│   │
│   └── types/
│       ├── dossier.types.ts
│       └── api.types.ts
│
├── assets/
├── app.json
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## STRUCTURE DÉTAILLÉE — INFRASTRUCTURE

```
infrastructure/
├── nginx/
│   ├── nginx.conf                          # Config principale
│   └── conf.d/
│       └── archivage.conf                  # Virtual host
│
├── postgres/
│   └── init.sql                            # Extensions et setup initial
│
├── minio/
│   └── setup.sh                            # Création buckets initiaux
│
└── scripts/
    ├── backup.sh                           # Script sauvegarde quotidienne
    ├── restore.sh                          # Script restauration
    └── health-check.sh                    # Vérification santé services
```

---

## STRUCTURE DÉTAILLÉE — DATABASE

```
database/
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_dossiers.sql
│   ├── 003_create_documents.sql
│   ├── 004_create_historique_statuts.sql
│   ├── 005_create_notes.sql
│   ├── 006_create_notifications.sql
│   ├── 007_create_audit_logs.sql
│   ├── 008_create_types_intervention.sql
│   └── 009_create_sessions.sql
│
└── seeds/
    ├── 001_types_intervention.sql          # Données initiales
    └── 002_admin_user.sql                  # Compte admin initial
```

---

## FICHIERS RACINE DU PROJET

```
archivage-elec/
├── docker-compose.yml                      # Tous les services
├── docker-compose.dev.yml                  # Surcharge développement
├── .env.example                            # Template global
├── .gitignore
├── README.md
└── Makefile                                # Commandes raccourcies
```

---

## CONTENU DES FICHIERS CLÉS

### `docker-compose.yml`

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: archivage_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: archivage_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  minio:
    image: minio/minio:latest
    container_name: archivage_minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: archivage_backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      minio:
        condition: service_started
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 8h
    ports:
      - "3000:3000"

  nginx:
    image: nginx:alpine
    container_name: archivage_nginx
    restart: unless-stopped
    depends_on:
      - backend
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./infrastructure/nginx/conf.d:/etc/nginx/conf.d
      - ./frontend/dist:/usr/share/nginx/html
    ports:
      - "80:80"
      - "443:443"

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

### `.env.example` (racine)

```env
# PostgreSQL
POSTGRES_DB=archivage_elec
POSTGRES_USER=archivage_user
POSTGRES_PASSWORD=CHANGEZ_MOI_DB

# Redis
REDIS_PASSWORD=CHANGEZ_MOI_REDIS

# MinIO
MINIO_ROOT_USER=minio_admin
MINIO_ROOT_PASSWORD=CHANGEZ_MOI_MINIO

# JWT — générer avec : openssl rand -base64 64
JWT_SECRET=CHANGEZ_MOI_JWT_SECRET_TRES_LONG

# App
APP_URL=http://localhost
API_URL=http://localhost/api
```

---

### `backend/src/common/types/roles.enum.ts`

```typescript
export enum Role {
  TERRAIN = 'terrain',
  BUREAU = 'bureau',
  SUPERVISEUR = 'superviseur',
  ADMIN = 'admin',
}
```

---

### `backend/src/common/types/statuts.enum.ts`

```typescript
export enum StatutDossier {
  NOUVEAU = 'nouveau',
  EN_INSTRUCTION = 'en_instruction',
  EN_ATTENTE_CLIENT = 'en_attente_client',
  EN_ATTENTE_VALIDATION = 'en_attente_validation',
  VALIDE = 'valide',
  REJETE = 'rejete',
  ARCHIVE = 'archive',
}
```

---

### `backend/src/modules/statuts/statuts-transitions.ts`

```typescript
import { Role } from '../../common/types/roles.enum';
import { StatutDossier } from '../../common/types/statuts.enum';

/**
 * Définit quelles transitions sont autorisées et par quel rôle.
 * Toute transition non listée ici est interdite.
 */
export const TRANSITIONS_AUTORISEES: Record<
  StatutDossier,
  { vers: StatutDossier[]; roles: Role[] }[]
> = {
  [StatutDossier.NOUVEAU]: [
    {
      vers: [StatutDossier.EN_INSTRUCTION],
      roles: [Role.BUREAU, Role.SUPERVISEUR, Role.ADMIN],
    },
  ],
  [StatutDossier.EN_INSTRUCTION]: [
    {
      vers: [StatutDossier.EN_ATTENTE_CLIENT, StatutDossier.EN_ATTENTE_VALIDATION],
      roles: [Role.BUREAU, Role.SUPERVISEUR, Role.ADMIN],
    },
  ],
  [StatutDossier.EN_ATTENTE_CLIENT]: [
    {
      vers: [StatutDossier.EN_INSTRUCTION],
      roles: [Role.BUREAU, Role.SUPERVISEUR, Role.ADMIN],
    },
  ],
  [StatutDossier.EN_ATTENTE_VALIDATION]: [
    {
      vers: [StatutDossier.VALIDE, StatutDossier.REJETE],
      roles: [Role.SUPERVISEUR, Role.ADMIN],
    },
  ],
  [StatutDossier.REJETE]: [
    {
      vers: [StatutDossier.EN_INSTRUCTION],
      roles: [Role.BUREAU, Role.SUPERVISEUR, Role.ADMIN],
    },
  ],
  [StatutDossier.VALIDE]: [
    {
      vers: [StatutDossier.ARCHIVE],
      roles: [Role.SUPERVISEUR, Role.ADMIN],
    },
  ],
  [StatutDossier.ARCHIVE]: [],  // Aucune transition depuis ARCHIVE — état final
};

export function transitionAutorisee(
  statutActuel: StatutDossier,
  statutCible: StatutDossier,
  roleUtilisateur: Role,
): boolean {
  const transitions = TRANSITIONS_AUTORISEES[statutActuel];
  return transitions.some(
    (t) => t.vers.includes(statutCible) && t.roles.includes(roleUtilisateur),
  );
}
```

---

### `backend/src/modules/dossiers/dossiers-numero.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dossier } from './entities/dossier.entity';

/**
 * Génère les numéros de dossier uniques au format ELC-AAAA-NNNNN.
 * Utilise une transaction pour éviter les doublons en cas de concurrence.
 */
@Injectable()
export class DossiersNumeroService {
  constructor(
    @InjectRepository(Dossier)
    private readonly dossierRepo: Repository<Dossier>,
  ) {}

  async genererNumero(): Promise<string> {
    const annee = new Date().getFullYear();
    const prefixe = `ELC-${annee}-`;

    // Récupère le dernier numéro de l'année en cours
    const dernier = await this.dossierRepo
      .createQueryBuilder('d')
      .where('d.numero LIKE :prefixe', { prefixe: `${prefixe}%` })
      .orderBy('d.numero', 'DESC')
      .getOne();

    let sequence = 1;
    if (dernier) {
      const dernierNum = parseInt(dernier.numero.split('-')[2], 10);
      sequence = dernierNum + 1;
    }

    // Padding à 5 chiffres : 00001, 00042, 12345
    return `${prefixe}${String(sequence).padStart(5, '0')}`;
  }
}
```

---

### `backend/src/common/interceptors/audit.interceptor.ts`

```typescript
import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';

/**
 * Intercepte toutes les requêtes en écriture (POST, PUT, PATCH, DELETE)
 * et enregistre l'action dans les logs d'audit.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const methode = req.method;

    // Seules les mutations sont auditées
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(methode)) {
      return next.handle();
    }

    const utilisateur = req.user;
    const route = req.route?.path || req.url;

    return next.handle().pipe(
      tap(() => {
        this.auditService.enregistrer({
          utilisateurId: utilisateur?.id,
          action: `${methode} ${route}`,
          ipAdresse: req.ip,
          details: { body: req.body },
        }).catch(() => {
          // Ne jamais faire échouer la requête à cause du log
        });
      }),
    );
  }
}
```

---

### `frontend/src/api/client.ts`

```typescript
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attache automatiquement le token JWT à chaque requête
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion globale des erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide — déconnexion automatique
      useAuthStore.getState().deconnecter();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
```

---

### `frontend/src/lib/statuts.ts`

```typescript
import { StatutDossier } from '../types/dossier.types';

/**
 * Labels et couleurs pour chaque statut.
 * Centraliser ici évite les incohérences visuelles dans les composants.
 */
export const STATUTS_CONFIG: Record<
  StatutDossier,
  { label: string; couleur: string; couleurTexte: string }
> = {
  nouveau: {
    label: 'Nouveau',
    couleur: 'bg-blue-100',
    couleurTexte: 'text-blue-800',
  },
  en_instruction: {
    label: 'En instruction',
    couleur: 'bg-yellow-100',
    couleurTexte: 'text-yellow-800',
  },
  en_attente_client: {
    label: 'En attente client',
    couleur: 'bg-orange-100',
    couleurTexte: 'text-orange-800',
  },
  en_attente_validation: {
    label: 'En attente validation',
    couleur: 'bg-purple-100',
    couleurTexte: 'text-purple-800',
  },
  valide: {
    label: 'Validé',
    couleur: 'bg-green-100',
    couleurTexte: 'text-green-800',
  },
  rejete: {
    label: 'Rejeté',
    couleur: 'bg-red-100',
    couleurTexte: 'text-red-800',
  },
  archive: {
    label: 'Archivé',
    couleur: 'bg-gray-100',
    couleurTexte: 'text-gray-600',
  },
};

export function getStatutConfig(statut: StatutDossier) {
  return STATUTS_CONFIG[statut];
}
```

---

### `mobile/src/lib/image-compress.ts`

```typescript
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Compresse une image avant upload.
 * Cible : qualité 80%, largeur max 1920px.
 * Retourne le chemin local du fichier compressé.
 */
export async function compresserImage(uriOriginal: string): Promise<string> {
  const resultat = await ImageManipulator.manipulateAsync(
    uriOriginal,
    [{ resize: { width: 1920 } }],   // Réduit si > 1920px
    {
      compress: 0.8,                  // 80% de qualité JPEG
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );
  return resultat.uri;
}
```

---

## PLAN D'EXÉCUTION PAR PHASE

---

### PHASE 1 — Fondations (Semaines 1–4)

**Objectif :** Infrastructure opérationnelle + authentification + CRUD dossiers de base.

#### Semaine 1 — Infrastructure et base de données

**Tâches dans l'ordre :**

1. Créer la structure de dossiers complète du projet
2. Rédiger `docker-compose.yml` avec PostgreSQL, Redis, MinIO, Nginx
3. Créer les fichiers `.env.example` et `.env`
4. Rédiger toutes les migrations SQL (`database/migrations/001` à `009`)
5. Lancer les conteneurs et vérifier que tout démarre
6. Vérifier que les migrations s'exécutent correctement
7. Rédiger les seeds (types d'intervention + compte admin initial)

**Commandes de vérification :**
```bash
docker-compose up -d
docker-compose ps                    # Tous HEALTHY
docker exec -it archivage_postgres psql -U archivage_user -d archivage_elec -c "\dt"
```

**Résultat attendu :** 9 tables créées, services actifs.

---

#### Semaine 2 — Backend : Auth + Users

**Initialisation du projet NestJS :**
```bash
npx @nestjs/cli new backend --package-manager npm
cd backend
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install @nestjs/config class-validator class-transformer
npm install ioredis minio uuid
npm install -D @types/bcrypt @types/passport-jwt @types/uuid
```

**Fichiers à créer dans l'ordre :**

1. `src/common/types/roles.enum.ts`
2. `src/common/types/statuts.enum.ts`
3. `src/config/database.config.ts`
4. `src/config/jwt.config.ts`
5. `src/modules/users/entities/user.entity.ts`
6. `src/modules/users/dto/create-user.dto.ts`
7. `src/modules/users/users.service.ts`
8. `src/modules/users/users.controller.ts`
9. `src/modules/users/users.module.ts`
10. `src/modules/auth/strategies/jwt.strategy.ts`
11. `src/modules/auth/dto/login.dto.ts`
12. `src/modules/auth/dto/change-password.dto.ts`
13. `src/modules/auth/auth.service.ts`
14. `src/modules/auth/auth.controller.ts`
15. `src/modules/auth/auth.module.ts`
16. `src/common/guards/jwt-auth.guard.ts`
17. `src/common/guards/roles.guard.ts`
18. `src/common/decorators/current-user.decorator.ts`
19. `src/common/decorators/roles.decorator.ts`
20. `src/common/decorators/public.decorator.ts`
21. `src/app.module.ts`
22. `src/main.ts`

**Endpoints à implémenter :**
```
POST   /api/auth/login                 → { token, user }
POST   /api/auth/logout                → 200 OK
POST   /api/auth/change-password       → 200 OK
GET    /api/auth/me                    → user courant

GET    /api/users                      → [users] (admin)
POST   /api/users                      → créer user (admin)
PUT    /api/users/:id                  → modifier user (admin)
PATCH  /api/users/:id/toggle-active    → activer/désactiver (admin)
```

---

#### Semaine 3 — Backend : Module Dossiers

**Fichiers à créer dans l'ordre :**

1. `src/modules/audit/entities/audit-log.entity.ts`
2. `src/modules/audit/audit.service.ts`
3. `src/modules/audit/audit.module.ts`
4. `src/common/interceptors/audit.interceptor.ts`
5. `src/common/interceptors/transform.interceptor.ts`
6. `src/common/filters/http-exception.filter.ts`
7. `src/modules/referentiels/entities/type-intervention.entity.ts`
8. `src/modules/referentiels/referentiels.service.ts`
9. `src/modules/referentiels/referentiels.controller.ts`
10. `src/modules/referentiels/referentiels.module.ts`
11. `src/modules/dossiers/entities/dossier.entity.ts`
12. `src/modules/dossiers/dto/create-dossier.dto.ts`
13. `src/modules/dossiers/dto/update-dossier.dto.ts`
14. `src/modules/dossiers/dto/search-dossier.dto.ts`
15. `src/modules/dossiers/dto/dossier-response.dto.ts`
16. `src/modules/dossiers/dossiers-numero.service.ts`
17. `src/modules/dossiers/dossiers.service.ts`
18. `src/modules/dossiers/dossiers.controller.ts`
19. `src/modules/dossiers/dossiers.module.ts`

**Endpoints à implémenter :**
```
GET    /api/dossiers                   → liste paginée + filtres
POST   /api/dossiers                   → créer dossier
GET    /api/dossiers/:id               → détail complet
PUT    /api/dossiers/:id               → modifier dossier
GET    /api/dossiers/numero/:numero    → chercher par numéro

GET    /api/referentiels/types         → types d'intervention actifs
POST   /api/referentiels/types         → ajouter type (admin)
```

**Logique de recherche — implémenter dans `dossiers.service.ts` :**
```typescript
// La recherche doit supporter ces paramètres combinables :
// - q : texte libre (nom client, numéro dossier, numéro compteur)
// - statut : enum StatutDossier
// - typeIntervention : string
// - priorite : 'normale' | 'urgente'
// - createurId : UUID
// - assigneId : UUID
// - dateDebut : Date
// - dateFin : Date
// - page : number (défaut 1)
// - limit : number (défaut 20, max 100)
```

---

#### Semaine 4 — Frontend Web : Base + Auth + Liste dossiers

**Initialisation :**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install axios @tanstack/react-query zustand
npm install react-router-dom react-hook-form zod @hookform/resolvers
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn-ui@latest init
```

**Fichiers à créer dans l'ordre :**

1. `src/types/user.types.ts`
2. `src/types/dossier.types.ts`
3. `src/types/api.types.ts`
4. `src/lib/utils.ts`
5. `src/lib/date.ts`
6. `src/lib/statuts.ts`
7. `src/lib/validators.ts`
8. `src/api/client.ts`
9. `src/api/auth.api.ts`
10. `src/api/dossiers.api.ts`
11. `src/store/auth.store.ts`
12. `src/hooks/useAuth.ts`
13. `src/hooks/useDossiers.ts`
14. `src/components/layout/AppShell.tsx`
15. `src/components/layout/Sidebar.tsx`
16. `src/components/layout/Topbar.tsx`
17. `src/components/shared/LoadingSpinner.tsx`
18. `src/components/shared/EmptyState.tsx`
19. `src/components/shared/ConfirmDialog.tsx`
20. `src/components/dossiers/DossierBadgeStatut.tsx`
21. `src/components/dossiers/DossierCard.tsx`
22. `src/components/dossiers/DossierTable.tsx`
23. `src/components/dossiers/DossierFilters.tsx`
24. `src/pages/auth/LoginPage.tsx`
25. `src/pages/auth/ChangePasswordPage.tsx`
26. `src/pages/dossiers/DossiersListPage.tsx`
27. `src/pages/dossiers/DossierCreatePage.tsx`
28. `src/App.tsx`
29. `src/main.tsx`

**Résultat Phase 1 :** Un agent peut se connecter, créer un dossier, et le voir dans la liste.

---

### PHASE 2 — Documents et Mobile (Semaines 5–8)

**Objectif :** Numérisation opérationnelle + application mobile fonctionnelle.

#### Semaine 5 — Backend : Module Documents

**Dépendances supplémentaires :**
```bash
cd backend
npm install @nestjs/serve-static multer minio
npm install -D @types/multer
```

**Fichiers à créer dans l'ordre :**

1. `src/config/minio.config.ts`
2. `src/modules/documents/minio.service.ts`
3. `src/modules/documents/entities/document.entity.ts`
4. `src/modules/documents/dto/document-response.dto.ts`
5. `src/modules/documents/documents.service.ts`
6. `src/modules/documents/documents.controller.ts`
7. `src/modules/documents/documents.module.ts`

**Endpoints à implémenter :**
```
POST   /api/dossiers/:id/documents     → upload photo (multipart/form-data)
GET    /api/dossiers/:id/documents     → liste documents du dossier
GET    /api/documents/:id/url          → URL signée temporaire (15 min)
PATCH  /api/documents/:id/invalider    → marquer invalide (superviseur)
```

**Règles du service MinIO :**
- Bucket : `documents`
- Chemin : `{annee}/{mois}/{dossierId}/{uuid}.jpg`
- URL signées valides 15 minutes (jamais d'URL directe permanente)
- Toujours vérifier que l'utilisateur a accès au dossier parent avant de servir le document

---

#### Semaine 6 — Backend : Notes + Statuts + Notifications

**Fichiers à créer dans l'ordre :**

1. `src/modules/notes/entities/note.entity.ts`
2. `src/modules/notes/dto/create-note.dto.ts`
3. `src/modules/notes/notes.service.ts`
4. `src/modules/notes/notes.controller.ts`
5. `src/modules/notes/notes.module.ts`
6. `src/modules/statuts/entities/historique-statut.entity.ts`
7. `src/modules/statuts/dto/changer-statut.dto.ts`
8. `src/modules/statuts/statuts-transitions.ts`
9. `src/modules/statuts/statuts.service.ts`
10. `src/modules/statuts/statuts.controller.ts`
11. `src/modules/statuts/statuts.module.ts`
12. `src/modules/notifications/entities/notification.entity.ts`
13. `src/modules/notifications/dto/notification-response.dto.ts`
14. `src/modules/notifications/notifications.service.ts`
15. `src/modules/notifications/notifications.controller.ts`
16. `src/modules/notifications/notifications.module.ts`

**Endpoints à implémenter :**
```
POST   /api/dossiers/:id/notes         → ajouter note
GET    /api/dossiers/:id/notes         → liste notes

POST   /api/dossiers/:id/statut        → changer statut
GET    /api/dossiers/:id/historique    → historique complet

GET    /api/notifications              → mes notifications
PATCH  /api/notifications/:id/lire    → marquer comme lue
PATCH  /api/notifications/lire-tout   → tout marquer lu
```

**Logique critique du changement de statut :**
```typescript
// Dans statuts.service.ts — ordre des opérations :
// 1. Vérifier que le dossier existe
// 2. Vérifier que la transition est autorisée (via statuts-transitions.ts)
// 3. Vérifier le rôle de l'utilisateur
// 4. Si statut cible = REJETE, vérifier que motifRejet.length >= 20
// 5. Si statut cible = ARCHIVE, vérifier que statut actuel = VALIDE
// 6. Mettre à jour le dossier
// 7. Créer l'entrée dans historique_statuts
// 8. Créer les notifications pour les parties prenantes
// 9. Enregistrer dans audit_logs
// Tout dans une transaction PostgreSQL unique
```

---

#### Semaine 7 — Application Mobile

**Initialisation :**
```bash
npx create-expo-app@latest mobile --template tabs
cd mobile
npm install expo-camera expo-image-manipulator expo-file-system
npm install @react-native-async-storage/async-storage
npm install axios @tanstack/react-query zustand
npm install expo-router
```

**Fichiers à créer dans l'ordre :**

1. `src/types/dossier.types.ts`
2. `src/types/api.types.ts`
3. `src/lib/storage.ts`
4. `src/lib/image-compress.ts`
5. `src/api/client.ts`
6. `src/api/auth.api.ts`
7. `src/api/dossiers.api.ts`
8. `src/api/documents.api.ts`
9. `src/store/auth.store.ts`
10. `src/hooks/useAuth.ts`
11. `src/hooks/useCamera.ts`
12. `src/hooks/useUpload.ts`
13. `src/components/DossierCard.tsx`
14. `src/components/StatutBadge.tsx`
15. `src/components/PhotoCapture.tsx`
16. `src/components/UploadProgress.tsx`
17. `src/components/OfflineBanner.tsx`
18. `src/app/(auth)/login.tsx`
19. `src/app/(app)/_layout.tsx`
20. `src/app/(app)/index.tsx`
21. `src/app/(app)/nouveau.tsx`
22. `src/app/(app)/dossier/[id].tsx`
23. `src/app/_layout.tsx`

---

#### Semaine 8 — Frontend Web : Documents + Timeline

**Fichiers à créer dans l'ordre :**

1. `src/api/documents.api.ts`
2. `src/api/notes.api.ts`
3. `src/hooks/useDocuments.ts`
4. `src/components/documents/DocumentViewer.tsx`
5. `src/components/documents/DocumentUpload.tsx`
6. `src/components/documents/DocumentGrid.tsx`
7. `src/components/notes/NotesList.tsx`
8. `src/components/notes/NoteForm.tsx`
9. `src/components/dossiers/DossierTimeline.tsx`
10. `src/components/dossiers/DossierActions.tsx`
11. `src/pages/dossiers/DossierDetailPage.tsx`

**Résultat Phase 2 :** Un agent terrain photographie un dossier depuis son téléphone. L'agent de bureau voit les photos et peut ajouter des notes.

---

### PHASE 3 — Workflow Complet + Notifications (Semaines 9–12)

**Objectif :** Le processus métier complet est supporté avec audit trail.

#### Semaines 9–10 — Workflow et audit

**Fichiers à créer :**

1. `src/modules/audit/audit.controller.ts` (lecture admin uniquement)
2. `src/common/interceptors/audit.interceptor.ts`
3. Intégrer `AuditInterceptor` dans `app.module.ts`
4. Ajouter l'audit manuel dans chaque service pour les actions critiques

**Ce qui doit être audité manuellement (en plus de l'interceptor) :**
- Consultation d'un dossier (GET) — `audit.service.enregistrer('consultation', ...)`
- Téléchargement d'un document
- Export d'un rapport
- Connexion et déconnexion
- Blocage d'un compte

#### Semaines 11–12 — Recherche avancée + Notifications UI

**Fichiers frontend à créer :**

1. `src/api/notifications.api.ts`
2. `src/store/notifications.store.ts`
3. `src/hooks/useNotifications.ts`
4. `src/components/layout/NotificationsDrawer.tsx`
5. Mettre à jour `Topbar.tsx` avec badge notifications
6. Implémenter le polling notifications (toutes les 30 secondes)

**Résultat Phase 3 :** Cycle complet A→Z d'un dossier fonctionne. Tout est tracé.

---

### PHASE 4 — Tableau de Bord et Rapports (Semaines 13–15)

**Objectif :** Pilotage complet pour le superviseur.

#### Semaine 13 — Backend Dashboard + Rapports

**Dépendances supplémentaires :**
```bash
cd backend
npm install pdfmake @types/pdfmake
npm install json2csv
```

**Fichiers à créer :**

1. `src/modules/dashboard/dto/stats-response.dto.ts`
2. `src/modules/dashboard/dashboard.service.ts`
3. `src/modules/dashboard/dashboard.controller.ts`
4. `src/modules/dashboard/dashboard.module.ts`
5. `src/modules/rapports/dto/rapport-params.dto.ts`
6. `src/modules/rapports/rapports.service.ts`
7. `src/modules/rapports/rapports.controller.ts`
8. `src/modules/rapports/rapports.module.ts`

**Endpoints à implémenter :**
```
GET    /api/dashboard/stats             → chiffres clés temps réel
GET    /api/dashboard/par-statut        → répartition par statut
GET    /api/dashboard/volume-mensuel    → données histogramme
GET    /api/dashboard/en-retard         → dossiers sans activité > 3j

GET    /api/rapports/activite?debut=&fin=    → rapport activité (PDF/CSV)
GET    /api/rapports/par-agent?mois=         → charge par agent
GET    /api/rapports/litiges-potentiels      → dossiers à risque
```

#### Semaines 14–15 — Frontend Dashboard

**Dépendances supplémentaires :**
```bash
cd frontend
npm install recharts
```

**Fichiers à créer :**

1. `src/api/dashboard.api.ts`
2. `src/api/rapports.api.ts`
3. `src/hooks/useDashboard.ts`
4. `src/components/dashboard/StatsCards.tsx`
5. `src/components/dashboard/DossiersParStatutChart.tsx`
6. `src/components/dashboard/VolumeChart.tsx`
7. `src/components/dashboard/DossiersEnRetard.tsx`
8. `src/pages/dashboard/DashboardPage.tsx`
9. `src/pages/rapports/RapportsPage.tsx`

**Résultat Phase 4 :** Superviseur voit les statistiques en temps réel et peut exporter des rapports.

---

### PHASE 5 — Administration et Mise en Production (Semaines 16–18)

**Objectif :** Système finalisé, sécurisé, sauvegardé, mis en production.

#### Semaine 16 — Module Administration complet

**Fichiers à créer :**

1. `src/pages/admin/UsersPage.tsx`
2. `src/pages/admin/ReferentielsPage.tsx`
3. `src/pages/admin/AuditPage.tsx`
4. `infrastructure/scripts/backup.sh`
5. `infrastructure/scripts/restore.sh`
6. `infrastructure/scripts/health-check.sh`

**Contenu de `infrastructure/scripts/backup.sh` :**
```bash
#!/bin/bash
# Sauvegarde quotidienne — à planifier via cron à 02h00
set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/${DATE}"
mkdir -p "${BACKUP_DIR}"

# Sauvegarde PostgreSQL
docker exec archivage_postgres pg_dump \
  -U "${POSTGRES_USER}" "${POSTGRES_DB}" \
  | gzip > "${BACKUP_DIR}/database.sql.gz"

# Sauvegarde MinIO (documents)
docker exec archivage_minio mc mirror \
  /data "${BACKUP_DIR}/documents/"

# Rotation : garder 30 dernières sauvegardes
ls -dt /backups/*/ | tail -n +31 | xargs rm -rf

echo "Sauvegarde ${DATE} terminée avec succès"
```

#### Semaine 17 — Sécurité et tests

**Checklist sécurité :**
- [ ] HTTPS configuré dans Nginx (certificat auto-signé interne)
- [ ] Headers sécurité Nginx : `X-Frame-Options`, `X-Content-Type-Options`, `HSTS`
- [ ] Rate limiting sur `/api/auth/login` (max 10 tentatives / minute / IP)
- [ ] Taille max upload configurée (10 Mo) dans Nginx et NestJS
- [ ] Variables d'environnement vérifiées (aucun secret en dur)
- [ ] Comptes de test désactivés avant production
- [ ] Cron backup configuré : `0 2 * * * /opt/archivage/scripts/backup.sh`

**Tests à écrire :**
```
backend/test/
├── auth.e2e-spec.ts           # Login, logout, change-password, blocage
├── dossiers.e2e-spec.ts       # CRUD, permissions par rôle, recherche
├── statuts.e2e-spec.ts        # Toutes les transitions valides et invalides
└── documents.e2e-spec.ts      # Upload, URL signée, invalidation
```

#### Semaine 18 — Déploiement et formation

**Procédure de déploiement :**
```bash
# Sur le serveur de production
git clone [repo] /opt/archivage
cd /opt/archivage
cp .env.example .env
# Remplir .env avec les vraies valeurs
nano .env

# Build frontend
cd frontend && npm ci && npm run build
cd ..

# Lancer tous les services
docker-compose up -d

# Vérifier la santé
./infrastructure/scripts/health-check.sh

# Configurer le cron backup
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/archivage/infrastructure/scripts/backup.sh >> /var/log/archivage-backup.log 2>&1") | crontab -
```

---

## CONVENTIONS DE CODE

### Nommage
```
Fichiers TypeScript  : kebab-case.ts (ex: dossiers.service.ts)
Composants React     : PascalCase.tsx (ex: DossierCard.tsx)
Variables/fonctions  : camelCase (ex: createDossier)
Constantes globales  : SCREAMING_SNAKE_CASE (ex: JWT_EXPIRES_IN)
Tables SQL           : snake_case pluriel (ex: audit_logs)
Colonnes SQL         : snake_case (ex: cree_le)
```

### Structure d'une réponse API

```typescript
// Succès
{
  "success": true,
  "data": { ... },
  "meta": {            // Optionnel, pour pagination
    "total": 42,
    "page": 1,
    "limit": 20
  }
}

// Erreur
{
  "success": false,
  "error": {
    "code": "DOSSIER_NOT_FOUND",
    "message": "Dossier introuvable",
    "details": []      // Optionnel, erreurs de validation
  }
}
```

### Gestion des erreurs — codes à utiliser

```typescript
// auth
AUTH_INVALID_CREDENTIALS         // Identifiant ou mot de passe incorrect
AUTH_ACCOUNT_BLOCKED             // Compte bloqué
AUTH_TOKEN_EXPIRED               // Session expirée
AUTH_UNAUTHORIZED                // Action non autorisée pour ce rôle

// dossiers
DOSSIER_NOT_FOUND                // Dossier inexistant
DOSSIER_TRANSITION_INTERDITE     // Changement de statut non autorisé
DOSSIER_MOTIF_REJET_REQUIS       // Motif de rejet manquant
DOSSIER_ARCHIVE_LECTURE_SEULE    // Tentative de modification d'un dossier archivé

// documents
DOCUMENT_TROP_GRAND              // Fichier > 10 Mo
DOCUMENT_FORMAT_INVALIDE         // Format non accepté

// users
USER_IDENTIFIANT_DEJA_UTILISE    // Identifiant déjà pris
USER_DERNIER_ADMIN               // Impossible de désactiver le dernier admin
```

---

## VARIABLES D'ENVIRONNEMENT — RÉFÉRENCE COMPLÈTE

### Backend (`backend/.env`)

```env
# Base de données
DATABASE_URL=postgresql://archivage_user:MOT_DE_PASSE@localhost:5432/archivage_elec

# Redis
REDIS_URL=redis://:MOT_DE_PASSE_REDIS@localhost:6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minio_admin
MINIO_SECRET_KEY=MOT_DE_PASSE_MINIO
MINIO_BUCKET_DOCUMENTS=documents

# JWT
JWT_SECRET=CHAINE_ALEATOIRE_DE_64_CARACTERES_MINIMUM
JWT_EXPIRES_IN=8h

# App
PORT=3000
NODE_ENV=production

# Sécurité
MAX_LOGIN_ATTEMPTS=5
SESSION_INACTIVITY_MINUTES=30
UPLOAD_MAX_SIZE_MB=10
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=/api
VITE_APP_NAME=Archivage Électricité
```

---

## POINTS D'ATTENTION CRITIQUES POUR CLAUDE CODE

1. **Toujours utiliser des transactions PostgreSQL** pour les opérations qui touchent plusieurs tables (changement de statut + historique + notification + audit = une seule transaction).

2. **Ne jamais retourner le mot de passe** dans les réponses utilisateur, même hashé. Utiliser les DTOs de réponse qui excluent ce champ.

3. **Vérifier les permissions à deux niveaux** : dans le Guard (rôle global) ET dans le Service (propriété du dossier). Un agent terrain ne peut accéder qu'à ses propres dossiers.

4. **Les URLs MinIO sont signées temporairement** (15 minutes). Ne jamais stocker d'URL permanente en base — stocker le chemin et générer l'URL à la volée.

5. **Le module Audit ne doit jamais faire échouer une requête**. Toujours wrapper les appels `auditService.enregistrer()` dans un `catch(() => {})`.

6. **Tester les transitions de statut** exhaustivement — c'est le cœur métier le plus sensible. Chaque transition valide et invalide doit avoir son test.

7. **Valider la taille et le format des images** côté backend (pas seulement côté mobile) — un utilisateur malveillant pourrait contourner le frontend.

8. **Le compte admin initial** est créé par le seed avec un mot de passe temporaire. La première connexion force le changement de mot de passe.

---

*Guide technique généré le 09 mai 2026 — Référentiel Claude Code — Confidentiel*
