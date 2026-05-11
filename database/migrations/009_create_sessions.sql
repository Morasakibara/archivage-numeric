-- 009_create_sessions.sql
CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id  UUID NOT NULL REFERENCES users(id),
  token_hash      VARCHAR(255) NOT NULL,
  ip_adresse      INET,
  user_agent      TEXT,
  expire_le       TIMESTAMP NOT NULL,
  cree_le         TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_user ON sessions(utilisateur_id);
