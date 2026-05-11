import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { dossiersApi } from '../../api/dossiers.api';
import { getStatutConfig } from '../../lib/statuts';
import { formatDateTime } from '../../lib/date';
import { Search, Filter, Plus } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';

export default function DossiersListPage() {
  const [params, setParams] = useState({ page: 1, q: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['dossiers', params],
    queryFn: () => dossiersApi.search(params),
  });

  const dossiers = data?.data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dossiers</h1>
          <p className="text-gray-500">Gérez et recherchez les dossiers clients</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus size={18} />
          <span>Nouveau dossier</span>
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par numéro, nom client, compteur..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={params.q}
            onChange={(e) => setParams({ ...params, q: e.target.value })}
          />
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <Filter size={18} />
          <span>Filtres</span>
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-900">Numéro</th>
              <th className="px-6 py-3 font-semibold text-gray-900">Client</th>
              <th className="px-6 py-3 font-semibold text-gray-900">Type</th>
              <th className="px-6 py-3 font-semibold text-gray-900">Statut</th>
              <th className="px-6 py-3 font-semibold text-gray-900">Date création</th>
              <th className="px-6 py-3 font-semibold text-gray-900">Créateur</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Chargement des dossiers...
                </td>
              </tr>
            ) : dossiers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Aucun dossier trouvé
                </td>
              </tr>
            ) : (
              dossiers.map((dossier) => {
                const config = getStatutConfig(dossier.statut);
                return (
                  <tr key={dossier.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-medium text-blue-600">{dossier.numero}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{dossier.nomClient}</div>
                      <div className="text-xs text-gray-500">Compteur: {dossier.numeroCompteur}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{dossier.typeIntervention}</td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.color, config.textColor)}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDateTime(dossier.creeLe)}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {dossier.createur.prenom} {dossier.createur.nom}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
