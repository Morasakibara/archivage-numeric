-- 004_create_historique_statuts.sql
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
