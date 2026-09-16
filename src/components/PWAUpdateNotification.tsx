import React, { useState, useEffect } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';

export const PWAUpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [applyUpdateFn, setApplyUpdateFn] = useState<(() => void) | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ applyUpdate: () => void }>;
      if (customEvent.detail && typeof customEvent.detail.applyUpdate === 'function') {
        setApplyUpdateFn(() => customEvent.detail.applyUpdate);
        setUpdateAvailable(true);
      }
    };

    window.addEventListener('pwa-update-available', handleUpdate);
    return () => {
      window.removeEventListener('pwa-update-available', handleUpdate);
    };
  }, []);

  if (!updateAvailable) return null;

  const handleUpdateClick = () => {
    setIsUpdating(true);
    if (applyUpdateFn) {
      applyUpdateFn();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 max-w-sm animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-200/90 bg-white/95 p-3.5 shadow-2xl backdrop-blur-xl dark:border-blue-900/60 dark:bg-slate-900/95">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Update Available
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              A new version of ConvertX is ready.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleUpdateClick}
            disabled={isUpdating}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'Updating...' : 'Update Now'}</span>
          </button>
          <button
            onClick={() => setUpdateAvailable(false)}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            aria-label="Dismiss update notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
