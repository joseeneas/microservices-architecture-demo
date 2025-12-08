import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  children: ReactNode;
}

export const Layout = ({ activeTab, onTabChange, children }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
