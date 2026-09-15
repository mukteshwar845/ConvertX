import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  File,
  Presentation,
  AlignLeft,
  Code,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Download,
  Eye,
  Cloud,
  ShieldCheck,
  Trash2,
  RefreshCw,
  ScanText,
  Zap,
  Sparkles,
  Columns2,
  Layers,
} from 'lucide-react';
import { ConversionItem, TargetFormat, SupportedFormat } from '../types';
import { getAvailableTargets } from '../utils/conversionEngine';

interface ConversionCardProps {
  item: ConversionItem;
  onTargetChange: (id: string, target: TargetFormat) => void;
  onConvertSingle: (id: string) => void;
  onDownload: (item: ConversionItem) => void;
  onPreview: (item: ConversionItem) => void;
  onCompare?: (item: ConversionItem) => void;
  onSyncToCloud: (item: ConversionItem) => void;
  onRemove: (id: string) => void;
}

export interface FormatVisualConfig {
  label: string;
  shortLabel: string;
  category: 'Document' | 'Spreadsheet' | 'Presentation' | 'Image' | 'Data' | 'Code' | 'Text';
  icon: React.ReactNode;
  containerClass: string;
  badgeClass: string;
  accentText: string;
  borderClass: string;
}

export const getFormatVisual = (format: string): FormatVisualConfig => {
  const f = format.toLowerCase();
  switch (f) {
    case 'pdf':
      return {
        label: 'PDF Document',
        shortLabel: 'PDF',
        category: 'Document',
        icon: <FileText className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
        containerClass:
          'border-rose-200 bg-rose-50/90 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300',
        badgeClass:
          'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 border border-rose-200/80 dark:border-rose-800/80',
        borderClass: 'hover:border-rose-300 dark:hover:border-rose-800',
        accentText: 'text-rose-600 dark:text-rose-400',
      };
    case 'docx':
    case 'doc':
      return {
        label: f === 'doc' ? 'Word 97-2003' : 'Word Document',
        shortLabel: f.toUpperCase(),
        category: 'Document',
        icon: <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
        containerClass:
          'border-blue-200 bg-blue-50/90 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300',
        badgeClass:
          'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border border-blue-200/80 dark:border-blue-800/80',
        borderClass: 'hover:border-blue-300 dark:hover:border-blue-800',
        accentText: 'text-blue-600 dark:text-blue-400',
      };
    case 'pptx':
    case 'ppt':
    case 'odp':
      return {
        label: f === 'odp' ? 'OpenDocument Slides' : 'PowerPoint Slides',
        shortLabel: f.toUpperCase(),
        category: 'Presentation',
        icon: <Presentation className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
        containerClass:
          'border-amber-200 bg-amber-50/90 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
        badgeClass:
          'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/80',
        borderClass: 'hover:border-amber-300 dark:hover:border-amber-800',
        accentText: 'text-amber-600 dark:text-amber-400',
      };
    case 'xlsx':
    case 'xls':
    case 'ods':
      return {
        label: f === 'ods' ? 'OpenDocument Sheet' : f === 'xls' ? 'Excel 97-2003' : 'Excel Workbook',
        shortLabel: f.toUpperCase(),
        category: 'Spreadsheet',
        icon: <FileSpreadsheet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
        containerClass:
          'border-emerald-200 bg-emerald-50/90 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
        badgeClass:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/80',
        borderClass: 'hover:border-emerald-300 dark:hover:border-emerald-800',
        accentText: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'csv':
      return {
        label: 'CSV Data Sheet',
        shortLabel: 'CSV',
        category: 'Spreadsheet',
        icon: <FileSpreadsheet className="h-6 w-6 text-teal-600 dark:text-teal-400" />,
        containerClass:
          'border-teal-200 bg-teal-50/90 text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300',
        badgeClass:
          'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800/80',
        borderClass: 'hover:border-teal-300 dark:hover:border-teal-800',
        accentText: 'text-teal-600 dark:text-teal-400',
      };
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'webp':
    case 'bmp':
    case 'gif':
    case 'tiff':
      return {
        label: `${f.toUpperCase()} Image`,
        shortLabel: f.toUpperCase(),
        category: 'Image',
        icon: <ImageIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />,
        containerClass:
          'border-cyan-200 bg-cyan-50/90 text-cyan-700 dark:border-cyan-900/60 dark:bg-cyan-950/40 dark:text-cyan-300',
        badgeClass:
          'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200 border border-cyan-200/80 dark:border-cyan-800/80',
        borderClass: 'hover:border-cyan-300 dark:hover:border-cyan-800',
        accentText: 'text-cyan-600 dark:text-cyan-400',
      };
    case 'svg':
      return {
        label: 'SVG Vector Image',
        shortLabel: 'SVG',
        category: 'Image',
        icon: <FileCode className="h-6 w-6 text-violet-600 dark:text-violet-400" />,
        containerClass:
          'border-violet-200 bg-violet-50/90 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300',
        badgeClass:
          'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200 border border-violet-200/80 dark:border-violet-800/80',
        borderClass: 'hover:border-violet-300 dark:hover:border-violet-800',
        accentText: 'text-violet-600 dark:text-violet-400',
      };
    case 'html':
      return {
        label: 'HTML Document',
        shortLabel: 'HTML',
        category: 'Code',
        icon: <Code className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
        containerClass:
          'border-purple-200 bg-purple-50/90 text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300',
        badgeClass:
          'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border border-purple-200/80 dark:border-purple-800/80',
        borderClass: 'hover:border-purple-300 dark:hover:border-purple-800',
        accentText: 'text-purple-600 dark:text-purple-400',
      };
    case 'md':
      return {
        label: 'Markdown Text',
        shortLabel: 'MD',
        category: 'Text',
        icon: <FileCode className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
        containerClass:
          'border-indigo-200 bg-indigo-50/90 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300',
        badgeClass:
          'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-800/80',
        borderClass: 'hover:border-indigo-300 dark:hover:border-indigo-800',
        accentText: 'text-indigo-600 dark:text-indigo-400',
      };
    case 'json':
    case 'xml':
      return {
        label: `${f.toUpperCase()} Structured Data`,
        shortLabel: f.toUpperCase(),
        category: 'Data',
        icon: <Code className="h-6 w-6 text-sky-600 dark:text-sky-400" />,
        containerClass:
          'border-sky-200 bg-sky-50/90 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300',
        badgeClass:
          'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200 border border-sky-200/80 dark:border-sky-800/80',
        borderClass: 'hover:border-sky-300 dark:hover:border-sky-800',
        accentText: 'text-sky-600 dark:text-sky-400',
      };
    case 'txt':
    case 'rtf':
    case 'odt':
      return {
        label: f === 'rtf' ? 'Rich Text (RTF)' : f === 'odt' ? 'OpenDocument Text' : 'Plain Text',
        shortLabel: f.toUpperCase(),
        category: 'Text',
        icon: <AlignLeft className="h-6 w-6 text-slate-600 dark:text-slate-300" />,
        containerClass:
          'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
        badgeClass:
          'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-slate-600/80',
        borderClass: 'hover:border-slate-400 dark:hover:border-slate-600',
        accentText: 'text-slate-600 dark:text-slate-400',
      };
    default:
      return {
        label: `${format.toUpperCase()} Document`,
        shortLabel: format.toUpperCase(),
        category: 'Document',
        icon: <File className="h-6 w-6 text-slate-500 dark:text-slate-400" />,
        containerClass:
          'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
        badgeClass:
          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
        borderClass: 'hover:border-slate-300 dark:hover:border-slate-700',
        accentText: 'text-slate-500 dark:text-slate-400',
      };
  }
};

export const ConversionCard: React.FC<ConversionCardProps> = ({
  item,
  onTargetChange,
  onConvertSingle,
  onDownload,
  onPreview,
  onCompare,
  onSyncToCloud,
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
      className={`group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${sourceVisual.borderClass}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Distinct File Icon Badge & Detailed Info */}
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Visual File Type Avatar Badge */}
          <div
            className={`relative flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border shadow-2xs transition-transform group-hover:scale-105 ${sourceVisual.containerClass}`}
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

              {/* Source Format Badge with explicit label */}
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sourceVisual.badgeClass}`}
              >
                {sourceVisual.shortLabel}
                <span className="font-normal opacity-75 hidden xs:inline">• {sourceVisual.category}</span>
              </span>

              {/* Cache Hit Badge */}
              {item.cached && (
                <span
                  className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/80"
                  title="Instant replay from verified cryptographic SHA-256 cache"
                >
                  <Zap className="h-3 w-3 text-amber-500" />
                  Instant Cache
                </span>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {formatBytes(item.originalSize)}
              </span>
              <span>•</span>

              {/* Visual Conversion Path Selector */}
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 border border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700/80">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Convert to:</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <select
                  value={item.targetFormat}
                  onChange={(e) => onTargetChange(item.id, e.target.value as TargetFormat)}
                  disabled={item.status === 'converting'}
                  className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs font-bold text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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

                {/* Target badge indicator preview */}
                <span
                  className={`hidden sm:inline-flex rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${targetVisual.badgeClass}`}
                >
                  {targetVisual.shortLabel}
                </span>
              </div>

              {item.durationMs && (
                <>
                  <span>•</span>
                  <span className="text-slate-500 font-mono">{(item.durationMs / 1000).toFixed(1)}s</span>
                </>
              )}

              {item.encrypted && (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60">
                  <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  AES-256
                </span>
              )}

              {(item.ocrExtracted || item.ocrEnabled) && (
                <span
                  className="inline-flex items-center gap-1 rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60"
                  title={item.ocrExtracted ? 'Text extracted using Optical Character Recognition' : 'OCR enabled for scanned content'}
                >
                  <ScanText className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  {item.ocrExtracted ? 'OCR Extracted' : 'OCR'}
                </span>
              )}

              {item.synced && (
                <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                  <Cloud className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  Synced
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
          {item.status === 'queued' && (
            <button
              onClick={() => onConvertSingle(item.id)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Convert
            </button>
          )}

          {item.status === 'converting' && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>{item.progress}%</span>
            </div>
          )}

          {item.status === 'error' && (
            <div className="flex items-center gap-1.5">
              <div
                className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 max-w-[140px] sm:max-w-[200px]"
                title={item.errorMessage || 'Conversion failed'}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.errorMessage || 'Failed'}</span>
              </div>
              <button
                onClick={() => onConvertSingle(item.id)}
                className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition"
                title="Retry conversion"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {item.status === 'completed' && (
            <div className="flex items-center gap-1.5">
              {/* Compare Original & Converted */}
              <button
                onClick={() => (onCompare ? onCompare(item) : onPreview(item))}
                className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/80 p-2 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 shadow-2xs transition"
                title="Compare Original & Converted Files"
              >
                <Columns2 className="h-4 w-4" />
              </button>

              {/* Preview */}
              <button
                onClick={() => onPreview(item)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-2xs transition"
                title="Preview Converted Document"
              >
                <Eye className="h-4 w-4" />
              </button>

              {/* Cloud Sync */}
              <button
                onClick={() => onSyncToCloud(item)}
                className={`flex items-center gap-1 rounded-lg border p-2 transition shadow-2xs ${
                  item.synced
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
                title={item.synced ? 'Synced to Cloud Vault' : 'Sync to Cloud Vault'}
              >
                <Cloud className="h-4 w-4" />
              </button>

              {/* Download */}
              <button
                onClick={() => onDownload(item)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition"
                title="Download Converted File"
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
            className="flex items-center rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
            title="Remove from batch"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Converting Progress Bar */}
      {item.status === 'converting' && (
        <div className="mt-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      )}

      {/* Completed Success Summary Bar with Fidelity Engine Reporting */}
      {item.status === 'completed' && item.convertedSize && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400 min-w-0">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="truncate">
              Ready: {item.convertedName}
            </span>
            <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {formatBytes(item.convertedSize)}
            </span>

            {/* Fidelity Score Pill */}
            {item.fidelity && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  item.fidelity.overallScore >= 90
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : item.fidelity.overallScore >= 75
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                }`}
                title={`Fidelity Score: ${item.fidelity.overallScore}% (${item.fidelity.rating.toUpperCase()}) • Text: ${item.fidelity.metrics.textPreservation}%, Layout: ${item.fidelity.metrics.layoutPreservation}%`}
              >
                <Sparkles className="h-3 w-3" />
                {item.fidelity.overallScore}% Fidelity
              </span>
            )}

            {/* Retry improvement indicator */}
            {item.fidelity?.retried && item.fidelity?.improvementDelta && (
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                (+{item.fidelity.improvementDelta}% Auto-Retry Boost)
              </span>
            )}
          </div>

          {item.checksum && (
            <span
              className="font-mono text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline"
              title={`SHA-256: ${item.checksum}`}
            >
              SHA-256: {item.checksum.slice(0, 10)}...
            </span>
          )}
        </div>
      )}
    </div>
  );
};
