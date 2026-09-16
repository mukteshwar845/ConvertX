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
    <footer className="hidden md:block border-t border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand & Mission */}
          <div className="md:col-span-2 lg:col-span-2 space-y-4">
            <div
              onClick={() => {
                onNavigateTab('documents');
                scrollToTop();
              }}
              className="inline-flex cursor-pointer items-center gap-2.5 transition-transform hover:scale-[1.01]"
            >
              <img
                src="/icon.svg"
                alt="ConvertX Logo"
                className="h-8 w-8 rounded-xl shadow-md shadow-blue-500/20 object-contain transition-transform hover:scale-105"
              />
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Convert<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">X</span>
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Universal, high-fidelity file conversion and compression built for speed and simplicity. Fast, intuitive, and 100% private directly in your browser.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>100% Private • Zero Server Uploads</span>
            </div>
          </div>

          {/* Navigation Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3.5">
              Tools
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('documents');
                    scrollToTop();
                  }}
                  className="flex items-center gap-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  <span>Document Converter</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('images');
                    scrollToTop();
                  }}
                  className="flex items-center gap-2 text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-purple-500" />
                  <span>Image Converter</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('compress');
                    scrollToTop();
                  }}
                  className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition"
                >
                  <Minimize2 className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Compress Files</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('zip');
                    scrollToTop();
                  }}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition"
                >
                  <Archive className="h-3.5 w-3.5 text-emerald-500" />
                  <span>ZIP Archiver</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('history');
                    scrollToTop();
                  }}
                  className="flex items-center gap-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  <History className="h-3.5 w-3.5 text-slate-400" />
                  <span>Conversion History</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Capabilities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3.5">
              Features
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>PDF & Word Formatting</li>
              <li>Batch Conversion & Export</li>
              <li>Image Quality Optimization</li>
              <li>Extreme Size Reduction</li>
              <li>Folder Tree Preservation</li>
            </ul>
          </div>

          {/* Trust & Privacy */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3.5">
              Trust & Security
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={onOpenPrivacyModal}
                  className="flex items-center gap-2 font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacyModal}
                  className="flex items-center gap-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  <Lock className="h-3.5 w-3.5 text-purple-500" />
                  <span>Terms of Service</span>
                </button>
              </li>
              <li>
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                  <span>100% In-Browser</span>
                </span>
              </li>
              <li>
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                  <span>Zero Data Storage</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 ConvertX. All rights reserved.</p>

          <div className="flex items-center gap-5">
            <button
              onClick={onOpenPrivacyModal}
              className="hover:text-slate-900 dark:hover:text-white transition"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={onOpenPrivacyModal}
              className="hover:text-slate-900 dark:hover:text-white transition"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition"
            >
              <span>Back to top</span>
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
