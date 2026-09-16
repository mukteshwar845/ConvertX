import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3500);
      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  if (showRestored) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md pt-safe animate-in slide-in-from-top-2 duration-300">
        <Wifi className="h-3.5 w-3.5" />
        <span>Connection restored — All services & OCR online</span>
      </div>
    );
  }

  return (
    <aside
      aria-label="Offline status notification"
      className="fixed top-0 left-0 right-0 z-50 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 bg-slate-900/95 dark:bg-slate-950/95 px-4 py-2 text-xs font-medium text-slate-100 shadow-xl border-b border-slate-800 backdrop-blur-md pt-safe animate-in slide-in-from-top-2 duration-300 text-center sm:text-left"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
        <span className="font-bold text-amber-300">You're offline:</span>
      </div>

      <span className="text-slate-300">
        Your internet connection is unavailable. Previously loaded parts of ConvertX and local conversion tools remain available.
      </span>

      <span className="hidden lg:inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] text-slate-300 border border-slate-700">
        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
        Local history & offline tools active
      </span>
    </aside>
  );
};
