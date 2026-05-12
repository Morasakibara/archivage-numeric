import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, FileText, Users, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { cn } from '../../lib/utils';

const MENU_ITEMS = [
  { label: 'Tableau de bord', icon: LayoutDashboard, href: '/dashboard', roles: ['superviseur', 'admin'] },
  { label: 'Dossiers', icon: FolderOpen, href: '/dossiers', roles: ['terrain', 'bureau', 'superviseur', 'admin'] },
  { label: 'Rapports', icon: FileText, href: '/rapports', roles: ['superviseur', 'admin'] },
  { label: 'Utilisateurs', icon: Users, href: '/admin/users', roles: ['admin'] },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const filteredMenu = MENU_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-xl font-bold text-blue-600">Archivage Élec</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2 w-full text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
