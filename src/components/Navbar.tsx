import React, { useState, useRef, useEffect } from 'react';
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
  Stamp,
  ShieldCheck,
  QrCode,
  ChevronDown,
  Wrench,
} from 'lucide-react';
import { MobileTab } from './BottomNav';
import { InstallButton } from './InstallButton';

export type NavTab =
  | MobileTab
  | 'documents'
  | 'compress'
  | 'zip'
  | 'pdf-studio'
  | 'privacy-cleaner'
  | 'qr-studio';

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
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isToolsActive = ['compress', 'zip', 'privacy-cleaner', 'qr-studio'].includes(activeTab);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90 transition-[background-color,border-color] duration-150">
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
            { id: 'pdf-studio' as NavTab, label: 'PDF Studio', icon: <Stamp className="h-3.5 w-3.5" />, color: 'text-rose-600 dark:text-rose-400', badge: 'Unique' },
            { id: 'images' as NavTab, label: 'Images', icon: <ImageIcon className="h-3.5 w-3.5" />, color: 'text-purple-600 dark:text-purple-400' },
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
              {tab.badge && (
                <span className="rounded-full bg-rose-500/10 px-1.5 py-0.2 text-[9px] font-black text-rose-600 dark:text-rose-400">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}

          {/* Tools Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="nav-tools-menu-btn"
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-150 ${
                isToolsActive
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Wrench className="h-3.5 w-3.5" />
              <span>Tools</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {toolsDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    setActiveTab('privacy-cleaner');
                    setToolsDropdownOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-left transition ${
                    activeTab === 'privacy-cleaner'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <div>
                    <div className="font-bold">Privacy Sanitizer</div>
                    <div className="text-[10px] text-slate-400">Strip hidden metadata</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('qr-studio');
                    setToolsDropdownOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-left transition ${
                    activeTab === 'qr-studio'
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <QrCode className="h-4 w-4 text-indigo-500" />
                  <div>
                    <div className="font-bold">QR Code Studio</div>
                    <div className="text-[10px] text-slate-400">Vector SVG, PNG, Printable PDF</div>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    setActiveTab('compress');
                    setToolsDropdownOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-left transition ${
                    activeTab === 'compress'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Minimize2 className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-bold">File Compressor</div>
                    <div className="text-[10px] text-slate-400">Reduce size up to 85%</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('zip');
                    setToolsDropdownOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-left transition ${
                    activeTab === 'zip'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Archive className="h-4 w-4 text-amber-500" />
                  <div>
                    <div className="font-bold">Universal ZIP</div>
                    <div className="text-[10px] text-slate-400">Bundle archives client-side</div>
                  </div>
                </button>
              </div>
            )}
          </div>

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

          {/* Install button with visual effects */}
          {isInstallable && (
            <InstallButton
              variant="navbar"
              onClick={onInstallClick}
            />
          )}
        </div>
      </div>
    </header>
  );
};
