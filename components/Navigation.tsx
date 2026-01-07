
import React from 'react';
import { Home, List, BarChart3, Users } from 'lucide-react';
import { AppTab } from '../types';

interface NavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="flex items-center gap-2 bg-white/10 p-1 rounded-xl backdrop-blur-sm self-start md:self-auto">
      <button
        onClick={() => onTabChange('home')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
          activeTab === 'home' ? 'bg-white text-[#27335c]' : 'text-slate-300 hover:text-white hover:bg-white/5'
        }`}
      >
        <Home size={16} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-tight hidden sm:block">Home</span>
      </button>

      <button
        onClick={() => onTabChange('orders')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
          activeTab === 'orders' ? 'bg-white text-[#27335c]' : 'text-slate-300 hover:text-white hover:bg-white/5'
        }`}
      >
        <List size={16} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-tight hidden sm:block">Orders</span>
      </button>

      <button
        onClick={() => onTabChange('analytics')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
          activeTab === 'analytics' ? 'bg-white text-[#27335c]' : 'text-slate-300 hover:text-white hover:bg-white/5'
        }`}
      >
        <BarChart3 size={16} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-tight hidden sm:block">Stats</span>
      </button>

      <button
        onClick={() => onTabChange('seller')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
          activeTab === 'seller' ? 'bg-white text-[#27335c]' : 'text-slate-300 hover:text-white hover:bg-white/5'
        }`}
      >
        <Users size={16} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-tight hidden sm:block">Seller</span>
      </button>
    </nav>
  );
};

export default Navigation;
