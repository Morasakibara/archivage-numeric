import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { dossiersApi } from '../../api/dossiers.api';
import { getStatutConfig, STATUTS_CONFIG } from '../../lib/statuts';
import { formatDateTime } from '../../lib/date';
import { Search, Filter, Plus, Download, X } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Parser } from 'json2csv';
import { cn } from '../../lib/utils';
import apiClient from '../../api/client';
import { ApiResponse } from '../../types/api.types';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';

export default function DossiersListPage() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [types, setTypes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [params, setParams] = useState({
    page: 1,
    q: '',
    statut: '',
    typeIntervention: '',
    priorite: '',
  });

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    setParams(p => ({ ...p, q: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  useEffect(() => {
    apiClient.get<ApiResponse<any[]>>('/referentiels/types').then(res => {
      setTypes(res.data.data);
    });
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['dossiers', params],
    queryFn: () => dossiersApi.search(params),
  });

  const dossiers = data?.data?.items || [];

  const handleExport = () => {
    try {
      const fields = ['numero', 'nomClient', 'numeroCompteur', 'typeIntervention', 'statut', 'priorite', 'creeLe'];
      const parser = new Parser({ fields });
      const csv = parser.parse(dossiers);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dossiers_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setParams({
      page: 1,
      q: '',
      statut: '',
      typeIntervention: '',
      priorite: '',
    });
  };

  const activeFiltersCount = [params.statut, params.typeIntervention, params.priorite].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dossiers</h1>
          <p className="text-gray-500">Gérez et recherchez les dossiers clients</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExport} className="flex items-center space-x-2">
            <Download size={18} />
            <span>Exporter</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Plus size={18} />
            <span>Nouveau dossier</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par numéro, nom client, compteur..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant={showFilters ? 'primary' : 'outline'} 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 w-full md:w-auto justify-center relative"
          >
            <Filter size={18} />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white font-bold">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          {activeFiltersCount > 0 && (
            <button onClick={resetFilters} className="text-sm text-gray-500 hover:text-red-600 flex items-center space-x-1">
              <X size={14} />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>

        {showFilters && (
          <div className="p-4 bg-gray-50 border-b grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</label>
              <select 
                className="w-full border rounded-md p-2 text-sm bg-white"
                value={params.statut}
                onChange={(e) => setParams({ ...params, statut: e.target.value, page: 1 })}
              >
                <option value="">Tous les statuts</option>
                {Object.entries(STATUTS_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type d'intervention</label>
              <select 
                className="w-full border rounded-md p-2 text-sm bg-white"
                value={params.typeIntervention}
                onChange={(e) => setParams({ ...params, typeIntervention: e.target.value, page: 1 })}
              >
                <option value="">Tous les types</option>
                {types.map(t => (
                  <option key={t.id} value={t.libelle}>{t.libelle}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Priorité</label>
              <select 
                className="w-full border rounded-md p-2 text-sm bg-white"
                value={params.priorite}
                onChange={(e) => setParams({ ...params, priorite: e.target.value, page: 1 })}
              >
                <option value="">Toutes les priorités</option>
                <option value="normale">Normale</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-900">Numéro</th>
                <th className="px-6 py-3 font-semibold text-gray-900">Client</th>
                <th className="px-6 py-3 font-semibold text-gray-900">Type</th>
                <th className="px-6 py-3 font-semibold text-gray-900">Statut</th>
                <th className="px-6 py-3 font-semibold text-gray-900 text-center">Priorité</th>
                <th className="px-6 py-3 font-semibold text-gray-900">Date création</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Chargement...</td>
                </tr>
              ) : dossiers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucun dossier trouvé</td>
                </tr>
              ) : (
                dossiers.map((dossier) => {
                  const config = getStatutConfig(dossier.statut);
                  return (
                    <tr 
                      key={dossier.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dossiers/${dossier.id}`)}
                    >
                      <td className="px-6 py-4 font-medium text-blue-600">{dossier.numero}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{dossier.nomClient}</div>
                        <div className="text-xs text-gray-500">Compteur: {dossier.numeroCompteur}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{dossier.typeIntervention}</td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", config.color, config.textColor)}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {dossier.priorite === 'urgente' ? (
                          <span className="text-red-600 text-xs font-bold uppercase ring-1 ring-red-100 px-1.5 py-0.5 rounded bg-red-50 italic">Urgente</span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Normale</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDateTime(dossier.creeLe)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
