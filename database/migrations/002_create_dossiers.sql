-- 002_create_dossiers.sql
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
  numero            VARCHAR(20) UNIQUE NOT NULL,
  nom_client        VARCHAR(200) NOT NULL,
  telephone_client  VARCHAR(20),
  numero_compteur   VARCHAR(50) NOT NULL,
  type_intervention VARCHAR(100) NOT NULL,
  priorite          priorite_dossier DEFAULT 'normale',
  description       TEXT,
  statut            statut_dossier DEFAULT 'nouveau',
  createur_id       UUID NOT NULL REFERENCES users(id),
  assigne_id        UUID REFERENCES users(id),
  motif_rejet       TEXT,
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
