import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { documentsApi } from '../../api/documents.api';

interface DocumentViewerProps {
  documentId: string;
  onClose: () => void;
}

export default function DocumentViewer({ documentId, onClose }: DocumentViewerProps) {
  const [url, setUrl] = useState<string>('');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (documentId) {
      documentsApi.getPresignedUrl(documentId).then((res) => {
        setUrl(res.data);
      });
    }
  }, [documentId]);

  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="h-16 flex items-center justify-between px-6 text-white border-b border-white/10">
        <span className="font-medium text-sm">Visualisation du document</span>
        <div className="flex items-center space-x-4">
          <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))} className="p-2 hover:bg-white/10 rounded-full">
            <ZoomOut size={20} />
          </button>
          <button onClick={() => setZoom(prev => Math.min(3, prev + 0.2))} className="p-2 hover:bg-white/10 rounded-full">
            <ZoomIn size={20} />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full ml-4">
            <X size={24} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <img
          src={url}
          alt="Document"
          style={{ transform: `scale(${zoom})` }}
          className="max-h-full transition-transform duration-200 shadow-2xl"
        />
      </div>
    </div>
  );
}
