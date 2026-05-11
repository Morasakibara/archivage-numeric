import { StatutDossier } from '../types/dossier.types';

export const STATUTS_CONFIG: Record<
  StatutDossier,
  { label: string; color: string; textColor: string }
> = {
  nouveau: {
    label: 'Nouveau',
    color: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  en_instruction: {
    label: 'En instruction',
    color: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  en_attente_client: {
    label: 'En attente client',
    color: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
  en_attente_validation: {
    label: 'En attente validation',
    color: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  valide: {
    label: 'Validé',
    color: 'bg-green-100',
    textColor: 'text-green-800',
  },
  rejete: {
    label: 'Rejeté',
    color: 'bg-red-100',
    textColor: 'text-red-800',
  },
  archive: {
    label: 'Archivé',
    color: 'bg-gray-100',
    textColor: 'text-gray-600',
  },
};

export function getStatutConfig(statut: StatutDossier) {
  return STATUTS_CONFIG[statut];
}
