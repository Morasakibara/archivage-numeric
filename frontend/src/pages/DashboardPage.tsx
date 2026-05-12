import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { ApiResponse } from '../../types/api.types';
import { FolderOpen, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { formatDate } from '../../lib/date';

interface Stats {
  total: number;
  nouveaux: number;
  enInstruction: number;
  valides: number;
  rejetes: number;
  parType: { type: string; count: number }[];
  activiteRecente: { date: string; count: number }[];
}

export default function DashboardPage() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Stats>>('/dossiers/stats');
      return res.data;
    },
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Chargement des statistiques...</div>;

  const stats = statsData?.data;

  const cards = [
    { label: 'Total Dossiers', value: stats?.total || 0, icon: FolderOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Nouveaux', value: stats?.nouveaux || 0, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'En Instruction', value: stats?.enInstruction || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Validés', value: stats?.valides || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500">Vue d'ensemble de l'activité d'archivage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4">
            <div className={`h-12 w-12 ${card.bg} ${card.color} rounded-lg flex items-center justify-center`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par type */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <TrendingUp size={18} className="text-blue-600" />
            <span>Répartition par type d'intervention</span>
          </h3>
          <div className="space-y-4">
            {stats?.parType.map((item) => (
              <div key={item.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.type}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(item.count / (stats.total || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Clock size={18} className="text-blue-600" />
            <span>Dossiers créés (7 derniers jours)</span>
          </h3>
          <div className="flex items-end justify-between h-48 pt-4">
            {stats?.activiteRecente.map((day) => (
              <div key={day.date} className="flex flex-col items-center flex-1">
                <div 
                  className="w-8 bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors"
                  style={{ height: `${(day.count / (Math.max(...stats.activiteRecente.map(d => d.count)) || 1)) * 100}%` }}
                />
                <span className="text-[10px] text-gray-500 mt-2 rotate-45 md:rotate-0">
                  {formatDate(day.date, 'dd/MM')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
