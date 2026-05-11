-- Seed compte admin initial
-- Mot de passe par défaut : 'Admin@2026!' (à changer à la première connexion)
-- Hash bcrypt généré pour l'exemple (coût 12)
INSERT INTO users (nom, prenom, identifiant, email, mot_de_passe, role, premiere_connexion)
VALUES (
  'ADMIN', 
  'Système', 
  'admin', 
  'admin@archivage-elec.cm', 
  '$2b$12$LQvPHp5/p2R6.h1xU.gUuO.qE.mK.X/5fJ.JvJ.JvJ.JvJ.JvJ.Jv', -- Hash fictif, à remplacer par un vrai hash
  'admin', 
  true
)
ON CONFLICT (identifiant) DO NOTHING;
