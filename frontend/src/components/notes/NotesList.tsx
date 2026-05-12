import { Note } from '../../api/notes.api';
import { formatDateTime } from '../../lib/date';
import { User } from 'lucide-react';

interface NotesListProps {
  notes: Note[];
}

export default function NotesList({ notes }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 italic">
        Aucune note pour le moment
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="flex space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
            <User size={16} />
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-900">
                {note.auteur.prenom} {note.auteur.nom}
              </span>
              <span className="text-[10px] text-gray-500">
                {formatDateTime(note.creeLe)}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.contenu}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
