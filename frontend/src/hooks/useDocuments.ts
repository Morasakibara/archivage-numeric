import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api/documents.api';

export function useDocuments(dossierId: string) {
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ['documents', dossierId],
    queryFn: () => documentsApi.findByDossier(dossierId),
    enabled: !!dossierId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentsApi.upload(dossierId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', dossierId] });
    },
  });

  const invalidateMutation = useMutation({
    mutationFn: (documentId: string) => documentsApi.invalidate(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', dossierId] });
    },
  });

  return {
    documents: documentsQuery.data?.data || [],
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    invalidate: invalidateMutation.mutate,
  };
}
