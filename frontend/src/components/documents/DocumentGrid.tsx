import { useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { Document } from '../../api/documents.api';
import DocumentViewer from './DocumentViewer';
import { formatDate } from '../../lib/date';

interface DocumentGridProps {
  documents: Document[];
  onInvalidate?: (id: string) => void;
  canInvalidate?: boolean;
}

export default function DocumentGrid({ documents, onInvalidate, canInvalidate }: DocumentGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {documents.map((doc) => (
        <div key={doc.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Placeholder miniature - En vrai on chargerait une miniature signée */}
            <span className="text-gray-400 text-xs text-center px-2">{doc.nomFichier}</span>
          </div>
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
            <button
              onClick={() => setSelectedId(doc.id)}
              className="p-2 bg-white text-gray-900 rounded-full hover:bg-blue-50"
              title="Voir"
            >
              <Eye size={18} />
            </button>
            {canInvalidate && (
              <button
                onClick={() => onInvalidate?.(doc.id)}
                className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50"
                title="Marquer comme invalide"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-[10px] truncate">
            {formatDate(doc.uploadeLe, 'dd/MM/yyyy')}
          </div>
        </div>
      ))}

      {selectedId && (
        <DocumentViewer
          documentId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
