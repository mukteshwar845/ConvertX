import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex max-w-md flex-col gap-2 pointer-events-none sm:bottom-6 sm:right-6"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const config = {
    success: {
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      border: 'border-emerald-200 dark:border-emerald-900/60',
      bg: 'bg-white dark:bg-slate-900',
      badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200',
    },
    error: {
      icon: <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />,
      border: 'border-rose-200 dark:border-rose-900/60',
      bg: 'bg-white dark:bg-slate-900',
      badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200',
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
      border: 'border-amber-200 dark:border-amber-900/60',
      bg: 'bg-white dark:bg-slate-900',
      badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200',
    },
    info: {
      icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />,
      border: 'border-blue-200 dark:border-blue-900/60',
      bg: 'bg-white dark:bg-slate-900',
      badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200',
    },
  }[toast.type];

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg backdrop-blur-xs transition-all animate-in slide-in-from-bottom-3 duration-200 ${config.bg} ${config.border}`}
    >
      {config.icon}
      <div className="flex-1 min-w-0 pr-2">
        {toast.title && (
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            {toast.title}
          </h4>
        )}
        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
