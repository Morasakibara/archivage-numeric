-- 001_create_users.sql
CREATE TYPE user_role AS ENUM ('terrain', 'bureau', 'superviseur', 'admin');

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom           VARCHAR(100) NOT NULL,
  prenom        VARCHAR(100) NOT NULL,
  identifiant   VARCHAR(50) UNIQUE NOT NULL,
  email         VARCHAR(150) UNIQUE,
  mot_de_passe  VARCHAR(255) NOT NULL,
  role          user_role NOT NULL,
  actif         BOOLEAN DEFAULT TRUE,
  premiere_connexion BOOLEAN DEFAULT TRUE,
  tentatives_echec   INTEGER DEFAULT 0,
  bloque        BOOLEAN DEFAULT FALSE,
  cree_le       TIMESTAMP DEFAULT NOW(),
  modifie_le    TIMESTAMP DEFAULT NOW()
);
