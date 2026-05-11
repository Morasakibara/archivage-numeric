-- 003_create_documents.sql
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id      UUID NOT NULL REFERENCES dossiers(id),
  nom_fichier     VARCHAR(255) NOT NULL,
  chemin_stockage VARCHAR(500) NOT NULL,
  taille_octets   INTEGER,
  type_mime       VARCHAR(50),
  ordre           INTEGER DEFAULT 1,
  valide          BOOLEAN DEFAULT TRUE,
  uploade_par     UUID NOT NULL REFERENCES users(id),
  uploade_le      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_dossier ON documents(dossier_id);
