import { useState } from 'react';
import { Bell, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useNotificationsStore } from '../../store/notifications.store';
import NotificationsDrawer from './NotificationsDrawer';

export default function Topbar() {
  const { user } = useAuthStore();
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-8 relative z-40">
      <div className="text-gray-500 font-medium">
        Système d'archivage numérique
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 text-gray-400 hover:text-blue-600 relative rounded-full hover:bg-gray-50 transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
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

      <NotificationsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </header>
  );
}
