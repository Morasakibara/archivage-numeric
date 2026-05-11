# Système d'archivage numérique — Cahier des charges complet
**Entreprise d'électricité · Version 1.0 · Mai 2026**

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Objectifs et problématique](#2-objectifs-et-problématique)
3. [Utilisateurs et rôles](#3-utilisateurs-et-rôles)
4. [Fonctionnalités par module](#4-fonctionnalités-par-module)
5. [Cycle de vie d'un dossier](#5-cycle-de-vie-dun-dossier)
6. [Schéma de base de données](#6-schéma-de-base-de-données)
7. [Architecture technique](#7-architecture-technique)
8. [Stack technique recommandée](#8-stack-technique-recommandée)
9. [Sécurité et audit](#9-sécurité-et-audit)
10. [Tableau de bord et rapports](#10-tableau-de-bord-et-rapports)
11. [Plan de développement par phases](#11-plan-de-développement-par-phases)
12. [Règles métier critiques](#12-règles-métier-critiques)

---

## 1. Présentation du projet

### Contexte

Une entreprise d'électricité gère des dossiers clients entièrement sur support papier. Ces dossiers représentent des interventions terrain, des réclamations, des demandes de branchement, et d'autres actes techniques. La gestion manuelle entraîne régulièrement des pertes de dossiers, des doublons, et des litiges avec les clients dont les demandes ne peuvent être retrouvées.

### Solution proposée

Un système d'archivage numérique fullstack (web + mobile) permettant de :

- Numériser les dossiers papier via photo smartphone
- Suivre chaque dossier tout au long de son traitement
- Retrouver n'importe quel dossier en quelques secondes
- Conserver un historique complet et inaltérable de toutes les actions
- Générer des rapports d'activité pour la direction

### Périmètre

- **Utilisateurs cibles** : 8 agents maximum
- **Hébergement** : serveur interne à l'entreprise (on-premise)
- **Accès** : navigateur web (bureau) + application mobile (terrain)
- **Langue** : Français

---

## 2. Objectifs et problématique

### Problèmes à résoudre

| Problème actuel | Solution apportée |
|---|---|
| Dossiers papier perdus | Archivage numérique centralisé et sécurisé |
| Impossibilité de savoir qui a traité quoi | Historique complet avec horodatage et auteur |
| Litiges clients sans preuve de traitement | Audit trail inaltérable sur chaque dossier |
| Recherche manuelle longue et fastidieuse | Recherche multicritères en temps réel |
| Aucune visibilité sur l'avancement | Tableau de bord avec statuts en temps réel |
| Notification impossible | Alertes automatiques à chaque changement de statut |

### Indicateurs de succès

- Temps de recherche d'un dossier < 10 secondes
- Zéro dossier perdu après déploiement
- Traçabilité 100% des actions sur chaque dossier
- Disponibilité du système > 99% pendant les heures ouvrables

---

## 3. Utilisateurs et rôles

### Rôles définis

#### Agent terrain
Travaille principalement depuis l'application mobile sur le terrain.

**Permissions :**
- Créer un nouveau dossier
- Photographier et uploader des documents papier
- Consulter ses propres dossiers créés
- Ajouter des notes sur ses dossiers
- Recevoir des notifications sur ses dossiers

**Restrictions :**
- Ne peut pas modifier un dossier qu'il n'a pas créé
- Ne peut pas changer le statut d'un dossier
- Ne voit pas les dossiers des autres agents

---

#### Agent de bureau
Travaille depuis le navigateur web au bureau.

**Permissions :**
- Consulter tous les dossiers actifs
- S'assigner un dossier
- Modifier les informations d'un dossier
- Changer le statut d'un dossier (sauf Validé et Archivé)
- Ajouter des notes internes et des documents complémentaires
- Rechercher dans tous les dossiers
- Recevoir des notifications

**Restrictions :**
- Ne peut pas valider ni archiver un dossier
- Ne peut pas gérer les comptes utilisateurs

---

#### Superviseur
Accès complet en lecture et validation.

**Permissions :**
- Consulter tous les dossiers (actifs et archivés)
- Valider ou rejeter un dossier (avec motif obligatoire)
- Archiver un dossier validé
- Accéder au tableau de bord et aux statistiques
- Exporter des rapports
- Recevoir toutes les notifications

**Restrictions :**
- Ne peut pas gérer les comptes utilisateurs
- Ne peut pas supprimer un dossier

---

#### Administrateur
Gestion technique et organisationnelle du système.

**Permissions :**
- Toutes les permissions du Superviseur
- Créer, modifier, désactiver des comptes utilisateurs
- Configurer les types d'interventions et les listes déroulantes
- Consulter les logs d'audit complets
- Gérer les sauvegardes

**Restrictions :**
- Une seule personne peut avoir ce rôle simultanément

---

### Matrice des permissions

| Action | Agent terrain | Agent bureau | Superviseur | Administrateur |
|---|:---:|:---:|:---:|:---:|
| Créer un dossier | ✅ | ✅ | ✅ | ✅ |
| Uploader des photos | ✅ | ✅ | ✅ | ✅ |
| Consulter ses dossiers | ✅ | ✅ | ✅ | ✅ |
| Consulter tous les dossiers | ❌ | ✅ | ✅ | ✅ |
| Modifier un dossier | ❌ (sien seulement) | ✅ | ✅ | ✅ |
| Changer le statut | ❌ | ✅ (partiel) | ✅ | ✅ |
| Valider / Rejeter | ❌ | ❌ | ✅ | ✅ |
| Archiver | ❌ | ❌ | ✅ | ✅ |
| Tableau de bord | ❌ | ❌ | ✅ | ✅ |
| Exporter rapports | ❌ | ❌ | ✅ | ✅ |
| Gérer les utilisateurs | ❌ | ❌ | ❌ | ✅ |
| Logs d'audit | ❌ | ❌ | ❌ | ✅ |

---

## 4. Fonctionnalités par module

### Module 1 — Authentification et gestion des sessions

- Connexion par identifiant + mot de passe
- Sessions sécurisées par token JWT avec expiration (8 heures)
- Déconnexion automatique après inactivité (30 minutes)
- Changement de mot de passe obligatoire à la première connexion
- Blocage du compte après 5 tentatives échouées
- Réinitialisation de mot de passe par l'administrateur
- Aucune inscription libre — les comptes sont créés uniquement par l'administrateur

---

### Module 2 — Gestion des dossiers

#### Création d'un dossier

Champs obligatoires à la création :

| Champ | Type | Description |
|---|---|---|
| Numéro dossier | Auto-généré | Format : `ELC-AAAA-NNNNN` |
| Nom complet client | Texte | Nom et prénom |
| Numéro compteur | Texte | Identifiant unique du compteur |
| Téléphone client | Texte | Pour contact éventuel |
| Type d'intervention | Liste | Voir liste ci-dessous |
| Priorité | Liste | Normale / Urgente |
| Description | Texte long | Résumé du problème ou de la demande |
| Agent créateur | Auto (session) | Rempli automatiquement |
| Date de création | Auto (système) | Horodatage automatique |

**Types d'intervention (configurables par l'admin) :**
- Nouveau branchement
- Réclamation facturation
- Coupure de courant
- Panne compteur
- Fraude / vol d'électricité
- Déménagement
- Résiliation
- Autre (avec champ texte libre)

#### Modification d'un dossier

- Toute modification est enregistrée dans l'historique (qui, quoi, quand)
- Les champs auto-générés (numéro, date) ne sont jamais modifiables
- Un dossier archivé est en lecture seule — aucune modification possible

#### Recherche de dossiers

Critères de recherche disponibles (combinables) :

- Numéro de dossier
- Nom du client (recherche partielle tolérée)
- Numéro de compteur
- Type d'intervention
- Statut
- Priorité
- Agent créateur
- Période de création (date début / date fin)
- Agent assigné

Résultats affichés en temps réel, triables par colonne.

---

### Module 3 — Gestion des documents (photos)

#### Upload depuis mobile

- L'agent ouvre l'app mobile, sélectionne un dossier existant ou en crée un
- Il photographie chaque page du document papier
- Chaque photo est compressée automatiquement avant envoi (qualité optimisée, taille réduite)
- L'upload se fait page par page ou en lot
- Un indicateur de progression est affiché pendant l'envoi

#### Règles sur les documents

- Formats acceptés : JPEG, PNG (issus de l'appareil photo)
- Taille maximale par photo : 10 Mo (avant compression)
- Nombre de photos par dossier : illimité
- Les photos ne peuvent jamais être supprimées définitivement — elles peuvent être marquées comme "invalides" par un superviseur
- Chaque photo est horodatée et associée à l'agent qui l'a uploadée

#### Visualisation

- Visionneuse intégrée dans l'interface web et mobile
- Possibilité de zoomer sur les photos
- Navigation entre les pages d'un même dossier
- Téléchargement d'une photo individuelle ou de toutes les photos d'un dossier en ZIP

---

### Module 4 — Workflow et statuts

#### Statuts d'un dossier

```
[Nouveau] → [En instruction] → [En attente client] → [En attente validation] → [Validé] → [Archivé]
                                        ↕
                                    [Rejeté]
```

#### Détail de chaque statut

| Statut | Qui peut l'appliquer | Action déclenchée |
|---|---|---|
| **Nouveau** | Système (à la création) | Notification au superviseur et aux agents de bureau |
| **En instruction** | Agent de bureau | Notification à l'agent terrain créateur |
| **En attente client** | Agent de bureau | Notification au superviseur |
| **En attente validation** | Agent de bureau | Notification au superviseur |
| **Validé** | Superviseur | Notification à l'agent de bureau assigné |
| **Rejeté** | Superviseur | Notification à l'agent de bureau + motif obligatoire |
| **Archivé** | Superviseur | Dossier passe en lecture seule |

#### Règles de transition

- Un dossier ne peut passer qu'aux statuts autorisés depuis son statut actuel
- Le passage à "Rejeté" exige un commentaire de minimum 20 caractères
- Un dossier "Rejeté" peut être remis en "En instruction" pour correction
- Un dossier "Archivé" ne peut plus jamais changer de statut
- Un dossier ne peut jamais être supprimé

---

### Module 5 — Notes et commentaires

- Chaque dossier dispose d'un fil de notes chronologique
- Tout utilisateur ayant accès au dossier peut ajouter une note
- Les notes sont horodatées et signées automatiquement (auteur + date + heure)
- Les notes ne peuvent pas être modifiées ni supprimées après création
- Les notes sont visibles dans l'historique complet du dossier

---

### Module 6 — Notifications

#### Déclencheurs automatiques

- Création d'un nouveau dossier → superviseur + agents de bureau
- Changement de statut → toutes les parties prenantes du dossier
- Ajout d'un document → agent assigné
- Dossier rejeté → agent de bureau assigné (avec le motif)
- Dossier en attente depuis plus de 3 jours → superviseur (rappel)
- Dossier urgent créé → superviseur immédiatement

#### Types de notifications

- Notification in-app (cloche dans l'interface)
- Badge sur l'icône de l'app mobile
- Les notifications non lues sont listées dans un centre de notifications

---

### Module 7 — Tableau de bord (Superviseur / Admin)

#### Indicateurs temps réel

- Nombre de dossiers par statut (graphique)
- Dossiers urgents en cours
- Dossiers en retard (plus de N jours sans changement de statut)
- Volume de dossiers créés cette semaine / ce mois
- Dossiers traités ce mois vs mois précédent

#### Rapports exportables

- Liste des dossiers par période (filtrable)
- Dossiers par agent (charge de travail)
- Dossiers par type d'intervention
- Délai moyen de traitement par type
- Dossiers rejetés (avec motifs)

**Formats d'export :** PDF, CSV

---

### Module 8 — Administration

- Créer / désactiver un compte utilisateur
- Modifier le rôle d'un utilisateur
- Réinitialiser le mot de passe d'un utilisateur
- Configurer les listes déroulantes (types d'intervention, priorités)
- Consulter les logs d'audit complets
- Déclencher une sauvegarde manuelle
- Visualiser l'état du serveur (espace disque utilisé, nombre de fichiers stockés)

---

## 5. Cycle de vie d'un dossier

### Scénario complet type

**Étape 1 — Terrain : création du dossier**

L'agent terrain reçoit un dossier papier d'un client. Il ouvre l'application mobile, crée un nouveau dossier, remplit les informations obligatoires, et photographie chaque page du document. Le système génère automatiquement le numéro de dossier `ELC-2026-00142`, enregistre l'heure exacte et l'identité de l'agent. Le dossier passe au statut **Nouveau**. Le superviseur et les agents de bureau reçoivent une notification.

**Étape 2 — Bureau : prise en charge**

Un agent de bureau voit apparaître le nouveau dossier dans sa liste. Il consulte les photos uploadées, vérifie les informations, s'assigne le dossier, et passe le statut à **En instruction**. L'agent terrain reçoit une notification confirmant que son dossier est pris en charge.

**Étape 3 — Instruction**

L'agent de bureau traite le dossier : vérifications techniques, calculs, consultations d'autres dossiers liés. Il peut ajouter des notes internes et des photos complémentaires. Si une pièce manque côté client, il passe en **En attente client** avec une note expliquant ce qui est attendu.

**Étape 4 — Soumission à validation**

Dossier complet → l'agent de bureau passe le statut à **En attente validation**. Le superviseur reçoit une notification.

**Étape 5 — Décision du superviseur**

Le superviseur examine le dossier et ses documents. Deux cas :
- **Validation** → statut passe à **Validé**, l'agent de bureau est notifié
- **Rejet** → motif obligatoire saisi, statut passe à **Rejeté**, l'agent de bureau est notifié et doit corriger

**Étape 6 — Archivage**

Le superviseur clôture le dossier validé → statut **Archivé**. Le dossier devient consultable en lecture seule avec son historique complet, et ne peut plus jamais être modifié.

---

## 6. Schéma de base de données

### Tables principales

---

#### Table `users` — Utilisateurs

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom           VARCHAR(100) NOT NULL,
  prenom        VARCHAR(100) NOT NULL,
  identifiant   VARCHAR(50) UNIQUE NOT NULL,
  email         VARCHAR(150) UNIQUE,
  mot_de_passe  VARCHAR(255) NOT NULL,       -- Hashé avec bcrypt
  role          ENUM('terrain','bureau','superviseur','admin') NOT NULL,
  actif         BOOLEAN DEFAULT TRUE,
  premiere_connexion BOOLEAN DEFAULT TRUE,   -- Oblige changement mdp
  tentatives_echec   INTEGER DEFAULT 0,
  bloque        BOOLEAN DEFAULT FALSE,
  cree_le       TIMESTAMP DEFAULT NOW(),
  modifie_le    TIMESTAMP DEFAULT NOW()
);
```

---

#### Table `dossiers` — Dossiers clients

```sql
CREATE TABLE dossiers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero            VARCHAR(20) UNIQUE NOT NULL,  -- ELC-2026-00142
  nom_client        VARCHAR(200) NOT NULL,
  telephone_client  VARCHAR(20),
  numero_compteur   VARCHAR(50) NOT NULL,
  type_intervention VARCHAR(100) NOT NULL,
  priorite          ENUM('normale','urgente') DEFAULT 'normale',
  description       TEXT,
  statut            ENUM(
                      'nouveau',
                      'en_instruction',
                      'en_attente_client',
                      'en_attente_validation',
                      'valide',
                      'rejete',
                      'archive'
                    ) DEFAULT 'nouveau',
  createur_id       UUID NOT NULL REFERENCES users(id),
  assigne_id        UUID REFERENCES users(id),
  motif_rejet       TEXT,                         -- Obligatoire si rejeté
  cree_le           TIMESTAMP DEFAULT NOW(),
  modifie_le        TIMESTAMP DEFAULT NOW(),
  archive_le        TIMESTAMP
);

CREATE INDEX idx_dossiers_statut ON dossiers(statut);
CREATE INDEX idx_dossiers_numero ON dossiers(numero);
CREATE INDEX idx_dossiers_compteur ON dossiers(numero_compteur);
CREATE INDEX idx_dossiers_createur ON dossiers(createur_id);
CREATE INDEX idx_dossiers_assigne ON dossiers(assigne_id);
CREATE INDEX idx_dossiers_cree_le ON dossiers(cree_le);
```

---

#### Table `documents` — Photos et fichiers

```sql
CREATE TABLE documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id    UUID NOT NULL REFERENCES dossiers(id),
  nom_fichier   VARCHAR(255) NOT NULL,
  chemin_stockage VARCHAR(500) NOT NULL,       -- Chemin dans MinIO
  taille_octets INTEGER,
  type_mime     VARCHAR(50),                  -- image/jpeg, image/png
  ordre         INTEGER DEFAULT 1,            -- Ordre d'affichage
  valide        BOOLEAN DEFAULT TRUE,         -- false = marqué invalide
  uploade_par   UUID NOT NULL REFERENCES users(id),
  uploade_le    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_dossier ON documents(dossier_id);
```

---

#### Table `historique_statuts` — Audit des changements de statut

```sql
CREATE TABLE historique_statuts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id      UUID NOT NULL REFERENCES dossiers(id),
  statut_avant    VARCHAR(50),
  statut_apres    VARCHAR(50) NOT NULL,
  commentaire     TEXT,
  effectue_par    UUID NOT NULL REFERENCES users(id),
  effectue_le     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_historique_dossier ON historique_statuts(dossier_id);
```

---

#### Table `notes` — Commentaires sur les dossiers

```sql
CREATE TABLE notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id  UUID NOT NULL REFERENCES dossiers(id),
  contenu     TEXT NOT NULL,
  auteur_id   UUID NOT NULL REFERENCES users(id),
  cree_le     TIMESTAMP DEFAULT NOW()
  -- Les notes sont immuables : pas de colonne modifie_le
);

CREATE INDEX idx_notes_dossier ON notes(dossier_id);
```

---

#### Table `notifications` — Alertes utilisateurs

```sql
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinataire_id UUID NOT NULL REFERENCES users(id),
  dossier_id      UUID REFERENCES dossiers(id),
  type            VARCHAR(50) NOT NULL,       -- nouveau_dossier, changement_statut, etc.
  message         TEXT NOT NULL,
  lu              BOOLEAN DEFAULT FALSE,
  cree_le         TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifs_destinataire ON notifications(destinataire_id, lu);
```

---

#### Table `audit_logs` — Journal d'audit système complet

```sql
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id UUID REFERENCES users(id),
  action        VARCHAR(100) NOT NULL,        -- connexion, consultation, modification, etc.
  entite        VARCHAR(50),                  -- dossier, document, user
  entite_id     UUID,
  details       JSONB,                        -- Données avant/après
  ip_adresse    INET,
  enregistre_le TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_utilisateur ON audit_logs(utilisateur_id);
CREATE INDEX idx_audit_entite ON audit_logs(entite, entite_id);
CREATE INDEX idx_audit_date ON audit_logs(enregistre_le);
```

---

#### Table `types_intervention` — Référentiel configurable

```sql
CREATE TABLE types_intervention (
  id      SERIAL PRIMARY KEY,
  libelle VARCHAR(100) UNIQUE NOT NULL,
  actif   BOOLEAN DEFAULT TRUE,
  ordre   INTEGER DEFAULT 0
);
```

---

#### Table `sessions` — Gestion des sessions actives

```sql
CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id  UUID NOT NULL REFERENCES users(id),
  token_hash      VARCHAR(255) NOT NULL,       -- Hash du JWT
  ip_adresse      INET,
  user_agent      TEXT,
  expire_le       TIMESTAMP NOT NULL,
  cree_le         TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_user ON sessions(utilisateur_id);
```

---

#### Table `sauvegardes` — Journal des sauvegardes

```sql
CREATE TABLE sauvegardes (
  id          SERIAL PRIMARY KEY,
  type        ENUM('automatique','manuelle') NOT NULL,
  statut      ENUM('succes','echec') NOT NULL,
  chemin      VARCHAR(500),
  taille_mo   DECIMAL(10,2),
  lance_par   UUID REFERENCES users(id),
  execute_le  TIMESTAMP DEFAULT NOW(),
  message     TEXT
);
```

---

### Relations entre tables (résumé)

```
users ──────────────────────────────────────────────────────────────┐
  │ createur_id, assigne_id                                         │
  ↓                                                                 │
dossiers ──────── historique_statuts (dossier_id, effectue_par)    │
  │                                                                  │
  ├──────────────── documents (dossier_id, uploade_par) ────────────┘
  │
  ├──────────────── notes (dossier_id, auteur_id) ──────────────────┘
  │
  └──────────────── notifications (dossier_id, destinataire_id) ────┘
```

---

## 7. Architecture technique

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                    SERVEUR ON-PREMISE                    │
│                                                         │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────┐  │
│  │  API REST   │   │ PostgreSQL  │   │    MinIO     │  │
│  │  (Backend)  │◄──│  Base de   │   │   Stockage   │  │
│  │  Port 3000  │   │  données   │   │    photos    │  │
│  └──────┬──────┘   └─────────────┘   └──────────────┘  │
│         │                                               │
│  ┌──────┴──────┐   ┌─────────────┐                     │
│  │   Nginx     │   │    Redis    │                     │
│  │  (Reverse   │   │   (Cache    │                     │
│  │   Proxy)    │   │  Sessions)  │                     │
│  └──────┬──────┘   └─────────────┘                     │
│         │                                               │
└─────────┼───────────────────────────────────────────────┘
          │ Réseau interne entreprise
    ┌─────┴──────────────┐
    │                    │
┌───▼───┐          ┌─────▼─────┐
│  Web  │          │  Mobile   │
│Browser│          │   App     │
└───────┘          └───────────┘
```

### Flux de données — Upload d'un document

```
Agent terrain       App Mobile         API Backend        MinIO         PostgreSQL
     │                  │                   │               │               │
     │  Prend photo     │                   │               │               │
     │─────────────────►│                   │               │               │
     │                  │ Compresse image   │               │               │
     │                  │ POST /documents   │               │               │
     │                  │──────────────────►│               │               │
     │                  │                   │ Stocke fichier│               │
     │                  │                   │──────────────►│               │
     │                  │                   │ Enregistre    │               │
     │                  │                   │ métadonnées   │               │
     │                  │                   │──────────────────────────────►│
     │                  │                   │ Enregistre    │               │
     │                  │                   │ audit log     │               │
     │                  │  200 OK + url     │               │               │
     │                  │◄──────────────────│               │               │
     │  Confirmation    │                   │               │               │
     │◄─────────────────│                   │               │               │
```

---

## 8. Stack technique recommandée

### Backend

| Composant | Technologie | Justification |
|---|---|---|
| Langage | Node.js (TypeScript) | Maturité, écosystème riche, performance |
| Framework | NestJS | Structure modulaire, décorateurs, DI intégrée |
| ORM | TypeORM ou Prisma | Compatible PostgreSQL, migrations automatiques |
| Authentification | JWT + bcrypt | Standard sécurisé, sans état |
| Validation | class-validator | Validation automatique des DTOs |
| Upload fichiers | Multer + MinIO SDK | Gestion robuste des fichiers |

### Base de données

| Composant | Technologie | Justification |
|---|---|---|
| Base principale | PostgreSQL 16 | Robuste, requêtes complexes, JSONB pour audit |
| Cache / Sessions | Redis | Rapide, gestion TTL native |
| Stockage fichiers | MinIO | Compatible S3, auto-hébergeable, gratuit |

### Frontend Web

| Composant | Technologie | Justification |
|---|---|---|
| Framework | React 18 + TypeScript | Maintenabilité, composants réutilisables |
| UI | TailwindCSS + shadcn/ui | Design system cohérent, pas de CSS custom |
| État global | Zustand | Simple et efficace pour ce volume |
| Requêtes API | React Query (TanStack) | Cache, refetch automatique, optimistic updates |
| Formulaires | React Hook Form + Zod | Validation côté client robuste |
| Graphiques | Recharts | Léger, bien intégré à React |

### Application mobile

| Composant | Technologie | Justification |
|---|---|---|
| Framework | React Native (Expo) | Code partagé avec web, déploiement simplifié |
| Caméra | expo-camera | Accès natif à l'appareil photo |
| Compression image | expo-image-manipulator | Réduction taille avant upload |
| Navigation | React Navigation | Standard React Native |

### Infrastructure on-premise

| Composant | Technologie |
|---|---|
| Serveur web / Proxy | Nginx |
| Conteneurisation | Docker + Docker Compose |
| Sauvegardes | Script cron + pg_dump + rsync |
| OS serveur recommandé | Ubuntu Server 24.04 LTS |

---

## 9. Sécurité et audit

### Authentification et autorisation

- Tous les mots de passe sont hashés avec **bcrypt** (coût 12)
- Les tokens JWT expirent après **8 heures**
- Chaque endpoint vérifie le rôle de l'utilisateur (RBAC)
- Un token révoqué est blacklisté dans Redis jusqu'à son expiration
- Toute tentative d'accès non autorisée est loggée

### Audit trail

Toute action significative est enregistrée dans `audit_logs` :

| Action loggée | Détails conservés |
|---|---|
| Connexion / Déconnexion | IP, navigateur, horodatage |
| Création d'un dossier | Tous les champs initiaux |
| Modification d'un dossier | Valeur avant / valeur après |
| Changement de statut | Ancien statut, nouveau statut, commentaire |
| Upload d'un document | Nom du fichier, taille, auteur |
| Consultation d'un dossier | Qui a lu quoi et quand |
| Rejet d'un dossier | Motif complet |
| Action admin | Création compte, modification rôle |

**Les logs d'audit sont en écriture seule** — aucun utilisateur, y compris l'administrateur, ne peut les modifier ou les supprimer depuis l'interface.

### Chiffrement

- Communications chiffrées en HTTPS (certificat auto-signé en interne)
- Données sensibles en base chiffrées au repos (PostgreSQL transparent data encryption)
- Les photos stockées dans MinIO ne sont accessibles qu'via des URLs signées temporaires

### Sauvegardes

- **Sauvegarde automatique quotidienne** à 2h00 du matin
- Export de la base PostgreSQL (`pg_dump`)
- Copie des fichiers MinIO
- Rotation : conservation des 30 dernières sauvegardes
- Copie sur un disque externe séparé du serveur principal
- Journal des sauvegardes dans la table `sauvegardes`
- Alerte à l'administrateur en cas d'échec

---

## 10. Tableau de bord et rapports

### Widgets du tableau de bord (Superviseur)

#### Vue temps réel
- Jauge par statut : Nouveau / En instruction / En attente client / En attente validation
- Compteur dossiers urgents actifs
- Liste des dossiers en retard (sans activité depuis + de 3 jours)
- Dernières activités (fil d'événements)

#### Graphiques mensuels
- Volume de dossiers créés par semaine (histogramme)
- Répartition par type d'intervention (camembert)
- Délai moyen de traitement par type (barres)
- Taux de rejet par agent (barres)

### Rapports exportables

#### Rapport d'activité mensuel
Contenu : tous les dossiers créés, traités, clôturés sur la période, avec les délais.

#### Rapport par agent
Contenu : nombre de dossiers créés, traités, délai moyen, taux de rejet par agent.

#### Rapport des litiges potentiels
Contenu : dossiers rejetés avec motifs, dossiers en retard depuis plus de 7 jours.

**Format d'export :** PDF (mise en page soignée) et CSV (données brutes pour Excel).

---

## 11. Plan de développement par phases

### Phase 1 — Fondations (semaines 1–4)
Objectif : avoir un système fonctionnel minimal

- Mise en place du serveur (Docker, PostgreSQL, Redis, MinIO, Nginx)
- Création de la base de données (toutes les tables)
- Module d'authentification complet (login, JWT, rôles, changement mdp)
- CRUD dossiers (création, consultation, modification)
- Interface web : login + liste des dossiers + formulaire de création
- Gestion basique des statuts

**Livrable :** Un agent peut se connecter, créer un dossier et le voir dans la liste.

---

### Phase 2 — Documents et mobile (semaines 5–8)
Objectif : numérisation des documents opérationnelle

- Application mobile (Expo) : connexion, création dossier, prise de photo
- Upload et compression des photos
- Stockage dans MinIO
- Visionneuse de documents dans l'interface web
- Historique des statuts
- Notes et commentaires

**Livrable :** Un agent terrain peut photographier un dossier depuis son téléphone et le voir dans l'interface web.

---

### Phase 3 — Workflow et notifications (semaines 9–12)
Objectif : le processus métier complet est supporté

- Workflow complet des statuts avec validations et contraintes
- Système de notifications in-app
- Motif de rejet obligatoire
- Recherche multicritères
- Audit trail complet

**Livrable :** Le cycle de vie complet d'un dossier fonctionne de A à Z.

---

### Phase 4 — Tableau de bord et rapports (semaines 13–15)
Objectif : pilotage pour le superviseur

- Tableau de bord avec graphiques
- Export PDF et CSV
- Rapports configurables

**Livrable :** Le superviseur dispose d'une vue complète de l'activité.

---

### Phase 5 — Administration et finitions (semaines 16–18)
Objectif : mise en production

- Module d'administration complet
- Sauvegardes automatiques et monitoring
- Tests utilisateurs et corrections
- Documentation utilisateur (guide d'utilisation)
- Formation des 8 utilisateurs
- Déploiement final sur le serveur de l'entreprise

**Livrable :** Système en production, utilisateurs formés.

---

## 12. Règles métier critiques

Ces règles sont absolues et doivent être appliquées à tous les niveaux (frontend, backend, base de données) :

1. **Un dossier ne peut jamais être supprimé** — l'archivage est la seule forme de clôture.

2. **Un dossier archivé est en lecture seule** — aucune modification, aucune note, aucun document ne peut être ajouté.

3. **Tout changement de statut est définitif et tracé** — l'historique est inaltérable.

4. **Le rejet d'un dossier exige un motif d'au moins 20 caractères** — pour garantir la traçabilité légale en cas de litige.

5. **Les notes sont immuables** — une note créée ne peut jamais être modifiée ni supprimée.

6. **Les documents (photos) ne peuvent pas être supprimés** — seulement marqués "invalides" par un superviseur.

7. **L'identifiant unique d'un dossier est généré par le système** — jamais saisi manuellement.

8. **Les logs d'audit sont en écriture seule** — aucune interface ne permet leur modification.

9. **Un seul compte administrateur actif à la fois** — le système bloque la création d'un deuxième admin.

10. **Les sessions expirent après 8 heures** et après 30 minutes d'inactivité — pour la sécurité des postes partagés.

---

*Document généré le 09 mai 2026 — Confidentiel — Usage interne*
