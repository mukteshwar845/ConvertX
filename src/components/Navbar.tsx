import React from 'react';
import {
  FileText,
  History,
  Cloud,
  ShieldCheck,
  Moon,
  Sun,
  Download,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'converter' | 'history' | 'vault' | 'security';
  setActiveTab: (tab: 'converter' | 'history' | 'vault' | 'security') => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  historyCount: number;
  syncedCount: number;
  roomCode: string;
  isInstallable: boolean;
  onInstallClick: () => void;
  isEncrypted: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  historyCount,
  syncedCount,
  roomCode,
  isInstallable,
  onInstallClick,
  isEncrypted,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div
          id="brand-logo"
          onClick={() => setActiveTab('converter')}
          className="flex cursor-pointer items-center gap-3 transition hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Docu<span className="text-blue-600 dark:text-blue-400">Convert</span>
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                E2EE Pro
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 md:block">
              DOCX • PDF • PPTX Batch Converter & Cloud Vault
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/70">
          <button
            id="nav-converter-btn"
            onClick={() => setActiveTab('converter')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              activeTab === 'converter'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            Converter
          </button>

          <button
            id="nav-history-btn"
            onClick={() => setActiveTab('history')}
            className={`relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <History className="h-4 w-4" />
            History & Downloads
            {historyCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white dark:bg-blue-500">
                {historyCount}
              </span>
            )}
          </button>

          <button
            id="nav-vault-btn"
            onClick={() => setActiveTab('vault')}
            className={`relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              activeTab === 'vault'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <Cloud className="h-4 w-4" />
            Cloud Sync
            {syncedCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                {syncedCount}
              </span>
            )}
          </button>

          <button
            id="nav-security-btn"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              activeTab === 'security'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            E2EE Security
          </button>
        </nav>

        {/* Right Tools: Sync Code Badge, Install, Dark Mode */}
        <div className="flex items-center gap-2">
          {/* Cloud Sync Status Pill */}
          <button
            id="sync-status-pill"
            onClick={() => setActiveTab('vault')}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
            title="Cross-Device Sync Room"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Room: {roomCode}</span>
          </button>

          {/* Install PWA Button */}
          {isInstallable && (
            <button
              id="install-pwa-btn"
              onClick={onInstallClick}
              className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 transition"
              title="Install DocuConvert on your device"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            id="dark-mode-toggle"
            onClick={() => setIsDark(!isDark)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation for iOS / Android */}
      <div className="flex md:hidden border-t border-slate-200 bg-white/95 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900/95 justify-around">
        <button
          onClick={() => setActiveTab('converter')}
          className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium ${
            activeTab === 'converter' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Convert</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium ${
            activeTab === 'history' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <History className="h-4 w-4" />
          <span>History</span>
          {historyCount > 0 && (
            <span className="absolute -top-0.5 right-2 h-4 w-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
              {historyCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('vault')}
          className={`relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium ${
            activeTab === 'vault' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Cloud className="h-4 w-4" />
          <span>Cloud Sync</span>
          {syncedCount > 0 && (
            <span className="absolute -top-0.5 right-2 h-4 w-4 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center">
              {syncedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium ${
            activeTab === 'security' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Security</span>
        </button>
      </div>
    </header>
  );
};
