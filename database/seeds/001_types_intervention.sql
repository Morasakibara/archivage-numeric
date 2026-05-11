-- Seed types d'intervention
INSERT INTO types_intervention (libelle, actif, ordre) VALUES
('Nouveau branchement', true, 1),
('Réclamation facturation', true, 2),
('Coupure de courant', true, 3),
('Panne compteur', true, 4),
('Fraude / vol d''électricité', true, 5),
('Déménagement', true, 6),
('Résiliation', true, 7),
('Autre', true, 8)
ON CONFLICT (libelle) DO NOTHING;
