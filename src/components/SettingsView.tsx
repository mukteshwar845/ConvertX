import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Shield,
  Trash2,
  Info,
  ChevronRight,
  HardDrive,
  Zap,
  Download,
  Archive,
  Minimize2,
  CheckCircle2,
  Stamp,
  QrCode,
  ShieldAlert,
  Laptop,
  Check,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Lock,
  Clock,
} from 'lucide-react';
import { NavTab } from './Navbar';

interface SettingsViewProps {
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  historyCount: number;
  onClearHistory: () => void;
  onOpenPrivacyModal: () => void;
  setActiveTab: (tab: NavTab) => void;
  isInstallable: boolean;
  isStandalone?: boolean;
  onInstallClick: () => void;
  onNavigateTo: (tab: NavTab, subTool?: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDark,
  setIsDark,
  historyCount,
  onClearHistory,
  onOpenPrivacyModal,
  isInstallable,
  isStandalone = false,
  onInstallClick,
  onNavigateTo,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [historyClearedNotification, setHistoryClearedNotification] = useState(false);

  const handleClearHistory = () => {
    if (showClearConfirm) {
      onClearHistory();
      setShowClearConfirm(false);
      setHistoryClearedNotification(true);
      setTimeout(() => setHistoryClearedNotification(false), 3000);
    } else {
      setShowClearConfirm(true);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. HEADER & STATUS BANNER ───────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span>System & Environment Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Control application theme, inspect client-side sandboxing, manage offline PWA installation, and configure local storage.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Client-Side Engine
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <Lock className="h-3 w-3 text-slate-500" />
              Zero Cloud Telemetry
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. APPEARANCE & THEME (HIGH-CONTRAST VISUAL PICKER) ─────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/90 overflow-hidden shadow-xs">
        <div className="border-b border-slate-100 dark:border-slate-800/80 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Appearance & Contrast
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select your preferred visual style. Optimized for razor-sharp typography with zero text smearing.
            </p>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            {isDark ? 'Dark Theme Active' : 'Light Theme Active'}
          </span>
        </div>

        <div className="p-5">
          {/* Theme Option Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Mode Card */}
            <button
              type="button"
              onClick={() => setIsDark(false)}
              className={`
                group relative flex flex-col p-4 rounded-xl text-left border-2 transition-all duration-150 cursor-pointer
                ${!isDark
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-800/80'
                }
              `}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`
                    flex h-9 w-9 items-center justify-center rounded-xl transition-colors
                    ${!isDark ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}
                  `}>
                    <Sun className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Crisp Light
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Daytime High-Contrast
                    </div>
                  </div>
                </div>

                <div className={`
                  flex h-6 w-6 items-center justify-center rounded-full border transition-colors
                  ${!isDark
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 dark:border-slate-700 bg-transparent text-transparent'
                  }
                `}>
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Miniature UI Mock */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-900 space-y-1.5 mb-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="h-2 w-16 bg-slate-300 rounded" />
                  <div className="h-2 w-6 bg-blue-500 rounded" />
                </div>
                <div className="h-4 bg-white border border-slate-200 rounded flex items-center px-1.5">
                  <div className="h-1.5 w-20 bg-slate-800 rounded" />
                </div>
                <div className="flex gap-1">
                  <div className="h-2.5 w-10 bg-blue-600 rounded" />
                  <div className="h-2.5 w-8 bg-slate-200 rounded" />
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-auto">
                Clean pure white backdrop with sharp black typography and vivid accents. Best for bright rooms and daytime workflows.
              </p>
            </button>

            {/* Dark Mode Card */}
            <button
              type="button"
              onClick={() => setIsDark(true)}
              className={`
                group relative flex flex-col p-4 rounded-xl text-left border-2 transition-all duration-150 cursor-pointer
                ${isDark
                  ? 'border-blue-500 bg-blue-950/30 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-800/80'
                }
              `}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`
                    flex h-9 w-9 items-center justify-center rounded-xl transition-colors
                    ${isDark ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}
                  `}>
                    <Moon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Obsidian Dark
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Deep Contrast & Eye Comfort
                    </div>
                  </div>
                </div>

                <div className={`
                  flex h-6 w-6 items-center justify-center rounded-full border transition-colors
                  ${isDark
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-slate-300 dark:border-slate-700 bg-transparent text-transparent'
                  }
                `}>
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Miniature UI Mock */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white space-y-1.5 mb-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="h-2 w-16 bg-slate-700 rounded" />
                  <div className="h-2 w-6 bg-blue-500 rounded" />
                </div>
                <div className="h-4 bg-slate-900 border border-slate-800 rounded flex items-center px-1.5">
                  <div className="h-1.5 w-20 bg-slate-200 rounded" />
                </div>
                <div className="flex gap-1">
                  <div className="h-2.5 w-10 bg-blue-500 rounded" />
                  <div className="h-2.5 w-8 bg-slate-800 rounded" />
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-auto">
                True obsidian dark canvas designed for low-light environments, reducing eye fatigue and battery consumption on OLED screens.
              </p>
            </button>
          </div>

          {/* Text Rendering Guarantee Note */}
          <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60 p-3.5 flex items-start gap-3">
            <Info className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="font-semibold text-slate-800 dark:text-slate-200">Crisp Text Guarantee:</strong> ConvertX uses instantaneous color-switching without font anti-aliasing interpolation, ensuring glyphs remain crystal-clear and razor-sharp across both dark and light modes.
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. APPLICATION & PWA INSTALLATION ───────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/90 overflow-hidden shadow-xs">
        <div className="border-b border-slate-100 dark:border-slate-800/80 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Application & Installation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ConvertX is an installable Progressive Web App (PWA) with native window integration.
          </p>
        </div>

        <div className="p-5">
          {isStandalone ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/30 p-4">
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Running as Installed Application
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                      Standalone
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Offline service worker active · Native window container · Instant launch from dock or desktop
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <Laptop className="h-4 w-4" />
                Native App Experience
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Download className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Install ConvertX Application
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-md">
                      PWA Ready
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-xl leading-relaxed">
                    Install to your desktop, smartphone, or tablet. Works offline, launches in its own dedicated window without browser bars, and loads instantly.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onInstallClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs px-4 py-2.5 transition-all shadow-xs hover:shadow-sm flex-shrink-0 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Install Now</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. CONVERTX CORE TOOLS HUB ──────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/90 overflow-hidden shadow-xs">
        <div className="border-b border-slate-100 dark:border-slate-800/80 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Quick Tools Launcher
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Access client-side document utilities, security tools, and format optimizers directly.
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {/* PDF Studio */}
          <button
            type="button"
            onClick={() => onNavigateTo('pdf-studio')}
            className="w-full flex items-center justify-between gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/60 text-rose-600 dark:text-rose-400">
                <Stamp className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  PDF Studio
                  <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.5 rounded">
                    PRO
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Merge multiple PDFs, extract pages, rotate orientations, and apply confidential watermarks
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <span className="hidden sm:inline">Launch Studio</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Privacy Sanitizer */}
          <button
            type="button"
            onClick={() => onNavigateTo('privacy-cleaner')}
            className="w-full flex items-center justify-between gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Privacy Sanitizer & EXIF Stripper
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                    SECURITY
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Wipe hidden author metadata, camera models, GPS coordinates, and revision logs before sharing
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="hidden sm:inline">Clean Files</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* QR Code Studio */}
          <button
            type="button"
            onClick={() => onNavigateTo('qr-studio')}
            className="w-full flex items-center justify-between gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400">
                <QrCode className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  QR Code Studio
                  <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                    VECTOR
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Generate vector SVG, 4K high-res PNG, and printable table-tent PDF display cards
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="hidden sm:inline">Generate QR</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Smart File Compressor */}
          <button
            type="button"
            onClick={() => onNavigateTo('convert', 'compress')}
            className="w-full flex items-center justify-between gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 text-blue-600 dark:text-blue-400">
                <Minimize2 className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Smart File Compressor
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Reduce heavy image and document payloads with intelligent client-side compression
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span className="hidden sm:inline">Compress</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Multi-File ZIP Creator */}
          <button
            type="button"
            onClick={() => onNavigateTo('convert', 'zip')}
            className="w-full flex items-center justify-between gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/60 text-amber-600 dark:text-amber-400">
                <Archive className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Multi-File ZIP Archive Creator
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Bundle multiple documents, spreadsheets, and media into compressed zip packages instantly
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <span className="hidden sm:inline">Create ZIP</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* ── 5. STORAGE & LOCAL DATA MANAGEMENT ──────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/90 overflow-hidden shadow-xs">
        <div className="border-b border-slate-100 dark:border-slate-800/80 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Local Storage & History
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your local browser database and inspect stored conversions.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            {historyCount} Item{historyCount !== 1 ? 's' : ''} Cached
          </span>
        </div>

        <div className="p-5 space-y-4">
          {historyClearedNotification && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50 p-3.5 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 text-xs font-semibold animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>Conversion history and cached files have been successfully cleared from IndexedDB.</span>
            </div>
          )}

          {/* Database stats tile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/60 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <HardDrive className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">IndexedDB Origin Storage</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Private sandbox per origin domain</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Total Saved Records:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{historyCount}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/60 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <Shield className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Security & Encryption</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Data never leaves local device memory</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Server Synchronization:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">None (100% Isolated)</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateTo('history')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer"
            >
              <Clock className="h-4 w-4 text-blue-500" />
              <span>View Full History Table</span>
            </button>

            {/* Clear History with 2-tap confirmation */}
            {showClearConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Confirm Delete All Records</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClearHistory}
                disabled={historyCount === 0}
                className={`
                  inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer
                  ${historyCount > 0
                    ? 'border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }
                `}
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All Conversion Records</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 6. PRIVACY & SECURITY POLICIES ──────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/90 overflow-hidden shadow-xs">
        <div className="border-b border-slate-100 dark:border-slate-800/80 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Privacy & Trust Architecture
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ConvertX is built with a zero-knowledge, zero-upload architecture.
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-3.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Zero Cloud Uploads
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Document conversion runs entirely in WebAssembly and browser JS. Packets containing file bytes are never sent over the internet.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-3.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Ephemeral Memory
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Raw file buffers are stored temporarily in RAM and automatically freed by garbage collection when tasks complete.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-3.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                GDPR & HIPAA Compliant
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Since no personal data or files touch any remote infrastructure, compliance is guaranteed by architectural design.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onOpenPrivacyModal}
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer"
            >
              <Shield className="h-4 w-4" />
              <span>Read Full Privacy & Data Security Documentation</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 7. ABOUT & SYSTEM STACK ─────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/90 overflow-hidden shadow-xs">
        <div className="border-b border-slate-100 dark:border-slate-800/80 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            System & Engine Information
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ConvertX open-source client-side conversion engine.
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-black">
                CX
              </span>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">ConvertX Progressive Web Application</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">Universal Document Converter & Office Suite</div>
              </div>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                v2.2.0 PWA
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/80 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                Production Ready
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-3.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Open-Source Engine Stack:</div>
            <p className="leading-relaxed text-[11px]">
              Built with React 18, TypeScript, TailwindCSS v4, Service Workers (PWA Cache), pdf-lib, docx, Mammoth.js, PptxGenJS, SheetJS, JSZip, and html2canvas.
            </p>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              © 2026 ConvertX. Engineered for speed, confidentiality, and reliability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
