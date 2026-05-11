import { Role } from '../../common/types/roles.enum';
import { StatutDossier } from '../../common/types/statuts.enum';

/**
 * Définit quelles transitions sont autorisées et par quel rôle.
 * Toute transition non listée ici est interdite.
 */
export const TRANSITIONS_AUTORISEES: Record<
  StatutDossier,
  { vers: StatutDossier[]; roles: Role[] }[]
> = {
  [StatutDossier.NOUVEAU]: [
    {
      vers: [StatutDossier.EN_INSTRUCTION],
      roles: [Role.BUREAU, Role.SUPERVISEUR, Role.ADMIN],
    },
  ],
  [StatutDossier.EN_INSTRUCTION]: [
    {
      vers: [StatutDossier.EN_ATTENTE_CLIENT, StatutDossier.EN_ATTENTE_VALIDATION],
      roles: [Role.BUREAU, Role.SUPERVISEUR, Role.ADMIN],
    },
  ],
  [StatutDossier.EN_ATTENTE_CLIENT]: [
    {
      vers: [StatutDossier.EN_INSTRUCTION],
      roles: [Role.BUREAU, Role.SUPERVISEUR, Role.ADMIN],
    },
  ],
  [StatutDossier.EN_ATTENTE_VALIDATION]: [
    {
      vers: [StatutDossier.VALIDE, StatutDossier.REJETE],
      roles: [Role.SUPERVISEUR, Role.ADMIN],
    },
  ],
  [StatutDossier.REJETE]: [
    {
      vers: [StatutDossier.EN_INSTRUCTION],
      roles: [Role.BUREAU, Role.SUPERVISEUR, Role.ADMIN],
    },
  ],
  [StatutDossier.VALIDE]: [
    {
      vers: [StatutDossier.ARCHIVE],
      roles: [Role.SUPERVISEUR, Role.ADMIN],
    },
  ],
  [StatutDossier.ARCHIVE]: [], // Aucune transition depuis ARCHIVE — état final
};

export function transitionAutorisee(
  statutActuel: StatutDossier,
  statutCible: StatutDossier,
  roleUtilisateur: Role,
): boolean {
  const transitions = TRANSITIONS_AUTORISEES[statutActuel];
  if (!transitions) return false;
  return transitions.some(
    (t) => t.vers.includes(statutCible) && t.roles.includes(roleUtilisateur),
  );
}
