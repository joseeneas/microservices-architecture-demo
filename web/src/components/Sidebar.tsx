import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'inventory', label: 'Inventory', icon: '📊' },
  ];

  return (
    <div className="flex flex-col h-screen w-64 bg-brand border-r border-slate-800 text-onBrand">
      {/* Logo/Brand */}
      <div className="p-8 border-b border-slate-800 bg-brand">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm mt-1">Microservices Demo</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 pt-8 pb-8 space-y-4">
        {navItems.map((item) => (
          <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
          activeTab === item.id
            ? 'bg-blue-600 text-onBrand shadow-lg'
            : 'text-onBrand hover:bg-gray-800 hover:text-onBrand'
        }`}
          >
        <span className="text-2xl">{item.icon}</span>
        <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-8 border-t border-slate-800">
        <div className="mb-4">
          <p className="text-sm text-onBrand">Signed in as</p>
          <p className="font-medium text-onBrand truncate">{user?.email}</p>
          <p className="text-xs text-onBrand mt-1">
            Role: <span className="text-onBrand font-medium">{user?.role}</span>
          </p>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
