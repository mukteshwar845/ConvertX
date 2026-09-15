import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Presentation,
} from 'lucide-react';

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
  const f = (format || '').toLowerCase();
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
        label: 'HTML Webpage',
        shortLabel: 'HTML',
        category: 'Code',
        icon: <FileCode className="h-6 w-6 text-orange-600 dark:text-orange-400" />,
        containerClass:
          'border-orange-200 bg-orange-50/90 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300',
        badgeClass:
          'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 border border-orange-200/80 dark:border-orange-800/80',
        borderClass: 'hover:border-orange-300 dark:hover:border-orange-800',
        accentText: 'text-orange-600 dark:text-orange-400',
      };
    case 'json':
    case 'xml':
      return {
        label: f.toUpperCase() + ' Data',
        shortLabel: f.toUpperCase(),
        category: 'Data',
        icon: <FileCode className="h-6 w-6 text-sky-600 dark:text-sky-400" />,
        containerClass:
          'border-sky-200 bg-sky-50/90 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300',
        badgeClass:
          'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200 border border-sky-200/80 dark:border-sky-800/80',
        borderClass: 'hover:border-sky-300 dark:hover:border-sky-800',
        accentText: 'text-sky-600 dark:text-sky-400',
      };
    case 'txt':
    case 'md':
    default:
      return {
        label: f === 'md' ? 'Markdown Document' : 'Plain Text',
        shortLabel: f === 'md' ? 'MD' : 'TXT',
        category: 'Text',
        icon: <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />,
        containerClass:
          'border-slate-200 bg-slate-50/90 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
        badgeClass:
          'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80',
        borderClass: 'hover:border-slate-300 dark:hover:border-slate-700',
        accentText: 'text-slate-600 dark:text-slate-400',
      };
  }
};
