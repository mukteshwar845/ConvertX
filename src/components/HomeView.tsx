import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Minimize2,
  Archive,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Smartphone,
  HardDrive,
  Cpu,
  Layers,
  Stamp,
  QrCode,
  ShieldAlert,
} from 'lucide-react';
import { NavTab } from './Navbar';
import { TargetFormat } from '../types';

export interface HomeViewProps {
  setActiveTab: (tab: NavTab, subTool?: string) => void;
  onFilesAdded: (files: FileList | File[]) => void;
  isDark: boolean;
  isInstallable: boolean;
  onInstallClick: () => void;
  onSetGlobalTarget?: (target: TargetFormat) => void;
}

interface QuickConvertOption {
  from: string;
  to: string;
  fromExt: string;
  toExt: string;
  fromBg: string;
  toBg: string;
  accept: string;
  targetFormat: TargetFormat;
  popularBadge?: string;
}

const quickConverts: QuickConvertOption[] = [
  {
    from: 'Word',
    to: 'PDF',
    fromExt: 'DOCX',
    toExt: 'PDF',
    fromBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300',
    toBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300',
    accept: '.docx,.doc',
    targetFormat: 'pdf',
    popularBadge: 'Most Popular',
  },
  {
    from: 'PDF',
    to: 'Word',
    fromExt: 'PDF',
    toExt: 'DOCX',
    fromBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300',
    toBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300',
    accept: '.pdf',
    targetFormat: 'docx',
  },
  {
    from: 'Images',
    to: 'PDF',
    fromExt: 'JPG / PNG',
    toExt: 'PDF',
    fromBg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300',
    toBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300',
    accept: '.jpg,.jpeg,.png,.webp,.bmp',
    targetFormat: 'pdf',
  },
  {
    from: 'PNG',
    to: 'WebP / JPG',
    fromExt: 'PNG',
    toExt: 'JPG',
    fromBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
    toBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300',
    accept: '.png',
    targetFormat: 'jpg',
  },
  {
    from: 'Word',
    to: 'PowerPoint',
    fromExt: 'DOCX',
    toExt: 'PPTX',
    fromBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300',
    toBg: 'bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300',
    accept: '.docx,.doc',
    targetFormat: 'pptx',
  },
  {
    from: 'PDF',
    to: 'Text',
    fromExt: 'PDF',
    toExt: 'TXT',
    fromBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300',
    toBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    accept: '.pdf',
    targetFormat: 'txt',
  },
];

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  onFilesAdded,
  isDark,
  isInstallable,
  onInstallClick,
  onSetGlobalTarget,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTargetRef = useRef<TargetFormat | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
      setActiveTab('convert', 'documents');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (pendingTargetRef.current && onSetGlobalTarget) {
        onSetGlobalTarget(pendingTargetRef.current);
      }
      onFilesAdded(files);
      setActiveTab('convert', 'documents');
    }
    pendingTargetRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.accept = '*/*';
    }
  };

  const triggerQuickConvert = (qc: QuickConvertOption) => {
    pendingTargetRef.current = qc.targetFormat;
    if (fileInputRef.current) {
      fileInputRef.current.accept = qc.accept;
      fileInputRef.current.click();
    }
  };

  const triggerGeneralBrowse = () => {
    pendingTargetRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.accept = '*/*';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-6 sm:pb-8">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        aria-label="Upload files for conversion"
      />

      {/* ── 1. HERO SECTION ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:px-8 text-white">
        {/* Ambient background glow effects */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/20 blur-[100px]" />
        <div className="pointer-events-none absolute top-1/2 -left-32 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-32 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Trust Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-md shadow-sm mb-6 sm:mb-8 transition-transform hover:scale-105">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>100% Client-Side Private · Zero Server Uploads</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none">
            Universal File Converter
            <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Fast, Powerful & Private.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Convert documents, spreadsheets, presentations, and images directly in your browser.
            No queues, no account required, and your files never leave your device.
          </p>

          {/* Primary Upload Card */}
          <div className="mt-8 sm:mt-10 mx-auto max-w-2xl">
            {/* Desktop Drag & Drop Box */}
            <div
              id="home-drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerGeneralBrowse}
              className={`hidden sm:flex group relative cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-blue-400 bg-blue-500/15 scale-[1.01] shadow-2xl shadow-blue-500/20'
                  : 'border-slate-700/80 bg-slate-900/80 hover:border-blue-400 hover:bg-slate-900/95 backdrop-blur-xl shadow-xl'
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-110">
                <UploadCloud className="h-8 w-8" />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-600/30 group-hover:bg-blue-500 transition">
                  Choose Files to Convert
                </span>
                <span className="text-sm font-medium text-slate-400">or drag & drop here</span>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Supports DOCX, PDF, PPTX, XLSX, PNG, JPG, WEBP, TXT, CSV, MD & more
              </p>

              {/* Supported format badges */}
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {['PDF', 'DOCX', 'XLSX', 'PPTX', 'PNG', 'JPG', 'WEBP', 'ZIP'].map((ext) => (
                  <span
                    key={ext}
                    className="rounded-lg bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 text-[10px] font-bold text-slate-300"
                  >
                    {ext}
                  </span>
                ))}
              </div>
            </div>

            {/* Mobile Primary Button */}
            <button
              onClick={triggerGeneralBrowse}
              className="
                sm:hidden w-full flex items-center justify-center gap-3
                rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
                px-6 py-4.5 min-h-[62px]
                text-base font-bold text-white
                shadow-xl shadow-indigo-500/25
                active:scale-[0.98] transition-transform duration-150
              "
              aria-label="Choose files to convert"
            >
              <UploadCloud className="h-6 w-6 flex-shrink-0 text-white" />
              <div className="text-left">
                <div className="text-sm font-black">Choose File to Convert</div>
                <div className="text-xs text-blue-100 font-medium">Documents · Images · Spreadsheets · PDFs</div>
              </div>
            </button>
          </div>

          {/* Quick Trust Highlights Bar */}
          <div className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>100% In-Browser Privacy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Zero Waiting Queues</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-blue-400" />
              <span>25+ Document Formats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>High-Fidelity Output</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CORE TOOLS SUITE ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              Core Capabilities
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Professional Tools for Every File
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Dedicated tools crafted for specific file conversion, optimization, and compression workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Tool 1: Document Converter */}
          <div
            onClick={() => setActiveTab('convert', 'documents')}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/90 cursor-pointer"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shadow-xs mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Document Converter
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Convert Word (DOCX), PDF, Text, Markdown, and HTML with high-fidelity formatting and layout preservation.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:underline">
                Convert Documents <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                DOCX · PDF · PPTX
              </span>
            </div>
          </div>

          {/* Tool 2: PDF Studio Suite (Unique) */}
          <div
            onClick={() => setActiveTab('pdf-studio')}
            className="group relative flex flex-col justify-between rounded-3xl border border-rose-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-rose-400 hover:shadow-xl dark:border-rose-900/50 dark:bg-slate-900/90 cursor-pointer"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shadow-xs mb-4 group-hover:scale-110 transition-transform">
                <Stamp className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  ConvertX PDF Studio
                </h3>
                <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-black text-rose-600 dark:text-rose-400">
                  Unique
                </span>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Merge multiple PDFs, split & extract custom page ranges, rotate misaligned scans, and stamp watermarks 100% in-browser.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 group-hover:underline">
                Open PDF Studio <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="rounded-lg bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                Merge · Split · Watermark
              </span>
            </div>
          </div>

          {/* Tool 3: Image Converter */}
          <div
            onClick={() => setActiveTab('images')}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-purple-400 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/90 cursor-pointer"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 shadow-xs mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Image Converter & Optimizer
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Transform pictures between PNG, JPG, WebP, SVG, and BMP. Re-encode with quality control and resolution scaling.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:underline">
                Convert Images <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="rounded-lg bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                PNG · JPG · WebP
              </span>
            </div>
          </div>

          {/* Tool 4: Privacy Sanitizer (Unique) */}
          <div
            onClick={() => setActiveTab('privacy-cleaner')}
            className="group relative flex flex-col justify-between rounded-3xl border border-emerald-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl dark:border-emerald-900/50 dark:bg-slate-900/90 cursor-pointer"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-xs mb-4 group-hover:scale-110 transition-transform">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Privacy Sanitizer
                </h3>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                  Security
                </span>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Inspect and strip hidden author profiles, revision timestamps, device fingerprints, and EXIF tags from PDFs, Word, and images.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:underline">
                Sanitize Document <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Zero Data Leak
              </span>
            </div>
          </div>

          {/* Tool 5: QR Code Studio (Unique) */}
          <div
            onClick={() => setActiveTab('qr-studio')}
            className="group relative flex flex-col justify-between rounded-3xl border border-indigo-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-xl dark:border-indigo-900/50 dark:bg-slate-900/90 cursor-pointer"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs mb-4 group-hover:scale-110 transition-transform">
                <QrCode className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Universal QR Studio
                </h3>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                  Vector
                </span>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Generate custom QR codes for URLs, WiFi networks, and contact cards with SVG vector, PNG, and printable A4 PDF card downloads.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:underline">
                Design QR Code <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                SVG · PNG · PDF Card
              </span>
            </div>
          </div>

          {/* Tool 6: File Compressor & ZIP */}
          <div
            onClick={() => setActiveTab('compress')}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/90 cursor-pointer"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs mb-4 group-hover:scale-110 transition-transform">
                <Minimize2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                File Compressor & ZIP
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Shrink file sizes for PDFs, Word files, and photos by up to 85% or package folders into clean .zip archives with zero upload caps.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:underline">
                Compress & Bundle <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                Save up to 85%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. POPULAR 1-CLICK CONVERSIONS ────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-blue-50/40 p-6 sm:p-8 dark:border-slate-800/80 dark:from-slate-900/60 dark:to-blue-950/20 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Popular 1-Click Conversions
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Click any conversion pair below to pick your file and convert directly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {quickConverts.map((qc) => (
              <button
                key={`${qc.from}-${qc.to}`}
                onClick={() => triggerQuickConvert(qc)}
                className="
                  group flex items-center justify-between rounded-2xl
                  border border-slate-200/80 bg-white p-4
                  dark:border-slate-800 dark:bg-slate-900
                  shadow-xs hover:border-blue-400 dark:hover:border-blue-500
                  hover:shadow-md active:scale-[0.98] transition-all duration-150
                  text-left
                "
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span className={`rounded-xl px-2.5 py-1 ${qc.fromBg}`}>
                      {qc.fromExt}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className={`rounded-xl px-2.5 py-1 ${qc.toBg}`}>
                      {qc.toExt}
                    </span>
                  </div>

                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {qc.from} to {qc.to}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {qc.popularBadge && (
                    <span className="hidden md:inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                      {qc.popularBadge}
                    </span>
                  )}
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all dark:bg-slate-800 dark:text-slate-400">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. WHY CONVERTX ARCHITECTURE ──────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            Privacy First Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Why Privacy-Conscious Professionals Choose ConvertX
          </h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Unlike cloud-based conversion websites that upload your files to remote servers, ConvertX operates entirely on your device.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-4">
              <HardDrive className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Zero Server Uploads
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your files never touch any cloud server, database, or external machine. All processing happens directly inside your browser sandbox.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-4">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Instant Native Processing
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Powered by client-side WebAssembly, HTML5 Canvas, and modern JavaScript engines. Conversions finish in seconds without queue wait times.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Confidentiality Guaranteed
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Safe for sensitive legal contracts, proprietary code, financial spreadsheets, and medical reports. No data leaves your machine.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. FORMAT CATEGORIES BREAKDOWN ────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800/80 dark:bg-slate-900 shadow-xs">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Supported File Formats
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              ConvertX supports over 25 industry-standard file extensions across documents, images, and archives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="font-bold text-sm text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>Documents</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['DOCX', 'DOC', 'PDF', 'TXT', 'HTML', 'MD', 'RTF', 'ODT'].map((f) => (
                  <span key={f} className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700 shadow-2xs dark:bg-slate-700 dark:text-slate-200">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="font-bold text-sm text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4" />
                <span>Images</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['PNG', 'JPG', 'JPEG', 'WEBP', 'SVG', 'BMP', 'GIF', 'TIFF'].map((f) => (
                  <span key={f} className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700 shadow-2xs dark:bg-slate-700 dark:text-slate-200">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                <span>Spreadsheets & Data</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['XLSX', 'XLS', 'CSV', 'ODS', 'JSON', 'XML'].map((f) => (
                  <span key={f} className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700 shadow-2xs dark:bg-slate-700 dark:text-slate-200">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="font-bold text-sm text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                <Archive className="h-4 w-4" />
                <span>Presentations & ZIP</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['PPTX', 'PPT', 'ODP', 'ZIP', 'TAR', 'GZ'].map((f) => (
                  <span key={f} className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700 shadow-2xs dark:bg-slate-700 dark:text-slate-200">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. INSTALL PWA BANNER ─────────────────────────────────────── */}
      {isInstallable && (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8 dark:border-blue-900/60 dark:from-slate-900 dark:to-blue-950/60 shadow-sm gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/30 shrink-0">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Install ConvertX as a Desktop or Mobile App
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Convert files offline with zero network latency directly from your dock or home screen.
                </p>
              </div>
            </div>

            <button
              onClick={onInstallClick}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition shrink-0"
            >
              Install App
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
