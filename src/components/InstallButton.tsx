import React from 'react';
import { Download, Sparkles, Smartphone, Laptop, Check } from 'lucide-react';

export interface InstallButtonProps {
  onClick: () => void;
  variant?: 'navbar' | 'hero' | 'card' | 'modal';
  className?: string;
  isStandalone?: boolean;
}

export const InstallButton: React.FC<InstallButtonProps> = ({
  onClick,
  variant = 'navbar',
  className = '',
  isStandalone = false,
}) => {
  if (isStandalone) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
        <Check className="h-3.5 w-3.5" />
        <span>Installed</span>
      </div>
    );
  }

  if (variant === 'navbar') {
    return (
      <button
        id="nav-install-pwa-btn"
        type="button"
        onClick={onClick}
        className={`
          group relative inline-flex items-center gap-2 rounded-xl
          bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600
          hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500
          text-white font-bold text-xs
          px-3.5 py-1.5 min-h-[36px]
          sheen-glow install-btn-glow gradient-animated
          transition-transform duration-150 active:scale-95
          cursor-pointer shadow-md select-none
          ${className}
        `}
        title="Install ConvertX App directly to your device"
        aria-label="Install ConvertX Application"
      >
        <span className="icon-bounce flex items-center justify-center">
          <Download className="h-3.5 w-3.5 stroke-[2.5]" />
        </span>
        <span className="tracking-tight">Install App</span>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/20 dark:bg-white/25 px-1.5 py-0.5 text-[10px] font-black text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Free
        </span>
      </button>
    );
  }

  if (variant === 'hero') {
    return (
      <button
        id="hero-install-pwa-btn"
        type="button"
        onClick={onClick}
        className={`
          group relative inline-flex items-center justify-between gap-3 sm:gap-4
          rounded-2xl p-1 pr-4 sm:pr-5
          bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600
          hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500
          text-white sheen-glow install-btn-glow gradient-animated
          transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
          cursor-pointer shadow-lg shadow-indigo-500/30 select-none
          ${className}
        `}
        title="Install ConvertX directly to your phone, tablet, or PC"
        aria-label="Install ConvertX application directly"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-inner text-white">
            <Download className="h-5 w-5 sm:h-6 sm:w-6 icon-bounce" />
          </span>
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-tight">
              <span>Install ConvertX App</span>
              <span className="rounded-md bg-emerald-400 text-slate-950 font-black text-[9px] uppercase px-1.5 py-0.2 tracking-wider">
                Direct
              </span>
            </div>
            <p className="text-[11px] text-blue-100/90 hidden xs:block">
              100% Free · Works Offline · Desktop & Mobile
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-white/15 px-2.5 py-1 rounded-lg">
          <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Get App</span>
        </div>
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <button
        id="card-install-pwa-btn"
        type="button"
        onClick={onClick}
        className={`
          group relative inline-flex items-center justify-center gap-2 rounded-xl
          bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600
          hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500
          text-white font-bold text-xs
          px-4 py-2.5 min-h-[40px]
          sheen-glow install-btn-glow gradient-animated
          transition-transform duration-150 active:scale-95
          cursor-pointer shadow-md select-none
          ${className}
        `}
        title="Install ConvertX directly to your device"
        aria-label="Install ConvertX App"
      >
        <Download className="h-4 w-4 icon-bounce" />
        <span>Install Directly to Device</span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </button>
    );
  }

  // variant === 'modal'
  return (
    <button
      id="modal-install-pwa-btn"
      type="button"
      onClick={onClick}
      className={`
        group relative w-full flex items-center justify-center gap-2.5 rounded-2xl
        bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600
        hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500
        text-white font-extrabold text-sm
        py-3.5 px-5 min-h-[48px]
        sheen-glow install-btn-glow gradient-animated
        transition-all duration-150 hover:scale-[1.01] active:scale-[0.98]
        cursor-pointer shadow-lg shadow-blue-500/30 select-none
        ${className}
      `}
      title="Download and install application directly"
      aria-label="Download and install ConvertX"
    >
      <Download className="h-4 w-4 icon-bounce" />
      <span>Install ConvertX Now</span>
      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black text-white">
        Free
      </span>
    </button>
  );
};
