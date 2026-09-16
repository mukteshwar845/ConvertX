import React, { useState, useEffect, useMemo } from 'react';
import {
  QrCode,
  Wifi,
  User,
  Type,
  Link as LinkIcon,
  Download,
  Printer,
  Sparkles,
  ShieldCheck,
  Layers,
  Palette,
  Eye,
  Check,
  FileDown,
} from 'lucide-react';
import {
  generateQRDataUrl,
  generateQRSvg,
  generatePrintableQRPdf,
  svgStringToBlob,
  dataUrlToBlob,
  formatWiFiString,
  formatVCardString,
  QRErrorCorrection,
  WiFiConfig,
  VCardConfig,
} from '../utils/qrStudioEngine';
import { downloadBlob } from '../utils/downloadHelper';
import { HistoryRecord } from '../types';

export type QRMode = 'url' | 'wifi' | 'contact' | 'text';

interface QRCodeStudioViewProps {
  onAddToHistory?: (record: HistoryRecord) => void;
  addToast?: (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => void;
}

export const QRCodeStudioView: React.FC<QRCodeStudioViewProps> = ({
  onAddToHistory,
  addToast,
}) => {
  const [activeMode, setActiveMode] = useState<QRMode>('url');

  // Input states
  const [urlInput, setUrlInput] = useState<string>('https://convertx.app');
  const [textInput, setTextInput] = useState<string>('Hello from ConvertX!');
  const [wifiConfig, setWifiConfig] = useState<WiFiConfig>({
    ssid: 'ConvertX_Guest',
    password: '',
    encryption: 'WPA',
    hidden: false,
  });
  const [vcardConfig, setVcardConfig] = useState<VCardConfig>({
    firstName: 'Alex',
    lastName: 'Morgan',
    organization: 'ConvertX Technologies',
    title: 'Product Engineer',
    phone: '+1 (555) 019-2834',
    email: 'alex@convertx.app',
    url: 'https://convertx.app',
  });

  // Customization styling
  const [fgColor, setFgColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [ecc, setEcc] = useState<QRErrorCorrection>('M');
  const [qrSize, setQrSize] = useState<number>(1024);

  // Output previews
  const [dataUrl, setDataUrl] = useState<string>('');
  const [svgString, setSvgString] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Compute active payload text
  const currentPayload = useMemo(() => {
    switch (activeMode) {
      case 'url':
        return urlInput.trim() || 'https://convertx.app';
      case 'wifi':
        return formatWiFiString(wifiConfig);
      case 'contact':
        return formatVCardString(vcardConfig);
      case 'text':
      default:
        return textInput.trim() || 'ConvertX';
    }
  }, [activeMode, urlInput, wifiConfig, vcardConfig, textInput]);

  // Generate QR on parameter changes
  useEffect(() => {
    let isCurrent = true;
    const generate = async () => {
      if (!currentPayload) return;
      setIsGenerating(true);
      try {
        const [pngUrl, svg] = await Promise.all([
          generateQRDataUrl({
            text: currentPayload,
            errorCorrectionLevel: ecc,
            fgColor,
            bgColor,
            margin: 2,
            width: qrSize,
          }),
          generateQRSvg({
            text: currentPayload,
            errorCorrectionLevel: ecc,
            fgColor,
            bgColor,
            margin: 2,
            width: qrSize,
          }),
        ]);

        if (isCurrent) {
          setDataUrl(pngUrl);
          setSvgString(svg);
        }
      } catch (err) {
        console.warn('QR Code generation error:', err);
      } finally {
        if (isCurrent) setIsGenerating(false);
      }
    };

    generate();
    return () => {
      isCurrent = false;
    };
  }, [currentPayload, ecc, fgColor, bgColor, qrSize]);

  const recordToHistory = (name: string, blob: Blob, format: 'png' | 'svg' | 'pdf') => {
    if (!onAddToHistory) return;
    const rec: HistoryRecord = {
      id: `hist_qr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      originalName: `QR_${activeMode.toUpperCase()}`,
      originalSize: blob.size,
      convertedName: name,
      convertedSize: blob.size,
      sourceFormat: 'png',
      targetFormat: format as any,
      timestamp: Date.now(),
    };
    onAddToHistory(rec);
  };

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const blob = dataUrlToBlob(dataUrl);
    const fileName = `qrcode_${activeMode}_${Date.now()}.png`;
    downloadBlob(blob, fileName);
    recordToHistory(fileName, blob, 'png');
    addToast?.('success', 'Downloaded high-resolution PNG QR Code!');
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = svgStringToBlob(svgString);
    const fileName = `qrcode_${activeMode}_${Date.now()}.svg`;
    downloadBlob(blob, fileName);
    recordToHistory(fileName, blob, 'svg');
    addToast?.('success', 'Downloaded scalable vector SVG QR Code!');
  };

  const handleDownloadPrintablePdf = async () => {
    if (!dataUrl) return;
    try {
      const title =
        activeMode === 'wifi'
          ? `Connect to ${wifiConfig.ssid}`
          : activeMode === 'contact'
          ? `${vcardConfig.firstName} ${vcardConfig.lastName}`
          : activeMode === 'url'
          ? urlInput
          : 'ConvertX QR Code';

      const subtitle =
        activeMode === 'wifi'
          ? 'Scan to join our high-speed WiFi network instantly'
          : activeMode === 'contact'
          ? `${vcardConfig.title ? vcardConfig.title + ' · ' : ''}${vcardConfig.organization || ''}`
          : 'Scan with your smartphone camera';

      const pdfBlob = await generatePrintableQRPdf(dataUrl, title, subtitle);
      const fileName = `qr_card_${activeMode}_${Date.now()}.pdf`;
      downloadBlob(pdfBlob, fileName);
      recordToHistory(fileName, pdfBlob, 'pdf');
      addToast?.('success', 'Downloaded printable A4 QR poster card!');
    } catch (err: any) {
      addToast?.('error', 'Failed to generate PDF card: ' + err.message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-blue-500/10 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <QrCode className="h-3.5 w-3.5" />
              <span>Vector QR Studio</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Universal QR Code Studio
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Design, customize, and export professional QR codes for websites, WiFi networks, contact cards, and text in PNG, SVG vector, or printable PDF sheets.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-2 rounded-2xl border border-emerald-500/20 w-fit">
            <ShieldCheck className="h-4 w-4" />
            <span>Zero Analytics or Tracking</span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-indigo-200/40 dark:border-indigo-900/40 pt-4">
          {[
            { id: 'url' as QRMode, label: 'Website / URL', icon: <LinkIcon className="h-4 w-4" /> },
            { id: 'wifi' as QRMode, label: 'WiFi Network', icon: <Wifi className="h-4 w-4" /> },
            { id: 'contact' as QRMode, label: 'Contact Card (vCard)', icon: <User className="h-4 w-4" /> },
            { id: 'text' as QRMode, label: 'Plain Text', icon: <Type className="h-4 w-4" /> },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeMode === mode.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Input Form & Style Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Content & Parameters
            </h2>

            {/* URL Mode */}
            {activeMode === 'url' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Website URL:
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            )}

            {/* WiFi Mode */}
            {activeMode === 'wifi' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Network Name (SSID):
                  </label>
                  <input
                    type="text"
                    value={wifiConfig.ssid}
                    onChange={(e) => setWifiConfig({ ...wifiConfig, ssid: e.target.value })}
                    placeholder="e.g. Office_WiFi"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Network Password:
                  </label>
                  <input
                    type="text"
                    value={wifiConfig.password || ''}
                    onChange={(e) => setWifiConfig({ ...wifiConfig, password: e.target.value })}
                    placeholder="Password (leave empty if open)"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Security Type:
                    </label>
                    <select
                      value={wifiConfig.encryption}
                      onChange={(e) => setWifiConfig({ ...wifiConfig, encryption: e.target.value as any })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open Network)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="hidden-wifi"
                      checked={wifiConfig.hidden || false}
                      onChange={(e) => setWifiConfig({ ...wifiConfig, hidden: e.target.checked })}
                      className="rounded accent-indigo-600"
                    />
                    <label htmlFor="hidden-wifi" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Hidden Network
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Contact vCard Mode */}
            {activeMode === 'contact' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">First Name:</label>
                    <input
                      type="text"
                      value={vcardConfig.firstName}
                      onChange={(e) => setVcardConfig({ ...vcardConfig, firstName: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Last Name:</label>
                    <input
                      type="text"
                      value={vcardConfig.lastName}
                      onChange={(e) => setVcardConfig({ ...vcardConfig, lastName: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number:</label>
                    <input
                      type="tel"
                      value={vcardConfig.phone || ''}
                      onChange={(e) => setVcardConfig({ ...vcardConfig, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address:</label>
                    <input
                      type="email"
                      value={vcardConfig.email || ''}
                      onChange={(e) => setVcardConfig({ ...vcardConfig, email: e.target.value })}
                      placeholder="alex@example.com"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Company / Organization:</label>
                    <input
                      type="text"
                      value={vcardConfig.organization || ''}
                      onChange={(e) => setVcardConfig({ ...vcardConfig, organization: e.target.value })}
                      placeholder="Acme Corp"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Job Title:</label>
                    <input
                      type="text"
                      value={vcardConfig.title || ''}
                      onChange={(e) => setVcardConfig({ ...vcardConfig, title: e.target.value })}
                      placeholder="Product Specialist"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Plain Text Mode */}
            {activeMode === 'text' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Plain Text / Notes:
                </label>
                <textarea
                  rows={4}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter any text, instructions, or notes here..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Style Controls Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="h-4 w-4 text-indigo-500" />
              Design & Colors
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* QR Pattern Color */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Pattern Color:
                </label>
                <div className="flex items-center gap-2">
                  {['#0f172a', '#2563eb', '#7c3aed', '#059669', '#e11d48'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setFgColor(c)}
                      style={{ backgroundColor: c }}
                      className={`h-7 w-7 rounded-full border-2 transition ${
                        fgColor === c ? 'border-white ring-2 ring-indigo-500 scale-110' : 'border-transparent'
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    title="Custom color"
                  />
                </div>
              </div>

              {/* Error Correction */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Error Correction Level:
                </label>
                <div className="flex gap-1.5">
                  {[
                    { id: 'L' as const, label: 'L (7%)' },
                    { id: 'M' as const, label: 'M (15%)' },
                    { id: 'Q' as const, label: 'Q (25%)' },
                    { id: 'H' as const, label: 'H (30%)' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setEcc(lvl.id)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        ecc === lvl.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Live Preview & Export Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex flex-col items-center rounded-3xl border border-slate-200/90 bg-white p-6 dark:border-slate-800/90 dark:bg-slate-900 shadow-sm">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Live Preview
              </span>
              <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
                Vector High-Res
              </span>
            </div>

            {/* QR Canvas Box */}
            <div className="relative flex items-center justify-center rounded-2xl bg-white p-6 shadow-inner border border-slate-100 dark:border-slate-800 max-w-[280px] sm:max-w-[320px] aspect-square w-full">
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt="Generated QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-300">
                  <QrCode className="h-16 w-16" />
                </div>
              )}
            </div>

            {/* Export Buttons */}
            <div className="w-full space-y-2 mt-6">
              <button
                onClick={handleDownloadPng}
                disabled={!dataUrl}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 transition active:scale-98"
              >
                <Download className="h-4 w-4" />
                <span>Download High-Res PNG (1024px)</span>
              </button>

              <button
                onClick={handleDownloadSvg}
                disabled={!svgString}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 transition active:scale-98"
              >
                <Layers className="h-4 w-4 text-indigo-500" />
                <span>Download Infinite Vector SVG</span>
              </button>

              <button
                onClick={handleDownloadPrintablePdf}
                disabled={!dataUrl}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 transition active:scale-98"
              >
                <Printer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Download Printable A4 PDF Card</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
