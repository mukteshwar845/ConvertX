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
} from 'lucide-react';
import { ConversionItem, TargetFormat } from '../types';
import { getAvailableTargets } from '../utils/conversionEngine';

interface ConversionCardProps {
  item: ConversionItem;
  onTargetChange: (id: string, target: TargetFormat) => void;
  onConvertSingle: (id: string) => void;
  onDownload: (item: ConversionItem) => void;
  onPreview: (item: ConversionItem) => void;
  onSyncToCloud: (item: ConversionItem) => void;
  onRemove: (id: string) => void;
}

interface FormatVisualConfig {
  label: string;
  shortLabel: string;
  category: string;
  icon: React.ReactNode;
  containerClass: string;
  badgeClass: string;
  accentText: string;
}

const getFormatVisual = (format: string): FormatVisualConfig => {
  switch (format) {
    case 'pdf':
      return {
        label: 'PDF Document',
        shortLabel: 'PDF',
        category: 'Document',
        icon: <FileText className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
        containerClass:
          'border-rose-200 bg-rose-50/80 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300',
        badgeClass:
          'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60',
        accentText: 'text-rose-600 dark:text-rose-400',
      };
    case 'docx':
      return {
        label: 'Word Document',
        shortLabel: 'DOCX',
        category: 'Word Processing',
        icon: <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
        containerClass:
          'border-blue-200 bg-blue-50/80 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300',
        badgeClass:
          'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60',
        accentText: 'text-blue-600 dark:text-blue-400',
      };
    case 'pptx':
      return {
        label: 'PowerPoint Slides',
        shortLabel: 'PPTX',
        category: 'Presentation',
        icon: <Presentation className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
        containerClass:
          'border-amber-200 bg-amber-50/80 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
        badgeClass:
          'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60',
        accentText: 'text-amber-600 dark:text-amber-400',
      };
    case 'png':
      return {
        label: 'PNG Image',
        shortLabel: 'PNG',
        category: 'Raster Image',
        icon: <ImageIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />,
        containerClass:
          'border-teal-200 bg-teal-50/80 text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300',
        badgeClass:
          'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60',
        accentText: 'text-teal-600 dark:text-teal-400',
      };
    case 'jpg':
    case 'jpeg':
      return {
        label: 'JPEG Image',
        shortLabel: 'JPG',
        category: 'Photo Image',
        icon: <ImageIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
        containerClass:
          'border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
        badgeClass:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60',
        accentText: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'html':
      return {
        label: 'HTML Document',
        shortLabel: 'HTML',
        category: 'Web Page',
        icon: <Code className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
        containerClass:
          'border-purple-200 bg-purple-50/80 text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300',
        badgeClass:
          'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60',
        accentText: 'text-purple-600 dark:text-purple-400',
      };
    case 'md':
      return {
        label: 'Markdown Text',
        shortLabel: 'MD',
        category: 'Formatted Text',
        icon: <FileCode className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
        containerClass:
          'border-indigo-200 bg-indigo-50/80 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300',
        badgeClass:
          'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60',
        accentText: 'text-indigo-600 dark:text-indigo-400',
      };
    case 'txt':
      return {
        label: 'Plain Text',
        shortLabel: 'TXT',
        category: 'Plain Document',
        icon: <AlignLeft className="h-6 w-6 text-slate-600 dark:text-slate-300" />,
        containerClass:
          'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
        badgeClass:
          'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border border-slate-300/60 dark:border-slate-600/60',
        accentText: 'text-slate-600 dark:text-slate-400',
      };
    default:
      return {
        label: `${format.toUpperCase()} File`,
        shortLabel: format.toUpperCase(),
        category: 'File',
        icon: <File className="h-6 w-6 text-slate-500 dark:text-slate-400" />,
        containerClass:
          'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
        badgeClass:
          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
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
      className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
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
                <span className="font-normal opacity-70 hidden xs:inline">• {sourceVisual.category}</span>
              </span>
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
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
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
            <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
              <AlertCircle className="h-4 w-4" />
              <span className="truncate max-w-[120px]">{item.errorMessage || 'Failed'}</span>
            </div>
          )}

          {item.status === 'completed' && (
            <div className="flex items-center gap-1.5">
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

      {/* Completed Success Summary Bar */}
      {item.status === 'completed' && item.convertedSize && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 min-w-0">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="truncate">
              Ready: {item.convertedName}
            </span>
            <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {formatBytes(item.convertedSize)}
            </span>
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

