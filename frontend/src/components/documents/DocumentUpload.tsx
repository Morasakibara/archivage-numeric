import { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '../shared/Button';

interface DocumentUploadProps {
  onUpload: (file: File) => void;
  isLoading?: boolean;
}

export default function DocumentUpload({ onUpload, isLoading }: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png"
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        isLoading={isLoading}
        className="flex items-center space-x-2"
      >
        <Upload size={18} />
        <span>Ajouter une photo</span>
      </Button>
    </div>
  );
}
