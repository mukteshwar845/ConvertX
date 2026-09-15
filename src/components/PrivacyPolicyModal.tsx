import React, { useEffect } from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  Database,
  FileCheck,
  Scale,
  CheckCircle2,
  AlertCircle,
  Cpu,
} from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-6 py-4 dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 shadow-2xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Privacy Policy & Legal Terms
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Effective: September 2026 • 100% Client-Side Privacy Guarantee
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-slate-200/60 bg-emerald-50/50 p-4 dark:border-slate-800/60 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Zero Document Uploads</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>No Tracking or Ad Cookies</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>100% User Ownership</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              1. 100% In-Browser Client-Side Processing
            </h3>
            <p>
              Unlike traditional online conversion services that require uploading confidential files to remote servers,
              <strong> ConvertX performs file conversions directly on your local device</strong> using modern WebAssembly,
              HTML5 Canvas, and client-side JavaScript engines.
            </p>
            <p>
              Your documents, images, spreadsheets, presentations, and code files are processed entirely in your browser’s
              memory sandbox. Our servers never receive, inspect, log, or store your documents.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              <Database className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              2. Local Storage Usage (`localStorage`)
            </h3>
            <p>
              ConvertX utilizes your browser’s local storage strictly for client-side user experience:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li>
                <strong>Theme Preference:</strong> Saves your selected Day (Light) or Night (Dark) mode choice.
              </li>
              <li>
                <strong>Conversion History:</strong> Keeps a local record of recently converted file names, sizes, and timestamps
                solely on your device so you can download or review them during your work session.
              </li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You can permanently erase all conversion history at any time using the "Clear All" button in the History tab.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              <Lock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              3. Optical Character Recognition (OCR) Data Handling
            </h3>
            <p>
              When the Optical Character Recognition (OCR) feature is toggled on for scanned paper documents or image-only PDFs,
              temporary document frames are submitted to extract text.
            </p>
            <p>
              This OCR transcription process is transient: frames are analyzed in-flight for text extraction and are
              <strong> never retained, archived, or used for model training</strong>. If OCR is toggled off, all processing
              is 100% offline and strictly local to your machine.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              4. Intellectual Property & File Ownership
            </h3>
            <p>
              ConvertX claims <strong>no ownership, copyright, or licensing rights</strong> over any content, documents,
              images, or text you convert or compare using the application. All original files and converted outputs remain
              100% your exclusive property.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              <Scale className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              5. Disclaimer of Warranties & Limitation of Liability
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              ConvertX is provided under the permissive MIT License on an "AS IS" and "AS AVAILABLE" basis without warranty of any kind.
              While the engine employs high-fidelity document generation standards, users are encouraged to verify output files
              for critical legal, academic, or financial purposes. In no event shall the authors or copyright holders be liable for
              any damages arising from the use of this software.
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 bg-slate-50/80 px-6 py-4 dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>100% Client-Side Sandbox • Zero Remote Data Retention</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition active:scale-95"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
