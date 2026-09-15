import React from 'react';
import {
  ArrowRightLeft,
  ShieldCheck,
  Github,
  Heart,
  ExternalLink,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  Columns2,
  Archive,
  History,
  Lock,
  Scale,
  Sparkles,
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
    <footer className="border-t border-slate-200/90 bg-white/95 dark:border-slate-800/90 dark:bg-slate-900/95 transition-colors duration-200 backdrop-blur-md">
      {/* Top Feature Highlights Bar */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                100% Client-Side Sandbox
              </span>
              <span className="hidden sm:inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                Original Document Layout Preservation
              </span>
              <span className="hidden md:inline-flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-purple-500" />
                Zero Server Log Retention
              </span>
            </div>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition"
              title="Scroll back to top"
            >
              <span>Back to top</span>
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Col 1 & 2: Brand & Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-blue-500/25">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Convert<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">X</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              The high-fidelity, privacy-first universal file conversion suite. Convert documents, pictures, spreadsheets,
              and archives directly in your browser with zero remote data retention.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Zero Uploads
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                WebAssembly Engine
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                MIT Open Source
              </span>
            </div>
          </div>

          {/* Col 3: Suite Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Tools & Features
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTab('documents')}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Document Converter</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('images')}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Image Converter</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('compare')}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition"
                >
                  <Columns2 className="h-3.5 w-3.5" />
                  <span>Side-by-Side Compare</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('zip')}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>ZIP Folder Archiver</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('history')}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  <History className="h-3.5 w-3.5" />
                  <span>Conversion History</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Popular Formats */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Supported Formats
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {['DOCX', 'PDF', 'XLSX', 'PPTX', 'PNG', 'JPG', 'WEBP', 'CSV', 'SVG', 'TXT', 'MD', 'HTML'].map(
                (fmt) => (
                  <span
                    key={fmt}
                    className="rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
                  >
                    {fmt}
                  </span>
                )
              )}
            </div>
            <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
              Preserves text styling, tables, bullet lists, and vector graphics verbatim.
            </p>
          </div>

          {/* Col 5: Legal & Trust */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Legal & Trust
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenPrivacyModal}
                  className="flex items-center gap-1.5 font-bold text-blue-600 hover:underline dark:text-blue-400 transition"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacyModal}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  <Scale className="h-3.5 w-3.5" />
                  <span>Terms & Disclaimer</span>
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/mukteshwar845/ConvertX/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>MIT License</span>
                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/mukteshwar845/ConvertX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  <Github className="h-3.5 w-3.5" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
            <span>© 2026 ConvertX. Created with</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-current inline" />
            <span>by</span>
            <a
              href="https://github.com/mukteshwar845"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition"
            >
              mukteshwar845
            </a>
            <span>• All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenPrivacyModal}
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline decoration-slate-300 dark:decoration-slate-700"
            >
              Legal & Privacy Center
            </button>
            <span>•</span>
            <a
              href="https://github.com/mukteshwar845/ConvertX/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition"
            >
              Report Issue
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
