import React from 'react';
import {
  History,
  Moon,
  Sun,
  Smartphone,
  Minimize2,
  Archive,
  FileText,
  Image as ImageIcon,
  Home,
  Settings,
} from 'lucide-react';
import { MobileTab } from './BottomNav';

export type NavTab = MobileTab | 'documents' | 'compress' | 'zip';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  historyCount: number;
  isInstallable: boolean;
  onInstallClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  historyCount,
  isInstallable,
  onInstallClick,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90 transition-colors duration-200">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <div
          id="brand-logo"
          onClick={() => setActiveTab('home')}
          className="group flex cursor-pointer items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <img
            src="/icon.svg"
            alt="ConvertX Logo"
            className="h-8 w-8 rounded-xl shadow-md shadow-blue-500/20 object-contain transition-transform group-hover:scale-105"
          />
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            Convert<span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">X</span>
          </span>
        </div>

        {/* Desktop Navigation — hidden on mobile (bottom nav takes over) */}
        <nav
          className="hidden md:flex items-center gap-0.5 rounded-2xl bg-slate-100/90 p-1 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60"
          aria-label="Main navigation"
        >
          {[
            { id: 'home' as NavTab, label: 'Home', icon: <Home className="h-3.5 w-3.5" />, color: 'text-blue-600 dark:text-blue-400' },
            { id: 'convert' as NavTab, label: 'Convert', icon: <FileText className="h-3.5 w-3.5" />, color: 'text-violet-600 dark:text-violet-400' },
            { id: 'images' as NavTab, label: 'Images', icon: <ImageIcon className="h-3.5 w-3.5 text-purple-500" />, color: 'text-purple-600 dark:text-purple-400' },
            { id: 'compress' as NavTab, label: 'Compress', icon: <Minimize2 className="h-3.5 w-3.5 text-indigo-500" />, color: 'text-indigo-600 dark:text-indigo-400' },
            { id: 'zip' as NavTab, label: 'Zip', icon: <Archive className="h-3.5 w-3.5 text-emerald-500" />, color: 'text-emerald-600 dark:text-emerald-400' },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`nav-${tab.id}-btn`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-150 ${
                activeTab === tab.id
                  ? `bg-white ${tab.color} shadow-sm dark:bg-slate-900`
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}

          {/* History with badge */}
          <button
            id="nav-history-btn"
            onClick={() => setActiveTab('history')}
            className={`relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-150 ${
              activeTab === 'history'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-black text-white">
                {historyCount > 99 ? '99+' : historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right tools */}
        <div className="flex items-center gap-1.5">
          {/* Theme Toggle */}
          <button
            id="dark-mode-toggle"
            onClick={() => setIsDark(!isDark)}
            className="touch-sm flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition shadow-sm active:scale-95"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          {/* Settings — desktop only visible as icon, mobile uses settings tab */}
          <button
            id="nav-settings-btn"
            onClick={() => setActiveTab('settings')}
            className={`touch-sm hidden md:flex h-9 w-9 items-center justify-center rounded-xl border transition shadow-sm active:scale-95 ${
              activeTab === 'settings'
                ? 'border-blue-300 bg-blue-50 text-blue-600 dark:border-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400'
            }`}
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Install button */}
          {isInstallable && (
            <button
              id="install-pwa-btn"
              onClick={onInstallClick}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition active:scale-95"
              title="Install app on device"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Install</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
