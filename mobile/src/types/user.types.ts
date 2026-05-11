export type Role = 'terrain' | 'bureau' | 'superviseur' | 'admin';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  role: Role;
  premiereConnexion: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
