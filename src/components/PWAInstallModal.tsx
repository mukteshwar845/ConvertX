import React from 'react';
import { Share, PlusSquare, X, Download, Smartphone, Laptop, CheckCircle2 } from 'lucide-react';
import { InstallButton } from './InstallButton';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  onNativeInstall: () => void;
  canNativeInstall: boolean;
  isStandalone?: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isIOS,
  onNativeInstall,
  canNativeInstall,
  isStandalone = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div className="relative w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3.5">
          <img
            src="/icon-192.png"
            alt="ConvertX App Icon"
            className="h-14 w-14 rounded-2xl shadow-md shadow-blue-500/25 object-cover"
          />
          <div>
            <h2 id="install-modal-title" className="text-base font-extrabold text-slate-900 dark:text-white">
              Install ConvertX
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standalone Desktop & Mobile App
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Install ConvertX on your device for lightning-fast, offline-capable file conversion with zero web browser chrome and complete privacy.
        </p>

        {isStandalone ? (
          <div className="mt-5 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Already Installed!</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-600/90 dark:text-emerald-400/90">
              ConvertX is currently running in standalone application mode on this device.
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Safari Guide */
          <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-extrabold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-xs">
                1
              </div>
              <div>
                Tap the <strong className="text-slate-900 dark:text-white inline-flex items-center gap-1"><Share className="h-3.5 w-3.5" /> Share</strong> button in Safari's toolbar.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-extrabold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-xs">
                2
              </div>
              <div>
                Scroll down and tap <strong className="text-slate-900 dark:text-white inline-flex items-center gap-1"><PlusSquare className="h-3.5 w-3.5" /> Add to Home Screen</strong>.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-extrabold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-xs">
                3
              </div>
              <div>
                Tap <strong className="text-slate-900 dark:text-white">Add</strong> in the top-right corner to place ConvertX on your home screen.
              </div>
            </div>
          </div>
        ) : canNativeInstall ? (
          /* Android / Chrome Native Install */
          <div className="mt-5 space-y-3">
            <InstallButton
              variant="modal"
              onClick={onNativeInstall}
            />
            <p className="text-center text-[11px] text-slate-400">
              No app store required · Instant direct installation
            </p>
          </div>
        ) : (
          /* Desktop / Unsupported Manual Guide */
          <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Laptop className="h-4 w-4 text-blue-500" />
              <span>Browser Installation</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              In Chrome, Edge, or Brave: Click the <strong>Install icon (⊕)</strong> in the right of the address bar, or open the <strong>menu (⋮)</strong> and select <strong>Install ConvertX</strong>.
            </p>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
