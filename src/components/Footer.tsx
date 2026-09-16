import React from 'react';
import {
  ShieldCheck,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  Minimize2,
  Archive,
  History,
  Lock,
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
    <footer className="hidden md:block mt-auto border-t border-slate-200/70 bg-slate-50/70 dark:border-slate-800/70 dark:bg-slate-950/70 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-2.5">
            <div
              onClick={() => {
                onNavigateTab('convert');
                scrollToTop();
              }}
              className="inline-flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-85"
            >
              <img
                src="/icon.svg"
                alt="ConvertX Logo"
                className="h-6 w-6 rounded-lg shadow-sm shadow-blue-500/20 object-contain"
              />
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                Convert<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">X</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Universal, high-fidelity file conversion and compression built for speed and simplicity. 100% private directly in your browser.
            </p>

            <div className="pt-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>100% Private · Zero Server Uploads</span>
              </div>
            </div>
          </div>

          {/* Navigation Tools */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              Tools
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('convert');
                    scrollToTop();
                  }}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  <FileText className="h-3 w-3 text-blue-500 shrink-0" />
                  <span>Document Converter</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('images');
                    scrollToTop();
                  }}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition"
                >
                  <ImageIcon className="h-3 w-3 text-purple-500 shrink-0" />
                  <span>Image Converter</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('compress');
                    scrollToTop();
                  }}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition"
                >
                  <Minimize2 className="h-3 w-3 text-indigo-500 shrink-0" />
                  <span>Compress Files</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('zip');
                    scrollToTop();
                  }}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition"
                >
                  <Archive className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>ZIP Archiver</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('history');
                    scrollToTop();
                  }}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  <History className="h-3 w-3 text-slate-400 shrink-0" />
                  <span>Conversion History</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Capabilities */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              Features
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li>PDF & Word Formatting</li>
              <li>Batch Conversion & Export</li>
              <li>Image Quality Optimization</li>
              <li>Extreme Size Reduction</li>
              <li>Folder Tree Preservation</li>
            </ul>
          </div>

          {/* Trust & Privacy */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              Trust & Security
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={onOpenPrivacyModal}
                  className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition"
                >
                  <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacyModal}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  <Lock className="h-3 w-3 text-purple-500 shrink-0" />
                  <span>Terms of Service</span>
                </button>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>100% In-Browser</span>
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Zero Data Storage</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-slate-500">
          <p>© 2026 ConvertX. All rights reserved. 100% Client-Side Processing.</p>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenPrivacyModal}
              className="hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={onOpenPrivacyModal}
              className="hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
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
