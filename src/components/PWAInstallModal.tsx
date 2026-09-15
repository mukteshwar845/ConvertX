import { Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  onNativeInstall: () => void;
  canNativeInstall: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isIOS,
  onNativeInstall,
  canNativeInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <img
          src="/icon.svg"
          alt="ConvertX App"
          className="h-12 w-12 rounded-2xl shadow-md shadow-blue-500/25 object-contain"
        />

        <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
          Install ConvertX App
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Install on iOS or Android for standalone, lightning-fast offline file conversions and compression.
        </p>

        {isIOS ? (
          <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-[11px]">
                1
              </div>
              <div>
                Tap the <strong className="text-slate-900 dark:text-white">Share</strong> icon in Safari's bottom toolbar.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-[11px]">
                2
              </div>
              <div>
                Scroll down and tap <strong className="text-slate-900 dark:text-white">Add to Home Screen</strong>.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-[11px]">
                3
              </div>
              <div>
                Launch directly from your home screen just like a native mobile app!
              </div>
            </div>
          </div>
        ) : canNativeInstall ? (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Click below to install ConvertX to your device launcher.
            </p>
            <button
              onClick={() => {
                onNativeInstall();
                onClose();
              }}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Add to Device
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <p>
              To install in Chrome or Android: tap the <strong>three dots menu (⋮)</strong> and select <strong>Install App</strong> or <strong>Add to Home screen</strong>.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
