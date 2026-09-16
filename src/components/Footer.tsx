import React from 'react';
import {
  ShieldCheck,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  Minimize2,
  Archive,
  Lock,
  Stamp,
  QrCode,
  ShieldAlert,
  HardDrive,
  Sparkles,
  Zap,
} from 'lucide-react';
import { NavTab } from './Navbar';

interface FooterProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenPrivacyModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateTab,
  onOpenPrivacyModal,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="hidden md:block mt-auto w-full border-t border-slate-200/80 bg-white/95 dark:border-slate-800/80 dark:bg-slate-950/95 backdrop-blur-xl transition-colors duration-200">
      {/* Subtle top ambient accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        {/* Main Grid: 4 Compact Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 pb-5">
          {/* Col 1: Brand & Security Promise */}
          <div className="space-y-2.5">
            <div
              onClick={() => {
                onNavigateTab('home');
                scrollToTop();
              }}
              className="inline-flex cursor-pointer items-center gap-2 group transition-transform hover:scale-[1.01]"
            >
              <img
                src="/icon.svg"
                alt="ConvertX"
                className="h-5 w-5 rounded-md shadow-xs shadow-blue-500/20 object-contain"
              />
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                Convert<span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">X</span>
              </span>
              <span className="rounded-full bg-blue-500/10 px-1.5 py-0.2 text-[9px] font-black text-blue-600 dark:text-blue-400">
                v2.5
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Universal high-speed document converter, privacy sanitizer, and client-side PDF studio.
            </p>

            <div className="pt-0.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>100% In-Browser · Zero Server Uploads</span>
              </div>
            </div>
          </div>

          {/* Col 2: Tools Suite */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
              Tools & Studio
            </h4>
            <ul className="space-y-1 text-[11px]">
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('convert');
                    scrollToTop();
                  }}
                  className="touch-auto inline-btn flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  <FileText className="h-3 w-3 text-blue-500 shrink-0" />
                  <span>Document Converter</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('pdf-studio');
                    scrollToTop();
                  }}
                  className="touch-auto inline-btn flex items-center gap-1.5 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition"
                >
                  <Stamp className="h-3 w-3 text-rose-500 shrink-0" />
                  <span>PDF Studio</span>
                  <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1 rounded-sm">New</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('privacy-cleaner');
                    scrollToTop();
                  }}
                  className="touch-auto inline-btn flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition"
                >
                  <ShieldAlert className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>Privacy Sanitizer</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('qr-studio');
                    scrollToTop();
                  }}
                  className="touch-auto inline-btn flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition"
                >
                  <QrCode className="h-3 w-3 text-indigo-500 shrink-0" />
                  <span>QR Code Studio</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('images');
                    scrollToTop();
                  }}
                  className="touch-auto inline-btn flex items-center gap-1.5 text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition"
                >
                  <ImageIcon className="h-3 w-3 text-purple-500 shrink-0" />
                  <span>Image Optimizer</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('compress');
                    scrollToTop();
                  }}
                  className="touch-auto inline-btn flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  <Minimize2 className="h-3 w-3 text-blue-500 shrink-0" />
                  <span>Compress Files</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Capabilities */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
              Capabilities
            </h4>
            <ul className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                <span>PDF Merge, Split & Rotate</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                <span>EXIF & Metadata Stripping</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-blue-500 shrink-0" />
                <span>25+ File Formats Preserved</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Archive className="h-3 w-3 text-purple-500 shrink-0" />
                <span>Multi-File ZIP Archiving</span>
              </li>
              <li className="flex items-center gap-1.5">
                <QrCode className="h-3 w-3 text-indigo-500 shrink-0" />
                <span>Vector SVG & Printable QR</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Legal */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
              Trust & Security
            </h4>
            <ul className="space-y-1 text-[11px]">
              <li>
                <button
                  onClick={onOpenPrivacyModal}
                  className="touch-auto inline-btn flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition font-medium"
                >
                  <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacyModal}
                  className="touch-auto inline-btn flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  <Lock className="h-3 w-3 text-slate-400 shrink-0" />
                  <span>Terms of Service</span>
                </button>
              </li>
              <li className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <HardDrive className="h-3 w-3 text-slate-400 shrink-0" />
                <span>Local IndexedDB Storage</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Zero Server Telemetry</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Links & Back to Top */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-slate-400 dark:text-slate-500">
          <p className="font-medium">
            © 2026 ConvertX · 100% Client-Side Universal Tools. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenPrivacyModal}
              className="touch-auto inline-btn hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={onOpenPrivacyModal}
              className="touch-auto inline-btn hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigateTab('history')}
              className="touch-auto inline-btn hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              History
            </button>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="touch-auto inline-btn inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 transition-all active:scale-95"
              title="Scroll to top of page"
            >
              <span>Back to top</span>
              <ChevronUp className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
