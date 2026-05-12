import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dossiersApi } from '../../api/dossiers.api';
import { documentsApi } from '../../api/documents.api';
import { notesApi } from '../../api/notes.api';
import { getStatutConfig } from '../../lib/statuts';
import { formatDate } from '../../lib/date';
import { Calendar, User, Hash, Tag, FileText, MessageSquare, History } from 'lucide-react';
import DocumentGrid from '../../components/documents/DocumentGrid';
import DocumentUpload from '../../components/documents/DocumentUpload';
import NotesList from '../../components/notes/NotesList';
import NoteForm from '../../components/notes/NoteForm';
import DossierTimeline from '../../components/dossiers/DossierTimeline';
import { useAuthStore } from '../../store/auth.store';
import apiClient from '../../api/client';
import { ApiResponse } from '../../types/api.types';
import { HistoriqueStatut } from '../../types/dossier.types';

export default function DossierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const { data: dossierData, isLoading: isLoadingDossier } = useQuery({
    queryKey: ['dossier', id],
    queryFn: () => dossiersApi.getOne(id!),
  });

  const { data: docsData, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentsApi.findByDossier(id!),
  });

  const { data: notesData, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => notesApi.findByDossier(id!),
  });

  const { data: histData, isLoading: isLoadingHist } = useQuery({
    queryKey: ['historique', id],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<HistoriqueStatut[]>>(`/dossiers/${id}/historique`);
      return res.data;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentsApi.upload(id!, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents', id] }),
  });

  const noteMutation = useMutation({
    mutationFn: (contenu: string) => notesApi.create(id!, contenu),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', id] }),
  });

  if (isLoadingDossier) return <div className="p-8 text-center text-gray-500">Chargement du dossier...</div>;
  if (!dossierData) return <div className="p-8 text-center text-red-500">Dossier introuvable</div>;

  const dossier = dossierData.data;
  const statusConfig = getStatutConfig(dossier.statut);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{dossier.numero}</h1>
            <p className="text-gray-500">{dossier.nomClient}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.color} ${statusConfig.textColor}`}>
            {statusConfig.label}
          </span>
          {/* Boutons d'actions de statut viendront ici */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infos & Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fiche Infos */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="font-bold text-gray-900 flex items-center space-x-2">
                <Tag size={18} />
                <span>Informations générales</span>
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Hash className="mr-3 text-gray-400" size={16} />
                  <span className="w-32">Compteur :</span>
                  <span className="font-semibold text-gray-900">{dossier.numeroCompteur}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="mr-3 text-gray-400" size={16} />
                  <span className="w-32">Créé le :</span>
                  <span className="font-semibold text-gray-900">{formatDate(dossier.creeLe)}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <User className="mr-3 text-gray-400" size={16} />
                  <span className="w-32">Créateur :</span>
                  <span className="font-semibold text-gray-900">{dossier.createur.prenom} {dossier.createur.nom}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FileText className="mr-3 text-gray-400" size={16} />
                  <span className="w-32">Intervention :</span>
                  <span className="font-semibold text-gray-900">{dossier.typeIntervention}</span>
                </div>
              </div>
              {dossier.description && (
                <div className="col-span-full pt-4 border-t mt-2">
                  <p className="text-gray-500 mb-1">Description :</p>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{dossier.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center space-x-2">
                <ImageIcon size={18} />
                <span>Documents & Photos</span>
              </h2>
              <DocumentUpload
                onUpload={(file) => uploadMutation.mutate(file)}
                isLoading={uploadMutation.isPending}
              />
            </div>
            <div className="p-6">
              <DocumentGrid
                documents={docsData?.data || []}
                canInvalidate={currentUser?.role === 'superviseur' || currentUser?.role === 'admin'}
                onInvalidate={(docId) => documentsApi.invalidate(docId).then(() => queryClient.invalidateQueries({ queryKey: ['documents', id] }))}
              />
            </div>
          </div>
        </div>

        {/* Notes & Timeline */}
        <div className="space-y-6">
          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-[500px]">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="font-bold text-gray-900 flex items-center space-x-2">
                <MessageSquare size={18} />
                <span>Notes internes</span>
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <NotesList notes={notesData?.data || []} />
            </div>
            <div className="p-4 border-t bg-gray-50">
              <NoteForm
                onSubmit={(content) => noteMutation.mutate(content)}
                isLoading={noteMutation.isPending}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="font-bold text-gray-900 flex items-center space-x-2">
                <History size={18} />
                <span>Historique des statuts</span>
              </h2>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto">
              <DossierTimeline historique={histData?.data || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-importing missing Icon
import { Image as ImageIcon } from 'lucide-react';
