import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  ScanText,
  Zap,
  Sparkles,
  Columns2,
} from 'lucide-react';
import { ConversionItem, TargetFormat } from '../types';
import { getAvailableTargets } from '../utils/conversionEngine';
import { getFormatVisual, FormatVisualConfig } from '../utils/formatVisuals';
export type { FormatVisualConfig };
export { getFormatVisual };

interface ConversionCardProps {
  item: ConversionItem;
  onTargetChange: (id: string, target: TargetFormat) => void;
  onConvertSingle: (id: string) => void;
  onDownload: (item: ConversionItem) => void;
  onPreview: (item: ConversionItem) => void;
  onCompare?: (item: ConversionItem) => void;
  onRemove: (id: string) => void;
}

export const ConversionCard: React.FC<ConversionCardProps> = ({
  item,
  onTargetChange,
  onConvertSingle,
  onDownload,
  onPreview,
  onCompare,
  onRemove,
}) => {
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const availableTargets = getAvailableTargets(item.sourceFormat, item.ocrEnabled);
  const sourceVisual = getFormatVisual(item.sourceFormat);
  const targetVisual = getFormatVisual(item.targetFormat);

  return (
    <div
      id={`conversion-card-${item.id}`}
      className={`group relative rounded-2xl border bg-white/90 p-4 shadow-xs transition-all duration-200 hover:shadow-md dark:bg-slate-900/90 backdrop-blur-sm ${
        item.status === 'completed'
          ? 'border-emerald-200/80 dark:border-emerald-900/60'
          : item.status === 'converting'
          ? 'border-blue-300 dark:border-blue-800'
          : 'border-slate-200/90 dark:border-slate-800/90'
      }`}
    >
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Icon Badge & File Details */}
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Format Avatar */}
          <div
            className={`relative flex h-13 w-13 shrink-0 flex-col items-center justify-center rounded-xl border shadow-2xs transition-transform group-hover:scale-105 ${sourceVisual.containerClass}`}
            title={`${sourceVisual.label} (${item.sourceFormat.toUpperCase()})`}
          >
            {sourceVisual.icon}
            <span className="mt-0.5 font-mono text-[9px] font-black uppercase tracking-wider leading-none">
              {sourceVisual.shortLabel}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="truncate text-sm font-bold text-slate-900 dark:text-white"
                title={item.originalName}
              >
                {item.originalName}
              </span>

              {/* Source Badge */}
              <span
                className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sourceVisual.badgeClass}`}
              >
                {sourceVisual.shortLabel}
              </span>

              {/* Cache Hit Badge */}
              {item.cached && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/80">
                  <Zap className="h-3 w-3 text-amber-500" />
                  Instant
                </span>
              )}
            </div>

            {/* Subtitle with size and target format picker */}
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {formatBytes(item.originalSize)}
              </span>
              <span>•</span>

              {/* Format Target Dropdown */}
              <div className="flex items-center gap-1.5 rounded-xl bg-slate-100/80 px-2.5 py-1 border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Convert to:</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <select
                  value={item.targetFormat}
                  onChange={(e) => onTargetChange(item.id, e.target.value as TargetFormat)}
                  disabled={item.status === 'converting'}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-0.5 text-xs font-bold text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  {availableTargets.map((t) => {
                    const tv = getFormatVisual(t);
                    return (
                      <option key={t} value={t}>
                        {tv.shortLabel} ({tv.label})
                      </option>
                    );
                  })}
                </select>

                <span
                  className={`hidden sm:inline-flex rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${targetVisual.badgeClass}`}
                >
                  {targetVisual.shortLabel}
                </span>
              </div>

              {item.ocrExtracted && (
                <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60">
                  <ScanText className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  OCR Text
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
          {item.status === 'queued' && (
            <button
              onClick={() => onConvertSingle(item.id)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Convert</span>
            </button>
          )}

          {item.status === 'converting' && (
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Converting {item.progress}%</span>
            </div>
          )}

          {item.status === 'error' && (
            <div className="flex items-center gap-1.5">
              <div
                className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 max-w-[150px] sm:max-w-[200px]"
                title={item.errorMessage || 'Conversion failed'}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.errorMessage || 'Failed'}</span>
              </div>
              <button
                onClick={() => onConvertSingle(item.id)}
                className="flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {item.status === 'completed' && (
            <div className="flex items-center gap-2">
              {/* Compare Button */}
              <button
                onClick={() => (onCompare ? onCompare(item) : onPreview(item))}
                className="flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50/80 p-2 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 shadow-2xs transition"
                title="Compare Side-by-Side"
              >
                <Columns2 className="h-4 w-4" />
                <span className="hidden md:inline text-xs font-bold">Compare</span>
              </button>

              {/* Preview Button */}
              <button
                onClick={() => onPreview(item)}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-2xs transition"
                title="Preview Converted File"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden md:inline text-xs font-bold">Preview</span>
              </button>

              {/* Download Button */}
              <button
                onClick={() => onDownload(item)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition"
                title="Save converted file"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save</span>
              </button>
            </div>
          )}

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.id)}
            disabled={item.status === 'converting'}
            className="flex items-center rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
            title="Remove file"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar during conversion */}
      {item.status === 'converting' && (
        <div className="mt-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      )}

      {/* Completed Success Summary Bar */}
      {item.status === 'completed' && item.convertedSize && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100/90 pt-2.5 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400 min-w-0">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="truncate font-bold">Ready: {item.convertedName}</span>
            <span className="shrink-0 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {formatBytes(item.convertedSize)}
            </span>

            {/* Quality / Fidelity Pill */}
            {item.fidelity && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80"
                title={`Quality fidelity score: ${item.fidelity.overallScore}%`}
              >
                <Sparkles className="h-3 w-3 text-emerald-500" />
                {item.fidelity.overallScore}% Quality Match
              </span>
            )}
          </div>

          {item.durationMs && (
            <span className="text-[11px] text-slate-400">
              {(item.durationMs / 1000).toFixed(1)}s
            </span>
          )}
        </div>
      )}
    </div>
  );
};
