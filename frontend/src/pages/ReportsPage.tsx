import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, PieChart } from 'lucide-react';
import { Button } from '../components/shared/Button';
import apiClient from '../api/client';
import { ApiResponse } from '../types/api.types';

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [types, setTypes] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    statut: '',
    typeIntervention: '',
    dateDebut: '',
    dateFin: '',
  });

  useEffect(() => {
    apiClient.get<ApiResponse<any[]>>('/referentiels/types').then(res => {
      setTypes(res.data.data);
    });
  }, []);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const queryParams = new URLSearchParams(filters as any).toString();
      const response = await apiClient.get(`/reports/export/csv?${queryParams}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport_dossiers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors de l''export CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rapports & Exportations</h1>
        <p className="text-gray-500">Générez des rapports détaillés sur l'activité d'archivage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Filtres d'export */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border space-y-6">
          <h3 className="font-bold text-gray-900 flex items-center space-x-2">
            <Filter size={18} className="text-blue-600" />
            <span>Filtres de génération</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Statut</label>
              <select 
                className="w-full border rounded-md p-2 text-sm bg-white"
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              >
                <option value="">Tous les statuts</option>
                <option value="nouveau">Nouveau</option>
                <option value="en_instruction">En instruction</option>
                <option value="valide">Validé</option>
                <option value="rejete">Rejeté</option>
                <option value="archive">Archivé</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Type d'intervention</label>
              <select 
                className="w-full border rounded-md p-2 text-sm bg-white"
                value={filters.typeIntervention}
                onChange={(e) => setFilters({ ...filters, typeIntervention: e.target.value })}
              >
                <option value="">Tous les types</option>
                {types.map(t => (
                  <option key={t.id} value={t.libelle}>{t.libelle}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Date début</label>
              <input 
                type="date"
                className="w-full border rounded-md p-2 text-sm bg-white"
                value={filters.dateDebut}
                onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Date fin</label>
              <input 
                type="date"
                className="w-full border rounded-md p-2 text-sm bg-white"
                value={filters.dateFin}
                onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 border-t flex space-x-4">
            <Button 
              onClick={handleExportCsv} 
              isLoading={isExporting}
              className="flex items-center space-x-2"
            >
              <Download size={18} />
              <span>Exporter en CSV (Excel)</span>
            </Button>
          </div>
        </div>

        {/* Rapports prédéfinis */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-6 text-white space-y-6">
          <h3 className="font-bold flex items-center space-x-2">
            <FileText size={18} />
            <span>Rapports rapides</span>
          </h3>
          
          <div className="space-y-3">
            <button className="w-full bg-white/10 hover:bg-white/20 transition-colors p-3 rounded-lg text-left text-sm flex items-center justify-between group">
              <span>Dossiers validés ce mois</span>
              <Download size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="w-full bg-white/10 hover:bg-white/20 transition-colors p-3 rounded-lg text-left text-sm flex items-center justify-between group">
              <span>Performance par agent</span>
              <PieChart size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="w-full bg-white/10 hover:bg-white/20 transition-colors p-3 rounded-lg text-left text-sm flex items-center justify-between group">
              <span>Inventaire des archives</span>
              <FileText size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          <div className="pt-4 border-t border-white/20 text-xs opacity-70">
            <p>Les rapports sont générés en temps réel à partir des données de production.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
