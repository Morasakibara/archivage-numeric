import { HistoriqueStatut } from '../../types/dossier.types';
import { getStatutConfig } from '../../lib/statuts';
import { formatDateTime } from '../../lib/date';
import { cn } from '../../lib/utils';

interface DossierTimelineProps {
  historique: HistoriqueStatut[];
}

export default function DossierTimeline({ historique }: DossierTimelineProps) {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {historique.map((event, eventIdx) => {
          const config = getStatutConfig(event.statutApres);
          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {eventIdx !== historique.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={cn(
                        config.color,
                        "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                      )}
                    >
                      <div className={cn("h-2.5 w-2.5 rounded-full", config.textColor.replace('text', 'bg'))} />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-500">
                        Statut passé à{' '}
                        <span className={cn("font-medium", config.textColor)}>
                          {config.label}
                        </span>{' '}
                        par <span className="font-medium text-gray-900">{event.effectuePar.prenom} {event.effectuePar.nom}</span>
                      </p>
                      {event.commentaire && (
                        <p className="mt-1 text-sm text-gray-700 italic">
                          "{event.commentaire}"
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-xs text-gray-500">
                      {formatDateTime(event.effectueLe)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
