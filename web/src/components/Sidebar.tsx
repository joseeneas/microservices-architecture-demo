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
    <div className="flex flex-col h-screen w-64 bg-brand border-r border-slate-800 text-onBrand overflow-y-auto pb-6">
      {/* Logo/Brand */}
      <div className="sticky top-0 z-10 p-8 border-b border-slate-800 bg-brand">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm mt-1">Microservices Demo</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pt-8 pb-8" role="navigation" aria-label="Main Navigation">
        {navItems.map((item) => (
          <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xxl transition-all mb-2 ${
          activeTab === item.id
            ? 'bg-neutral-bg text-onSurface shadow-lg rounded-xxl'
            : 'text-onBrand hover:bg-gray-800 rounded-xxl'
        }`}
          >
        <span className="text-2xl">{item.icon}</span>
        <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="mt-auto p-8 pt-6 pb-16 border-t border-slate-800">
        <div className="mb-auto">
          <p className="text-sm font-small text-onBrand">Signed in as {user?.email}{' '}
            Role: <span className="text-onBrand font-small">{user?.role}</span>
          </p>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
        >
          Logout
        </button>
        <div className="mt-4 text-center text-onBrand/70 text-xs" aria-label="App version">
          v1.0 • Demo
        </div>
      </div>
    </div>
  );
};
