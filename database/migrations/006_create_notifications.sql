-- 006_create_notifications.sql
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinataire_id UUID NOT NULL REFERENCES users(id),
  dossier_id      UUID REFERENCES dossiers(id),
  type            VARCHAR(50) NOT NULL,
  message         TEXT NOT NULL,
  lu              BOOLEAN DEFAULT FALSE,
  cree_le         TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifs_destinataire ON notifications(destinataire_id, lu);
