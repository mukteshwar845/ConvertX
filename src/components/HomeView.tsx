import React, { useRef } from 'react';
import { Zap, Shield, FileText, Image as ImageIcon, Lock, Star } from 'lucide-react';
import { MobileTab } from './BottomNav';
import { detectFormat, getAvailableTargets } from '../utils/conversionEngine';
import { ConversionItem, TargetFormat } from '../types';

interface HomeViewProps {
  setActiveTab: (tab: MobileTab) => void;
  onFilesAdded: (files: FileList | File[]) => void;
  isDark: boolean;
  isInstallable: boolean;
  onInstallClick: () => void;
}

const QuickConvertTile: React.FC<{
  from: string;
  to: string;
  emoji: string;
  color: string;
  onClick: () => void;
}> = ({ from, to, emoji, color, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center gap-1.5
      rounded-2xl border border-slate-200/80 dark:border-slate-800/80
      bg-white dark:bg-slate-900
      p-3 min-h-[80px]
      shadow-sm active:scale-95 transition-all duration-150
      hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700
    `}
  >
    <span className="text-xl">{emoji}</span>
    <div className="text-center leading-tight">
      <span className={`text-[11px] font-black ${color}`}>{from}</span>
      <span className="text-[11px] text-slate-400 dark:text-slate-500"> → </span>
      <span className={`text-[11px] font-black ${color}`}>{to}</span>
    </div>
  </button>
);

const FeaturePill: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 px-3 py-1.5 shadow-sm">
    {icon}
    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
  </div>
);

const quickConverts = [
  { from: 'DOCX', to: 'PDF', emoji: '📄', color: 'text-blue-600 dark:text-blue-400', format: 'pdf' as TargetFormat },
  { from: 'PDF', to: 'DOCX', emoji: '📝', color: 'text-violet-600 dark:text-violet-400', format: 'docx' as TargetFormat },
  { from: 'JPG', to: 'PDF', emoji: '🖼️', color: 'text-emerald-600 dark:text-emerald-400', format: 'pdf' as TargetFormat },
  { from: 'PNG', to: 'JPG', emoji: '🎨', color: 'text-orange-600 dark:text-orange-400', format: 'jpg' as TargetFormat },
  { from: 'DOCX', to: 'PPTX', emoji: '📊', color: 'text-red-600 dark:text-red-400', format: 'pptx' as TargetFormat },
  { from: 'PDF', to: 'TXT', emoji: '📃', color: 'text-slate-600 dark:text-slate-400', format: 'txt' as TargetFormat },
];

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  onFilesAdded,
  isDark,
  isInstallable,
  onInstallClick,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesAdded(files);
      setActiveTab('convert');
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-5 pt-10 pb-8">
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

        <div className="relative">
          {/* App name */}
          <div className="flex items-center gap-2 mb-4">
            <img src="/icon.svg" alt="ConvertX" className="h-9 w-9 rounded-xl shadow-lg shadow-blue-500/30" />
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Convert<span className="text-blue-400">X</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-2">
            Convert anything.<br />
            <span className="text-blue-300">Keep everything private.</span>
          </h1>
          <p className="text-sm text-blue-200/80 mb-6">
            Files stay on your device — never uploaded to any server.
          </p>

          {/* Primary CTA */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="*/*"
            className="sr-only"
            onChange={handleFileChange}
            aria-label="Choose files to convert"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="
              w-full flex items-center justify-center gap-3
              rounded-2xl bg-white
              px-6 py-4.5 min-h-[60px]
              text-base font-black text-slate-900
              shadow-xl shadow-black/30
              active:scale-[0.97] transition-transform duration-150
              hover:shadow-2xl
            "
          >
            <span className="text-2xl">📁</span>
            <span>Choose File to Convert</span>
          </button>

          <p className="text-center text-xs text-blue-200/60 mt-3">
            Documents · Images · Spreadsheets · PDFs
          </p>
        </div>
      </div>

      {/* ── Quick Conversions ────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-2">
        <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          Popular Conversions
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {quickConverts.map((item) => (
            <QuickConvertTile
              key={`${item.from}-${item.to}`}
              from={item.from}
              to={item.to}
              emoji={item.emoji}
              color={item.color}
              onClick={() => {
                setActiveTab('convert');
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Feature pills ────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex flex-wrap gap-2">
          <FeaturePill
            icon={<Lock className="h-3.5 w-3.5 text-emerald-500" />}
            label="100% Private"
          />
          <FeaturePill
            icon={<Zap className="h-3.5 w-3.5 text-amber-500" />}
            label="Instant Conversion"
          />
          <FeaturePill
            icon={<FileText className="h-3.5 w-3.5 text-blue-500" />}
            label="20+ Formats"
          />
          <FeaturePill
            icon={<Shield className="h-3.5 w-3.5 text-violet-500" />}
            label="No Account"
          />
          <FeaturePill
            icon={<Star className="h-3.5 w-3.5 text-orange-500" />}
            label="Free Forever"
          />
        </div>
      </div>

      {/* ── Format categories ─────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          What can you convert?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: '📄', label: 'Documents', sub: 'DOCX, PDF, TXT, HTML, MD', tab: 'convert' as MobileTab },
            { emoji: '🖼️', label: 'Images', sub: 'JPG, PNG, WEBP, SVG, BMP', tab: 'images' as MobileTab },
            { emoji: '📊', label: 'Spreadsheets', sub: 'XLSX, CSV, ODS, JSON', tab: 'convert' as MobileTab },
            { emoji: '🎯', label: 'Presentations', sub: 'PPTX, PPT, ODP', tab: 'convert' as MobileTab },
          ].map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveTab(cat.tab)}
              className="
                flex items-start gap-3 rounded-2xl p-4 min-h-[72px] text-left
                bg-white dark:bg-slate-900
                border border-slate-200/80 dark:border-slate-800/80
                shadow-sm active:scale-[0.97] transition-all duration-150
                hover:shadow-md
              "
            >
              <span className="text-2xl mt-0.5">{cat.emoji}</span>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{cat.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{cat.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Install CTA ──────────────────────────────────────────── */}
      {isInstallable && (
        <div className="mx-4 mt-4 mb-2">
          <button
            onClick={onInstallClick}
            className="
              w-full flex items-center justify-center gap-2
              rounded-2xl border border-blue-200 dark:border-blue-800
              bg-blue-50 dark:bg-blue-950/40
              px-4 py-3.5 min-h-[52px]
              text-sm font-bold text-blue-700 dark:text-blue-300
              active:scale-[0.98] transition-transform duration-150
            "
          >
            <span>📲</span>
            <span>Install ConvertX as an App</span>
          </button>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
};
