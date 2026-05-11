-- 008_create_types_intervention.sql
CREATE TABLE types_intervention (
  id      SERIAL PRIMARY KEY,
  libelle VARCHAR(100) UNIQUE NOT NULL,
  actif   BOOLEAN DEFAULT TRUE,
  ordre   INTEGER DEFAULT 0
);
