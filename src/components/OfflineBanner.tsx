import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      const t = setTimeout(() => setShowRestored(false), 3000);
      return () => clearTimeout(t);
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
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg pt-safe animate-in slide-in-from-top-2 duration-300">
        <Wifi className="h-4 w-4" />
        <span>Connection restored</span>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg pt-safe animate-in slide-in-from-top-2 duration-300">
      <WifiOff className="h-4 w-4 text-amber-400" />
      <span>You're offline — conversion requires a connection</span>
    </div>
  );
};
