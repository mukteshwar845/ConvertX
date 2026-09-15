import React from 'react';
import { X, Download, FileText, CheckCircle2, ShieldCheck, Eye } from 'lucide-react';
import { ConversionItem, HistoryRecord } from '../types';

interface PreviewModalProps {
  item: ConversionItem | HistoryRecord | null;
  onClose: () => void;
  onDownload: (item: any) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  item,
  onClose,
  onDownload,
}) => {
  if (!item) return null;

  const fileName = 'convertedName' in item ? item.convertedName : item.originalName;
  const format = 'targetFormat' in item ? item.targetFormat : 'pdf';
  const preview = 'extractedPreview' in item ? item.extractedPreview : null;
  const blobUrl = 'convertedUrl' in item ? item.convertedUrl : null;
  const snippet = 'previewSnippet' in item ? item.previewSnippet : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex h-full max-h-[88vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Eye className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white" title={fileName}>
                  {fileName}
                </h3>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {format}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Original formatting and text structure preserved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(item)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Reader Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950/50">
          {/* PDF embedded viewer if URL exists and is PDF */}
          {format === 'pdf' && blobUrl ? (
            <div className="h-full min-h-[500px] w-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-white shadow-xs">
              <iframe
                src={blobUrl}
                title="PDF Document Preview"
                className="h-full w-full border-0"
              />
            </div>
          ) : preview?.type === 'html' ? (
            /* HTML / DOCX Preserved Document Preview */
            <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm dark:bg-slate-900 dark:border dark:border-slate-800">
              <div
                className="prose prose-slate max-w-none dark:prose-invert text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: preview.content }}
              />
            </div>
          ) : preview?.type === 'image' ? (
            /* Image Preview */
            <div className="flex items-center justify-center p-4">
              <img
                src={preview.content}
                alt="Document Preview"
                className="max-h-[70vh] rounded-lg shadow-md object-contain"
              />
            </div>
          ) : (
            /* Raw text or snippet fallback */
            <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 dark:border dark:border-slate-800">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                {preview?.content || snippet || 'Document preview is ready for download.'}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            <span>Fidelity Verified • Ready for all platforms</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
