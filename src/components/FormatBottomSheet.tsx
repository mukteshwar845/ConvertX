import React from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

interface FormatOption {
  value: string;
  label: string;
  description?: string;
  emoji?: string;
}

interface FormatBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  options: FormatOption[];
  selected: string;
  onSelect: (value: string) => void;
  title?: string;
}

export const FormatBottomSheet: React.FC<FormatBottomSheetProps> = ({
  isOpen,
  onClose,
  options,
  selected,
  onSelect,
  title = 'Choose Format',
}) => {
  if (!isOpen) return null;

  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="bottom-sheet-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="bottom-sheet bg-white dark:bg-slate-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="touch-sm flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options list */}
        <div className="px-3 py-2">
          {options.map((opt) => {
            const isSelected = opt.value === selected;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`
                  w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-1
                  text-left transition-all duration-100 min-h-[56px]
                  ${isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800'
                    : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800'
                  }
                `}
              >
                {opt.emoji && (
                  <span className="text-xl w-8 text-center flex-shrink-0">{opt.emoji}</span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{opt.label}</div>
                  {opt.description && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {opt.description}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <Check className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-3" />
      </div>
    </>
  );
};

// ─── Trigger button ────────────────────────────────────────────
interface FormatSelectButtonProps {
  value: string;
  label: string;
  onClick: () => void;
  className?: string;
}

export const FormatSelectButton: React.FC<FormatSelectButtonProps> = ({
  value,
  label,
  onClick,
  className = '',
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center justify-between gap-2 w-full rounded-2xl
      border-2 border-slate-200 dark:border-slate-700
      bg-white dark:bg-slate-800/80
      px-4 py-3.5 min-h-[52px]
      text-sm font-bold text-slate-800 dark:text-white
      hover:border-blue-400 dark:hover:border-blue-500
      focus:outline-none focus:ring-2 focus:ring-blue-500/30
      transition-all duration-150 active:scale-[0.98]
      ${className}
    `}
    aria-haspopup="dialog"
  >
    <div className="flex items-center gap-2">
      <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
        TO
      </span>
      <span className="text-base font-black">{label.toUpperCase()}</span>
    </div>
    <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
  </button>
);
