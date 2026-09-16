import React from 'react';
import { Download, Sparkles, Check, ArrowRight } from 'lucide-react';

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
      <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
        <Check className="h-3.5 w-3.5" />
        <span>Installed</span>
      </div>
    );
  }

  // 1. NAVBAR VARIANT: Compact (h-9), perfectly proportioned with theme & settings buttons, sleek glow & sheen, NO "Free" text
  if (variant === 'navbar') {
    return (
      <button
        id="nav-install-pwa-btn"
        type="button"
        onClick={onClick}
        className={`
          group relative inline-flex items-center gap-1.5 rounded-xl
          h-9 px-3
          bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600
          hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500
          text-white font-semibold text-xs
          border border-blue-400/30 dark:border-indigo-400/30
          sheen-glow install-btn-glow gradient-animated
          transition-all duration-150 active:scale-95
          cursor-pointer shadow-xs hover:shadow-md hover:shadow-indigo-500/25
          select-none flex-shrink-0
          ${className}
        `}
        title="Install ConvertX App directly to your device"
        aria-label="Install ConvertX Application"
      >
        <Download className="h-3.5 w-3.5 icon-bounce stroke-[2.5]" />
        <span className="tracking-tight font-medium">Install App</span>
      </button>
    );
  }

  // 2. HERO VARIANT: Sleek, high-tech, professional CTA with cool effects, NO "Free" word
  if (variant === 'hero') {
    return (
      <button
        id="hero-install-pwa-btn"
        type="button"
        onClick={onClick}
        className={`
          group relative inline-flex items-center justify-between gap-3
          rounded-xl py-2 px-3.5 sm:px-4
          bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600
          hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500
          text-white font-semibold text-xs
          border border-blue-400/30 dark:border-indigo-400/30
          sheen-glow install-btn-glow gradient-animated
          transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
          cursor-pointer shadow-md shadow-indigo-500/20 select-none
          ${className}
        `}
        title="Install ConvertX directly to your phone, tablet, or PC"
        aria-label="Install ConvertX application directly"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-xs text-white">
            <Download className="h-4 w-4 icon-bounce" />
          </span>
          <div className="text-left">
            <div className="font-bold tracking-tight text-xs sm:text-sm">
              Install ConvertX App
            </div>
            <p className="text-[10px] text-blue-100/80 font-normal">
              Direct to Device · Works Offline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold bg-white/15 px-2 py-0.5 rounded-md text-white/90">
          <span>Get</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>
    );
  }

  // 3. CARD VARIANT: Compact, elegant button for Settings
  if (variant === 'card') {
    return (
      <button
        id="card-install-pwa-btn"
        type="button"
        onClick={onClick}
        className={`
          group relative inline-flex items-center justify-center gap-2 rounded-xl
          h-9 px-3.5
          bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600
          hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500
          text-white font-semibold text-xs
          border border-blue-400/30 dark:border-indigo-400/30
          sheen-glow install-btn-glow gradient-animated
          transition-all duration-150 active:scale-95
          cursor-pointer shadow-xs hover:shadow-md hover:shadow-indigo-500/25
          select-none
          ${className}
        `}
        title="Install ConvertX directly to your device"
        aria-label="Install ConvertX App"
      >
        <Download className="h-3.5 w-3.5 icon-bounce" />
        <span>Install to Device</span>
      </button>
    );
  }

  // 4. MODAL VARIANT: Refined, professional action button without "Free" badge
  return (
    <button
      id="modal-install-pwa-btn"
      type="button"
      onClick={onClick}
      className={`
        group relative w-full flex items-center justify-center gap-2 rounded-xl
        bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600
        hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500
        text-white font-bold text-xs
        py-2.5 px-4 min-h-[42px]
        border border-blue-400/30 dark:border-indigo-400/30
        sheen-glow install-btn-glow gradient-animated
        transition-all duration-150 hover:scale-[1.01] active:scale-[0.98]
        cursor-pointer shadow-md shadow-blue-500/25 select-none
        ${className}
      `}
      title="Download and install application directly"
      aria-label="Download and install ConvertX"
    >
      <Download className="h-4 w-4 icon-bounce" />
      <span>Install ConvertX Application</span>
    </button>
  );
};
