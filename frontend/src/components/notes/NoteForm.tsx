import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../shared/Button';

interface NoteFormProps {
  onSubmit: (contenu: string) => void;
  isLoading?: boolean;
}

export default function NoteForm({ onSubmit, isLoading }: NoteFormProps) {
  const [contenu, setContenu] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contenu.trim()) {
      onSubmit(contenu);
      setContenu('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        placeholder="Ajouter une note interne..."
        className="w-full min-h-[80px] p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        disabled={isLoading}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!contenu.trim() || isLoading}
          isLoading={isLoading}
          className="flex items-center space-x-2"
        >
          <Send size={16} />
          <span>Envoyer</span>
        </Button>
      </div>
    </form>
  );
}
