import React from 'react';
import { Home, Zap, Image as ImageIcon, Clock, Settings } from 'lucide-react';

export type MobileTab = 'home' | 'convert' | 'images' | 'history' | 'settings';

interface BottomNavProps {
  activeTab: MobileTab;
  setActiveTab: (tab: MobileTab) => void;
  historyCount: number;
}

const tabs: Array<{
  id: MobileTab;
  label: string;
  icon: React.ReactNode;
  activeColor: string;
  activeBg: string;
}> = [
  {
    id: 'home',
    label: 'Home',
    icon: <Home className="h-5 w-5" />,
    activeColor: 'text-blue-600 dark:text-blue-400',
    activeBg: 'bg-blue-50 dark:bg-blue-950/50',
  },
  {
    id: 'convert',
    label: 'Convert',
    icon: <Zap className="h-5 w-5" />,
    activeColor: 'text-violet-600 dark:text-violet-400',
    activeBg: 'bg-violet-50 dark:bg-violet-950/50',
  },
  {
    id: 'images',
    label: 'Images',
    icon: <ImageIcon className="h-5 w-5" />,
    activeColor: 'text-purple-600 dark:text-purple-400',
    activeBg: 'bg-purple-50 dark:bg-purple-950/50',
  },
  {
    id: 'history',
    label: 'History',
    icon: <Clock className="h-5 w-5" />,
    activeColor: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    activeColor: 'text-slate-700 dark:text-slate-300',
    activeBg: 'bg-slate-100 dark:bg-slate-800/60',
  },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, historyCount }) => {
  return (
    <nav
      className="bottom-nav md:hidden border-t border-slate-200/90 bg-white/95 dark:border-slate-800/90 dark:bg-slate-950/98 backdrop-blur-xl"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-14 items-center justify-around px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`
                relative flex flex-col items-center justify-center gap-0.5 
                rounded-2xl px-3 py-1.5 transition-all duration-150
                min-h-[44px] min-w-[60px]
                ${isActive
                  ? `${tab.activeColor} ${tab.activeBg}`
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }
              `}
            >
              <span className={`transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] font-bold leading-none ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {tab.label}
              </span>

              {/* History badge */}
              {tab.id === 'history' && historyCount > 0 && (
                <span className="absolute -top-0.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-black text-white shadow-sm">
                  {historyCount > 99 ? '99+' : historyCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
