export type StatutDossier =
  | 'nouveau'
  | 'en_instruction'
  | 'en_attente_client'
  | 'en_attente_validation'
  | 'valide'
  | 'rejete'
  | 'archive';

export type PrioriteDossier = 'normale' | 'urgente';

export interface Dossier {
  id: string;
  numero: string;
  nomClient: string;
  telephoneClient?: string;
  numeroCompteur: string;
  typeIntervention: string;
  priorite: PrioriteDossier;
  description?: string;
  statut: StatutDossier;
  createurId: string;
  assigneId?: string;
  motifRejet?: string;
  creeLe: string;
  modifieLe: string;
  archiveLe?: string;
}

export interface HistoriqueStatut {
  id: string;
  dossierId: string;
  statutAvant: StatutDossier | null;
  statutApres: StatutDossier;
  commentaire?: string;
  effectuePar: {
    nom: string;
    prenom: string;
  };
  effectueLe: string;
}

export interface DossierListItem extends Dossier {
  createur: {
    nom: string;
    prenom: string;
  };
  assigne?: {
    nom: string;
    prenom: string;
  };
}
