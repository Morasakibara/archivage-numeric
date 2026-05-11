-- 007_create_audit_logs.sql
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id UUID REFERENCES users(id),
  action        VARCHAR(100) NOT NULL,
  entite        VARCHAR(50),
  entite_id     UUID,
  details       JSONB,
  ip_adresse    INET,
  enregistre_le TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_utilisateur ON audit_logs(utilisateur_id);
CREATE INDEX idx_audit_entite ON audit_logs(entite, entite_id);
CREATE INDEX idx_audit_date ON audit_logs(enregistre_le);
