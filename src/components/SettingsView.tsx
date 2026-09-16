import React from 'react';
import {
  Moon, Sun, Shield, Trash2, Info, ChevronRight,
  Palette, Clock, HardDrive, Zap, Download, Archive, Minimize2,
} from 'lucide-react';
import { MobileTab } from './BottomNav';

interface SettingsViewProps {
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  historyCount: number;
  onClearHistory: () => void;
  onOpenPrivacyModal: () => void;
  setActiveTab: (tab: MobileTab) => void;
  isInstallable: boolean;
  onInstallClick: () => void;
  onNavigateTo: (tab: MobileTab, subTool?: string) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-2">
    <div className="px-4 pb-1.5">
      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {title}
      </span>
    </div>
    <div className="mx-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900 shadow-sm">
      {children}
    </div>
  </div>
);

const Row: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  noBorder?: boolean;
}> = ({ icon, iconBg, label, sublabel, right, onClick, destructive, noBorder }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className={`
      w-full flex items-center gap-3.5 px-4 py-3.5 min-h-[56px] text-left
      transition-colors duration-100
      ${onClick ? 'active:bg-slate-50 dark:active:bg-slate-800/60' : 'cursor-default'}
      ${!noBorder ? 'border-b border-slate-100 dark:border-slate-800/60 last:border-0' : ''}
    `}
  >
    <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <div className={`text-sm font-semibold ${destructive ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
        {label}
      </div>
      {sublabel && (
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{sublabel}</div>
      )}
    </div>
    {right ?? (onClick && <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />)}
  </button>
);

const ThemeRow: React.FC<{ isDark: boolean; setIsDark: (v: boolean) => void }> = ({ isDark, setIsDark }) => (
  <div className="flex items-center gap-3.5 px-4 py-3.5 min-h-[56px] border-b border-slate-100 dark:border-slate-800/60">
    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60">
      {isDark ? <Moon className="h-4 w-4 text-amber-500" /> : <Sun className="h-4 w-4 text-amber-500" />}
    </span>
    <div className="flex-1">
      <div className="text-sm font-semibold text-slate-900 dark:text-white">Appearance</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{isDark ? 'Dark mode' : 'Light mode'}</div>
    </div>
    {/* Toggle switch */}
    <button
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle dark mode"
      className={`
        relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none
        ${isDark ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}
      `}
    >
      <span className={`
        inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200
        ${isDark ? 'translate-x-6' : 'translate-x-1'}
      `} />
    </button>
  </div>
);

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDark,
  setIsDark,
  historyCount,
  onClearHistory,
  onOpenPrivacyModal,
  isInstallable,
  onInstallClick,
  onNavigateTo,
}) => {
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);

  const handleClearHistory = () => {
    if (showClearConfirm) {
      onClearHistory();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
    }
  };

  return (
    <div className="min-h-full pb-4">
      {/* Header */}
      <div className="px-4 pt-6 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Preferences & privacy controls</p>
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <ThemeRow isDark={isDark} setIsDark={setIsDark} />
      </Section>

      {/* Tools */}
      <Section title="Tools">
        <Row
          icon={<Minimize2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
          iconBg="bg-indigo-50 dark:bg-indigo-950/60"
          label="Compress Files"
          sublabel="Reduce image, PDF & office file sizes"
          onClick={() => onNavigateTo('convert', 'compress')}
        />
        <Row
          icon={<Archive className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
          label="ZIP Creator"
          sublabel="Package files into ZIP archives"
          onClick={() => onNavigateTo('convert', 'zip')}
          noBorder
        />
      </Section>

      {/* Privacy */}
      <Section title="Privacy">
        <Row
          icon={<Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
          label="Privacy Policy"
          sublabel="How your data is handled"
          onClick={onOpenPrivacyModal}
        />
        <Row
          icon={<Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-50 dark:bg-blue-950/60"
          label="Conversion History"
          sublabel={`${historyCount} item${historyCount !== 1 ? 's' : ''} · stored on this device only`}
          onClick={() => onNavigateTo('history')}
        />
        <Row
          icon={<Trash2 className="h-4 w-4 text-red-500" />}
          iconBg="bg-red-50 dark:bg-red-950/60"
          label={showClearConfirm ? 'Tap again to confirm' : 'Clear History'}
          sublabel={showClearConfirm ? 'This cannot be undone' : 'Remove all local conversion records'}
          onClick={handleClearHistory}
          destructive={showClearConfirm}
          noBorder
        />
      </Section>

      {/* Storage */}
      <Section title="Storage">
        <Row
          icon={<HardDrive className="h-4 w-4 text-slate-600 dark:text-slate-300" />}
          iconBg="bg-slate-100 dark:bg-slate-800"
          label="Local Storage"
          sublabel="History stored in IndexedDB on this device"
          right={
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              Private
            </span>
          }
          noBorder
        />
      </Section>

      {/* Install */}
      {isInstallable && (
        <Section title="App">
          <Row
            icon={<Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
            iconBg="bg-blue-50 dark:bg-blue-950/60"
            label="Install ConvertX"
            sublabel="Add to home screen for instant access"
            onClick={onInstallClick}
            noBorder
          />
        </Section>
      )}

      {/* About */}
      <Section title="About">
        <Row
          icon={<Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" />}
          iconBg="bg-violet-50 dark:bg-violet-950/60"
          label="ConvertX"
          sublabel="100% private · client-side conversion"
          right={
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">v2.0</span>
          }
        />
        <Row
          icon={<Info className="h-4 w-4 text-slate-500" />}
          iconBg="bg-slate-100 dark:bg-slate-800"
          label="Open Source"
          sublabel="Built with React, PptxGenJS, mammoth, jsPDF"
          noBorder
        />
      </Section>

      {/* Bottom disclaimer */}
      <div className="px-4 py-4 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-600 leading-relaxed">
          All conversions happen entirely in your browser.{'\n'}
          No files are ever uploaded to any server.
        </p>
      </div>
    </div>
  );
};
