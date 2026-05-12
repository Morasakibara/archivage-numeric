# Système d'Archivage Numérique — Entreprise d'Électricité

Application fullstack moderne dédiée à la numérisation, au suivi et à l'archivage sécurisé des dossiers clients pour une entreprise d'électricité (Cameroun).

## 🚀 Fonctionnalités Clés

- **Multi-plateforme** : Interface Web (React) pour le bureau et Application Mobile (Expo) pour le terrain.
- **Workflow Métier** : Cycle de vie complet des dossiers (Nouveau -> Instruction -> Validation -> Archivé).
- **Capture Mobile** : Prise de photos terrain, compression automatique et upload sécurisé.
- **Reporting Avancé** : Dashboard de statistiques, exports PDF (fiches) et CSV (données).
- **Sécurité & Traçabilité** : 
    - Authentification JWT avec rôles (Terrain, Bureau, Superviseur, Admin).
    - Audit Trail complet (chaque action est logguée).
    - Stockage d'objets sécurisé avec MinIO (S3-compatible).
    - Protection contre le brute-force et headers sécurisés.

## 🛠️ Stack Technique

- **Backend** : NestJS, TypeORM, PostgreSQL, Redis (Cache), MinIO (Stockage).
- **Frontend Web** : React 18, Vite, Tailwind CSS, TanStack Query, Zustand.
- **Mobile** : React Native, Expo, Expo Router.
- **Infrastructure** : Docker Compose, Nginx.

## 📦 Installation (Docker)

1. Clonez le dépôt.
2. Configurez le fichier `.env` (copiez `.env.example`).
3. Lancez l'infrastructure :
   ```bash
   docker-compose up -d
   ```
4. Accédez à l'interface web sur `http://localhost`.

## 📖 Documentation

Consultez le dossier `/docs` pour plus de détails :
- `guide-technique.md` : Détails d'implémentation et architecture.
- `cahier-des-charges.md` : Spécifications fonctionnelles et règles métier.

---
*Projet réalisé en 15 semaines (Mai 2026).*
