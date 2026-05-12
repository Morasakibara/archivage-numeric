import { useState } from 'react';
import { Check, X, Archive, ArrowRight, MessageSquare } from 'lucide-react';
import { Button } from '../shared/Button';
import { StatutDossier } from '../../types/dossier.types';
import { Role } from '../../types/user.types';
import { transitionAutorisee } from '../../../backend/src/modules/statuts/statuts-transitions'; // Oops, cannot import from backend in frontend directly easily due to TS config, I'll redefine it or copy it.

// Redéfinition locale car le partage de code monorepo n'est pas encore configuré proprement pour les imports croisés
export const TRANSITIONS: Record<string, StatutDossier[]> = {
  nouveau: ['en_instruction'],
  en_instruction: ['en_attente_client', 'en_attente_validation'],
  en_attente_client: ['en_instruction'],
  en_attente_validation: ['valide', 'rejete'],
  rejete: ['en_instruction'],
  valide: ['archive'],
};

interface DossierActionsProps {
  currentStatut: StatutDossier;
  userRole: Role;
  onAction: (nouveauStatut: StatutDossier, commentaire?: string) => void;
  isLoading?: boolean;
}

export default function DossierActions({ currentStatut, userRole, onAction, isLoading }: DossierActionsProps) {
  const [showRejetModal, setShowRejetModal] = useState(false);
  const [motifRejet, setMotifRejet] = useState('');

  const getPossibleTransitions = () => {
    const targets = TRANSITIONS[currentStatut] || [];
    
    // Filtrage par rôle (logique simplifiée pour le front)
    if (userRole === 'terrain') return [];
    if (userRole === 'bureau') return targets.filter(t => ['en_instruction', 'en_attente_client', 'en_attente_validation'].includes(t));
    if (userRole === 'superviseur' || userRole === 'admin') return targets;
    
    return [];
  };

  const transitions = getPossibleTransitions();

  if (transitions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {transitions.map((target) => {
        if (target === 'rejete') {
          return (
            <Button
              key={target}
              variant="danger"
              onClick={() => setShowRejetModal(true)}
              isLoading={isLoading}
              className="flex items-center space-x-2"
            >
              <X size={16} />
              <span>Rejeter</span>
            </Button>
          );
        }

        if (target === 'valide') {
          return (
            <Button
              key={target}
              variant="primary"
              onClick={() => onAction('valide')}
              isLoading={isLoading}
              className="bg-green-600 hover:bg-green-700 border-green-600 flex items-center space-x-2"
            >
              <Check size={16} />
              <span>Valider le dossier</span>
            </Button>
          );
        }

        if (target === 'archive') {
          return (
            <Button
              key={target}
              variant="secondary"
              onClick={() => onAction('archive')}
              isLoading={isLoading}
              className="flex items-center space-x-2"
            >
              <Archive size={16} />
              <span>Archiver</span>
            </Button>
          );
        }

        return (
          <Button
            key={target}
            variant="outline"
            onClick={() => onAction(target)}
            isLoading={isLoading}
            className="flex items-center space-x-2"
          >
            <ArrowRight size={16} />
            <span className="capitalize">{target.replace('_', ' ')}</span>
          </Button>
        );
      })}

      {showRejetModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Motif de rejet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Veuillez indiquer précisément pourquoi ce dossier est rejeté (min. 20 caractères).
            </p>
            <textarea
              className="w-full border rounded-lg p-3 text-sm min-h-[120px] mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: Le document X est illisible, veuillez reprendre la photo..."
              value={motifRejet}
              onChange={(e) => setMotifRejet(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setShowRejetModal(false)}>Annuler</Button>
              <Button 
                variant="danger" 
                disabled={motifRejet.length < 20} 
                onClick={() => {
                  onAction('rejete', motifRejet);
                  setShowRejetModal(false);
                }}
              >
                Confirmer le rejet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
