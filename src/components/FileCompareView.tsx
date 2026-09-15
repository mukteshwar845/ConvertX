import React, { useState, useRef } from 'react';
import {
  Columns2,
  UploadCloud,
  FileText,
  Sparkles,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Trash2,
  SlidersHorizontal,
  FileCode,
  Image as ImageIcon,
  Copy,
  Check,
} from 'lucide-react';
import { parseDocx, parsePdfText } from '../utils/conversionEngine';
import { detectFileFormat } from '../utils/fileDetector';
import { evaluateDocumentFidelity } from '../utils/fidelityEngine';

export const FileCompareView: React.FC = () => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [textA, setTextA] = useState<string>('');
  const [textB, setTextB] = useState<string>('');
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [diffStats, setDiffStats] = useState<{
    wordsA: number;
    wordsB: number;
    charsA: number;
    charsB: number;
    linesA: number;
    linesB: number;
  } | null>(null);

  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  const extractContent = async (file: File): Promise<{ text: string; previewUrl: string | null }> => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const arrayBuffer = await file.arrayBuffer();

    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'bmp', 'gif'].includes(ext)) {
      const previewUrl = URL.createObjectURL(file);
      return { text: `[Image: ${file.name} - ${file.type}, ${file.size} bytes]`, previewUrl };
    }

    if (ext === 'docx') {
      try {
        const parsed = await parseDocx(arrayBuffer);
        return { text: parsed.text || '', previewUrl: null };
      } catch {
        return { text: '', previewUrl: null };
      }
    }

    if (ext === 'pdf') {
      try {
        const parsed = await parsePdfText(arrayBuffer);
        return { text: parsed.text || '', previewUrl: null };
      } catch {
        return { text: '', previewUrl: null };
      }
    }

    // Default text/code/json/csv/html
    try {
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const text = decoder.decode(arrayBuffer);
      return { text, previewUrl: null };
    } catch {
      return { text: '', previewUrl: null };
    }
  };

  const handleSelectFileA = async (file: File) => {
    setFileA(file);
    setIsComparing(true);
    const { text, previewUrl } = await extractContent(file);
    setTextA(text);
    setPreviewA(previewUrl);
    setIsComparing(false);
    if (fileB && textB) {
      calculateDiff(text, textB);
    }
  };

  const handleSelectFileB = async (file: File) => {
    setFileB(file);
    setIsComparing(true);
    const { text, previewUrl } = await extractContent(file);
    setTextB(text);
    setPreviewB(previewUrl);
    setIsComparing(false);
    if (fileA && textA) {
      calculateDiff(textA, text);
    }
  };

  const calculateDiff = (a: string, b: string) => {
    const wordsA = a.trim() ? a.trim().split(/\s+/).length : 0;
    const wordsB = b.trim() ? b.trim().split(/\s+/).length : 0;
    const charsA = a.length;
    const charsB = b.length;
    const linesA = a ? a.split('\n').length : 0;
    const linesB = b ? b.split('\n').length : 0;

    setDiffStats({ wordsA, wordsB, charsA, charsB, linesA, linesB });

    if (!a && !b) {
      setSimilarityScore(100);
      return;
    }

    // Calculate word-level Jaccard similarity
    const setA = new Set(a.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean));
    const setB = new Set(b.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean));

    let intersection = 0;
    for (const w of setA) {
      if (setB.has(w)) intersection++;
    }
    const union = new Set([...setA, ...setB]).size;
    const score = union === 0 ? 100 : Math.round((intersection / union) * 100);
    setSimilarityScore(score);
  };

  const handleSwap = () => {
    const tempF = fileA;
    const tempT = textA;
    const tempP = previewA;

    setFileA(fileB);
    setTextA(textB);
    setPreviewA(previewB);

    setFileB(tempF);
    setTextB(tempT);
    setPreviewB(tempP);

    if (textA && textB) {
      calculateDiff(textB, textA);
    }
  };

  const handleReset = () => {
    setFileA(null);
    setFileB(null);
    setTextA('');
    setTextB('');
    setPreviewA(null);
    setPreviewB(null);
    setSimilarityScore(null);
    setDiffStats(null);
  };

  const linesA = textA.split('\n');
  const linesB = textB.split('\n');
  const maxLines = Math.max(linesA.length, linesB.length, 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Columns2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Universal File Compare & Diff
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Compare any two files, documents, images, tables, or code side-by-side with line-by-line inspection.
          </p>
        </div>

        {(fileA || fileB) && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSwap}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
              title="Swap File A and File B"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>Swap Sides</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Similarity Score Banner (When both files uploaded) */}
      {similarityScore !== null && diffStats && (
        <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-blue-50/90 to-purple-50/90 p-4 dark:border-indigo-900/60 dark:from-slate-900/90 dark:via-indigo-950/40 dark:to-slate-900/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black text-base shadow-sm ${
                  similarityScore >= 90
                    ? 'bg-emerald-600 text-white'
                    : similarityScore >= 70
                    ? 'bg-blue-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {similarityScore}%
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Match Similarity Score</span>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    {similarityScore === 100 ? 'Identical Content' : similarityScore >= 80 ? 'High Match' : 'Modified'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-3 mt-0.5">
                  <span>Words: {diffStats.wordsA} vs {diffStats.wordsB}</span>
                  <span>•</span>
                  <span>Characters: {diffStats.charsA} vs {diffStats.charsB}</span>
                  <span>•</span>
                  <span>Lines: {diffStats.linesA} vs {diffStats.linesB}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File A Box */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 dark:border-slate-800/90 dark:bg-slate-900/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs">
                A
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Original / Reference File
              </span>
            </div>
            {fileA && (
              <button
                onClick={() => fileInputRefA.current?.click()}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Change
              </button>
            )}
          </div>

          <input
            ref={fileInputRefA}
            type="file"
            onChange={(e) => e.target.files?.[0] && handleSelectFileA(e.target.files[0])}
            className="hidden"
          />

          {!fileA ? (
            <div
              onClick={() => fileInputRefA.current?.click()}
              className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-blue-400 hover:bg-blue-50/20 dark:border-slate-700 dark:hover:border-blue-500 transition"
            >
              <UploadCloud className="h-8 w-8 text-blue-500 mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-white">Choose File A</div>
              <div className="text-[11px] text-slate-400 mt-1">Word, PDF, Text, Code, Image</div>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white truncate">
                <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="truncate">{fileA.name}</span>
                <span className="text-[11px] font-normal text-slate-400 shrink-0">
                  ({(fileA.size / 1024).toFixed(1)} KB)
                </span>
              </div>

              {previewA ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 max-h-60 bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-2">
                  <img src={previewA} alt="Preview A" className="max-h-56 object-contain rounded" />
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/80 p-3 font-mono text-[11px] leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  {linesA.map((line, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="w-8 select-none text-right text-slate-400 shrink-0">{idx + 1}</span>
                      <span className="break-all whitespace-pre-wrap">{line || '\u00A0'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* File B Box */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 dark:border-slate-800/90 dark:bg-slate-900/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-xs">
                B
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Modified / Target File
              </span>
            </div>
            {fileB && (
              <button
                onClick={() => fileInputRefB.current?.click()}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Change
              </button>
            )}
          </div>

          <input
            ref={fileInputRefB}
            type="file"
            onChange={(e) => e.target.files?.[0] && handleSelectFileB(e.target.files[0])}
            className="hidden"
          />

          {!fileB ? (
            <div
              onClick={() => fileInputRefB.current?.click()}
              className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/20 dark:border-slate-700 dark:hover:border-indigo-500 transition"
            >
              <UploadCloud className="h-8 w-8 text-indigo-500 mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-white">Choose File B</div>
              <div className="text-[11px] text-slate-400 mt-1">Word, PDF, Text, Code, Image</div>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white truncate">
                <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                <span className="truncate">{fileB.name}</span>
                <span className="text-[11px] font-normal text-slate-400 shrink-0">
                  ({(fileB.size / 1024).toFixed(1)} KB)
                </span>
              </div>

              {previewB ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 max-h-60 bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-2">
                  <img src={previewB} alt="Preview B" className="max-h-56 object-contain rounded" />
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/80 p-3 font-mono text-[11px] leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  {linesB.map((line, idx) => {
                    const isDifferent = idx < linesA.length && linesA[idx] !== line;
                    return (
                      <div
                        key={idx}
                        className={`flex gap-2 ${
                          isDifferent ? 'bg-amber-100/70 dark:bg-amber-950/40 rounded px-1' : ''
                        }`}
                      >
                        <span className="w-8 select-none text-right text-slate-400 shrink-0">{idx + 1}</span>
                        <span className="break-all whitespace-pre-wrap">{line || '\u00A0'}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
