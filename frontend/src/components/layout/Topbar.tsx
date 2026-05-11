import { Bell, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

export default function Topbar() {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-8">
      <div className="text-gray-500 font-medium">
        Système d'archivage numérique
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-blue-600 relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center space-x-3 pl-4 border-l">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">{user?.prenom} {user?.nom}</div>
            <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <UserIcon size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
