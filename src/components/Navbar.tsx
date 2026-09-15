import React from 'react';
import {
  History,
  Moon,
  Sun,
  Smartphone,
  ArrowRightLeft,
  Columns2,
  Archive,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

export type NavTab = 'documents' | 'images' | 'compare' | 'zip' | 'history';

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-lg dark:border-slate-800/80 dark:bg-slate-900/80 transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div
          id="brand-logo"
          onClick={() => setActiveTab('documents')}
          className="flex cursor-pointer items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-blue-500/25">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Convert<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">X</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                100% Private
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-2xl bg-slate-100/90 p-1 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          <button
            id="nav-documents-btn"
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-150 ${
              activeTab === 'documents'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Documents</span>
          </button>

          <button
            id="nav-images-btn"
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-150 ${
              activeTab === 'images'
                ? 'bg-white text-purple-600 shadow-sm dark:bg-slate-900 dark:text-purple-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="h-4 w-4 text-purple-500" />
            <span>Images</span>
          </button>

          <button
            id="nav-compare-btn"
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-150 ${
              activeTab === 'compare'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <Columns2 className="h-4 w-4 text-indigo-500" />
            <span>Compare Files</span>
          </button>

          <button
            id="nav-zip-btn"
            onClick={() => setActiveTab('zip')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-150 ${
              activeTab === 'zip'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <Archive className="h-4 w-4 text-emerald-500" />
            <span>Zip Creator</span>
          </button>

          <button
            id="nav-history-btn"
            onClick={() => setActiveTab('history')}
            className={`relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-150 ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <History className="h-4 w-4" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-xs">
                {historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Tools: Theme Toggle, Install */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button (Day / Night) */}
          <button
            id="dark-mode-toggle"
            onClick={() => setIsDark(!isDark)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition shadow-2xs active:scale-95"
            title={isDark ? 'Switch to Light Mode (Day)' : 'Switch to Dark Mode (Night)'}
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-slate-700" />
            )}
          </button>

          {isInstallable && (
            <button
              id="install-pwa-btn"
              onClick={onInstallClick}
              className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition"
              title="Install app on device"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-200/80 bg-white/95 px-1 py-1.5 dark:border-slate-800/80 dark:bg-slate-900/95 justify-around backdrop-blur-md">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-bold transition ${
            activeTab === 'documents'
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Docs</span>
        </button>

        <button
          onClick={() => setActiveTab('images')}
          className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-bold transition ${
            activeTab === 'images'
              ? 'text-purple-600 dark:text-purple-400 bg-purple-50/70 dark:bg-purple-950/40'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>Images</span>
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-bold transition ${
            activeTab === 'compare'
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Columns2 className="h-4 w-4" />
          <span>Compare</span>
        </button>

        <button
          onClick={() => setActiveTab('zip')}
          className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-bold transition ${
            activeTab === 'zip'
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Archive className="h-4 w-4" />
          <span>Zip</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`relative flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-bold transition ${
            activeTab === 'history'
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <History className="h-4 w-4" />
          <span>History</span>
          {historyCount > 0 && (
            <span className="absolute top-0.5 right-1 h-3.5 min-w-3.5 rounded-full bg-blue-600 text-[9px] font-bold text-white flex items-center justify-center px-0.5">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
