-- 005_create_notes.sql
CREATE TABLE notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id  UUID NOT NULL REFERENCES dossiers(id),
  contenu     TEXT NOT NULL,
  auteur_id   UUID NOT NULL REFERENCES users(id),
  cree_le     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notes_dossier ON notes(dossier_id);
