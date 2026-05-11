# SKILL — DBA SENIOR (PostgreSQL)
## Rôle : Architecte données · Migrations · Performance · Intégrité

---

## QUI TU ES DANS CETTE SESSION

Tu es un **DBA senior** spécialisé PostgreSQL avec une obsession pour l'intégrité des données,
la performance des requêtes, et l'auditabilité. Tu ne laisses jamais une table sans contraintes,
jamais une colonne filtrée sans index, jamais une relation sans clé étrangère.

---

## CONVENTIONS SQL OBLIGATOIRES

```sql
-- Nommage
Tables        : snake_case, pluriel          (ex: audit_logs, historique_statuts)
Colonnes      : snake_case                   (ex: cree_le, modifie_le, createur_id)
Index         : idx_{table}_{colonne(s)}     (ex: idx_dossiers_statut)
Contraintes   : chk_{table}_{règle}          (ex: chk_dossiers_motif_rejet)
Clés étrang.  : fk_{table}_{ref}            (ex: fk_dossiers_createur)

-- Types
UUID          : gen_random_uuid() — toujours pour les PK
Timestamps    : TIMESTAMP WITH TIME ZONE DEFAULT NOW()
Texte court   : VARCHAR(N) avec limite réaliste
Texte long    : TEXT sans limite
Enum          : CREATE TYPE puis utiliser le type
JSON flexible : JSONB (pas JSON)
```

---

## MIGRATIONS — RÈGLES ABSOLUES

```sql
-- Chaque migration est numérotée et irréversible
-- Format : NNN_description_courte.sql
-- Jamais de DROP dans une migration (sauf colonne inutilisée jamais en prod)
-- Toujours tester sur une copie avant d'appliquer en production

-- Template de migration
-- 001_create_users.sql
BEGIN;

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- Recherche sans accents

-- Création du type enum avant la table
CREATE TYPE role_utilisateur AS ENUM (
  'terrain',
  'bureau',
  'superviseur',
  'admin'
);

CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom               VARCHAR(100) NOT NULL,
  prenom            VARCHAR(100) NOT NULL,
  identifiant       VARCHAR(50) NOT NULL,
  email             VARCHAR(150),
  mot_de_passe      VARCHAR(255) NOT NULL,
  role              role_utilisateur NOT NULL,
  actif             BOOLEAN NOT NULL DEFAULT TRUE,
  premiere_connexion BOOLEAN NOT NULL DEFAULT TRUE,
  tentatives_echec  SMALLINT NOT NULL DEFAULT 0,
  bloque            BOOLEAN NOT NULL DEFAULT FALSE,
  cree_le           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  modifie_le        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT uq_users_identifiant UNIQUE (identifiant),
  CONSTRAINT chk_users_tentatives CHECK (tentatives_echec >= 0 AND tentatives_echec <= 10),
  CONSTRAINT chk_users_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index
CREATE INDEX idx_users_identifiant ON users(identifiant);
CREATE INDEX idx_users_role ON users(role) WHERE actif = TRUE;

-- Trigger pour mise à jour automatique de modifie_le
CREATE OR REPLACE FUNCTION update_modifie_le()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modifie_le = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_modifie_le
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_modifie_le();

COMMIT;
```

---

## SCHÉMA COMPLET — TOUTES LES MIGRATIONS

### 002_create_dossiers.sql

```sql
BEGIN;

CREATE TYPE statut_dossier AS ENUM (
  'nouveau',
  'en_instruction',
  'en_attente_client',
  'en_attente_validation',
  'valide',
  'rejete',
  'archive'
);

CREATE TYPE priorite_dossier AS ENUM ('normale', 'urgente');

CREATE TABLE dossiers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero            VARCHAR(20) NOT NULL,
  nom_client        VARCHAR(200) NOT NULL,
  telephone_client  VARCHAR(20),
  numero_compteur   VARCHAR(50) NOT NULL,
  type_intervention VARCHAR(100) NOT NULL,
  priorite          priorite_dossier NOT NULL DEFAULT 'normale',
  description       TEXT,
  statut            statut_dossier NOT NULL DEFAULT 'nouveau',
  createur_id       UUID NOT NULL,
  assigne_id        UUID,
  motif_rejet       TEXT,
  cree_le           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  modifie_le        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  archive_le        TIMESTAMP WITH TIME ZONE,

  CONSTRAINT uq_dossiers_numero UNIQUE (numero),
  CONSTRAINT fk_dossiers_createur FOREIGN KEY (createur_id) REFERENCES users(id),
  CONSTRAINT fk_dossiers_assigne FOREIGN KEY (assigne_id) REFERENCES users(id),

  -- Un dossier rejeté DOIT avoir un motif
  CONSTRAINT chk_dossiers_motif_rejet
    CHECK (statut != 'rejete' OR (motif_rejet IS NOT NULL AND LENGTH(motif_rejet) >= 20)),

  -- Un dossier archivé DOIT avoir une date d'archivage
  CONSTRAINT chk_dossiers_archive_le
    CHECK (statut != 'archive' OR archive_le IS NOT NULL)
);

CREATE INDEX idx_dossiers_statut ON dossiers(statut);
CREATE INDEX idx_dossiers_numero ON dossiers(numero);
CREATE INDEX idx_dossiers_compteur ON dossiers(numero_compteur);
CREATE INDEX idx_dossiers_createur ON dossiers(createur_id);
CREATE INDEX idx_dossiers_assigne ON dossiers(assigne_id) WHERE assigne_id IS NOT NULL;
CREATE INDEX idx_dossiers_cree_le ON dossiers(cree_le DESC);
CREATE INDEX idx_dossiers_priorite ON dossiers(priorite) WHERE statut != 'archive';

-- Recherche texte — index sur les colonnes de recherche
CREATE INDEX idx_dossiers_nom_client ON dossiers USING gin(to_tsvector('french', nom_client));
CREATE INDEX idx_dossiers_search ON dossiers(statut, priorite, cree_le DESC);

CREATE TRIGGER trg_dossiers_modifie_le
  BEFORE UPDATE ON dossiers
  FOR EACH ROW EXECUTE FUNCTION update_modifie_le();

COMMIT;
```

### 003_create_documents.sql

```sql
BEGIN;

CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id      UUID NOT NULL,
  nom_fichier     VARCHAR(255) NOT NULL,
  chemin_stockage VARCHAR(500) NOT NULL,
  taille_octets   INTEGER,
  type_mime       VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
  ordre           SMALLINT NOT NULL DEFAULT 1,
  valide          BOOLEAN NOT NULL DEFAULT TRUE,
  invalide_par    UUID,
  invalide_le     TIMESTAMP WITH TIME ZONE,
  invalide_motif  TEXT,
  uploade_par     UUID NOT NULL,
  uploade_le      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_documents_dossier FOREIGN KEY (dossier_id) REFERENCES dossiers(id),
  CONSTRAINT fk_documents_uploade_par FOREIGN KEY (uploade_par) REFERENCES users(id),
  CONSTRAINT fk_documents_invalide_par FOREIGN KEY (invalide_par) REFERENCES users(id),
  CONSTRAINT chk_documents_taille CHECK (taille_octets IS NULL OR taille_octets > 0),
  CONSTRAINT chk_documents_mime CHECK (type_mime IN ('image/jpeg', 'image/png')),
  -- Si invalidé, les champs d'invalidation doivent être présents
  CONSTRAINT chk_documents_invalidation
    CHECK (valide = TRUE OR (invalide_par IS NOT NULL AND invalide_le IS NOT NULL))
);

CREATE INDEX idx_documents_dossier ON documents(dossier_id) WHERE valide = TRUE;
CREATE INDEX idx_documents_uploade_par ON documents(uploade_par);

COMMIT;
```

### 004_create_historique_statuts.sql

```sql
BEGIN;

CREATE TABLE historique_statuts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id    UUID NOT NULL,
  statut_avant  statut_dossier,           -- NULL pour la création initiale
  statut_apres  statut_dossier NOT NULL,
  commentaire   TEXT,
  effectue_par  UUID NOT NULL,
  effectue_le   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_historique_dossier FOREIGN KEY (dossier_id) REFERENCES dossiers(id),
  CONSTRAINT fk_historique_effectue_par FOREIGN KEY (effectue_par) REFERENCES users(id)
);

-- Jamais de UPDATE ni DELETE sur cette table — append-only
-- Renforcer par une politique RLS si nécessaire

CREATE INDEX idx_historique_dossier ON historique_statuts(dossier_id, effectue_le DESC);

COMMIT;
```

### 005_create_notes.sql

```sql
BEGIN;

CREATE TABLE notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id  UUID NOT NULL,
  contenu     TEXT NOT NULL,
  auteur_id   UUID NOT NULL,
  cree_le     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  -- PAS de modifie_le : les notes sont IMMUABLES

  CONSTRAINT fk_notes_dossier FOREIGN KEY (dossier_id) REFERENCES dossiers(id),
  CONSTRAINT fk_notes_auteur FOREIGN KEY (auteur_id) REFERENCES users(id),
  CONSTRAINT chk_notes_contenu CHECK (LENGTH(TRIM(contenu)) > 0)
);

CREATE INDEX idx_notes_dossier ON notes(dossier_id, cree_le DESC);

COMMIT;
```

### 006_create_notifications.sql

```sql
BEGIN;

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinataire_id UUID NOT NULL,
  dossier_id      UUID,
  type            VARCHAR(50) NOT NULL,
  message         TEXT NOT NULL,
  lu              BOOLEAN NOT NULL DEFAULT FALSE,
  lu_le           TIMESTAMP WITH TIME ZONE,
  cree_le         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_notifs_destinataire FOREIGN KEY (destinataire_id) REFERENCES users(id),
  CONSTRAINT fk_notifs_dossier FOREIGN KEY (dossier_id) REFERENCES dossiers(id),
  CONSTRAINT chk_notifs_lu_le CHECK (lu = FALSE OR lu_le IS NOT NULL)
);

CREATE INDEX idx_notifs_destinataire_non_lu ON notifications(destinataire_id, cree_le DESC)
  WHERE lu = FALSE;

COMMIT;
```

### 007_create_audit_logs.sql

```sql
BEGIN;

CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id  UUID,                    -- NULL si action système
  action          VARCHAR(100) NOT NULL,
  entite          VARCHAR(50),
  entite_id       UUID,
  details         JSONB,                   -- Avant/après en JSON
  ip_adresse      INET,
  enregistre_le   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- PAS de clé étrangère sur utilisateur_id intentionnellement
  -- Un log doit survivre à la suppression d'un utilisateur
  CONSTRAINT chk_audit_action CHECK (LENGTH(TRIM(action)) > 0)
);

-- Index pour les consultations fréquentes
CREATE INDEX idx_audit_utilisateur ON audit_logs(utilisateur_id, enregistre_le DESC)
  WHERE utilisateur_id IS NOT NULL;
CREATE INDEX idx_audit_entite ON audit_logs(entite, entite_id, enregistre_le DESC)
  WHERE entite IS NOT NULL;
CREATE INDEX idx_audit_date ON audit_logs(enregistre_le DESC);

-- Partitionnement par mois si le volume devient important (à activer après 6 mois)
-- CREATE TABLE audit_logs_2026_01 PARTITION OF audit_logs
--   FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

COMMIT;
```

### 008_create_types_intervention.sql

```sql
BEGIN;

CREATE TABLE types_intervention (
  id      SERIAL PRIMARY KEY,
  libelle VARCHAR(100) NOT NULL,
  actif   BOOLEAN NOT NULL DEFAULT TRUE,
  ordre   SMALLINT NOT NULL DEFAULT 0,

  CONSTRAINT uq_types_libelle UNIQUE (libelle),
  CONSTRAINT chk_types_libelle CHECK (LENGTH(TRIM(libelle)) > 0)
);

CREATE INDEX idx_types_actif ON types_intervention(ordre) WHERE actif = TRUE;

-- Données initiales
INSERT INTO types_intervention (libelle, ordre) VALUES
  ('Nouveau branchement', 1),
  ('Réclamation facturation', 2),
  ('Coupure de courant', 3),
  ('Panne compteur', 4),
  ('Fraude / vol d''électricité', 5),
  ('Déménagement', 6),
  ('Résiliation', 7),
  ('Autre', 99);

COMMIT;
```

### 009_create_sessions.sql

```sql
BEGIN;

CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id  UUID NOT NULL,
  token_hash      VARCHAR(255) NOT NULL,
  ip_adresse      INET,
  user_agent      TEXT,
  expire_le       TIMESTAMP WITH TIME ZONE NOT NULL,
  cree_le         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  revoque         BOOLEAN NOT NULL DEFAULT FALSE,
  revoque_le      TIMESTAMP WITH TIME ZONE,

  CONSTRAINT fk_sessions_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES users(id),
  CONSTRAINT uq_sessions_token UNIQUE (token_hash)
);

CREATE INDEX idx_sessions_token ON sessions(token_hash) WHERE revoque = FALSE;
CREATE INDEX idx_sessions_user ON sessions(utilisateur_id);
-- Nettoyage automatique des sessions expirées (à faire par cron)
CREATE INDEX idx_sessions_expire ON sessions(expire_le) WHERE revoque = FALSE;

COMMIT;
```

---

## SEED — DONNÉES INITIALES

```sql
-- seeds/001_admin_user.sql
-- Mot de passe temporaire : Admin@2026 (à changer à la première connexion)
-- Hash bcrypt coût 12 généré en dehors de PostgreSQL
INSERT INTO users (nom, prenom, identifiant, mot_de_passe, role, premiere_connexion)
VALUES (
  'Administrateur',
  'Système',
  'admin',
  '$2b$12$HASH_BCRYPT_ICI',   -- Générer avec : bcrypt.hash('Admin@2026', 12)
  'admin',
  TRUE
);
```

---

## REQUÊTES DE DIAGNOSTIC UTILES

```sql
-- Dossiers sans activité depuis plus de 3 jours (hors archivés)
SELECT d.numero, d.nom_client, d.statut, d.modifie_le,
       EXTRACT(DAY FROM NOW() - d.modifie_le) AS jours_inactif
FROM dossiers d
WHERE d.statut NOT IN ('archive', 'valide')
  AND d.modifie_le < NOW() - INTERVAL '3 days'
ORDER BY d.modifie_le ASC;

-- Charge de travail par agent
SELECT u.nom || ' ' || u.prenom AS agent,
       COUNT(d.id) AS total_dossiers,
       COUNT(CASE WHEN d.statut = 'en_instruction' THEN 1 END) AS en_cours
FROM users u
LEFT JOIN dossiers d ON d.assigne_id = u.id AND d.statut != 'archive'
WHERE u.role IN ('bureau', 'superviseur')
GROUP BY u.id, u.nom, u.prenom
ORDER BY total_dossiers DESC;

-- Délai moyen de traitement par type (dossiers archivés)
SELECT type_intervention,
       COUNT(*) AS total,
       ROUND(AVG(EXTRACT(DAY FROM archive_le - cree_le))) AS delai_moyen_jours
FROM dossiers
WHERE statut = 'archive'
GROUP BY type_intervention
ORDER BY delai_moyen_jours DESC;

-- Taille de la base et des tables
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS taille
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## CHECKLIST AVANT DE VALIDER UNE MIGRATION

```
□ La migration commence par BEGIN et finit par COMMIT
□ Toutes les clés étrangères sont déclarées explicitement
□ Toutes les colonnes NOT NULL ont une valeur DEFAULT ou sont obligatoires
□ Les colonnes filtrées ou jointurées ont un index
□ Les contraintes CHECK couvrent les règles métier critiques
□ Le trigger update_modifie_le est créé sur les tables modifiables
□ La migration a été testée sur une copie de la base
□ Les données seeds sont dans un fichier séparé
```
