import { X, CheckCircle, Bell, Info } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDateTime } from '../../lib/date';
import { cn } from '../../lib/utils';
import { Button } from '../shared/Button';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
  const { notifications, markAsRead, markAllAsRead, isLoading } = useNotifications();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            {notifications.filter(n => !n.lu).length} non lues
          </span>
          {notifications.some(n => !n.lu) && (
            <button 
              onClick={() => markAllAsRead()} 
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Bell size={40} className="mx-auto mb-3 opacity-20" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={cn(
                    "p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group",
                    !notif.lu && "bg-blue-50/50"
                  )}
                  onClick={() => !notif.lu && markAsRead(notif.id)}
                >
                  <div className="flex space-x-3">
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                      notif.type === 'changement_statut' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                    )}>
                      {notif.type === 'changement_statut' ? <Info size={16} /> : <Bell size={16} />}
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-sm text-gray-800", !notif.lu && "font-semibold")}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {formatDateTime(notif.creeLe)}
                      </p>
                    </div>
                    {!notif.lu && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
