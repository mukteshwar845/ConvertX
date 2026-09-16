/**
 * QR Code Studio Processing Engine
 * High-definition vector SVG, PNG, and printable PDF QR card generation
 * 100% Client-side in browser
 */
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

export type QRErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface QRCodeOptions {
  text: string;
  errorCorrectionLevel: QRErrorCorrection;
  fgColor: string; // e.g. '#0f172a'
  bgColor: string; // e.g. '#ffffff'
  margin: number; // 1 to 4
  width: number; // e.g. 512, 1024
}

export interface WiFiConfig {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface VCardConfig {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
}

/**
 * Format WiFi parameters into standard QR code string
 */
export function formatWiFiString(config: WiFiConfig): string {
  const enc = config.encryption || 'WPA';
  const pass = config.password || '';
  const hidden = config.hidden ? 'H:true;' : '';
  return `WIFI:T:${enc};S:${config.ssid};P:${pass};${hidden};`;
}

/**
 * Format Contact parameters into standard vCard 3.0 string
 */
export function formatVCardString(config: VCardConfig): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${config.lastName};${config.firstName};;;`,
    `FN:${[config.firstName, config.lastName].filter(Boolean).join(' ')}`,
  ];

  if (config.organization) lines.push(`ORG:${config.organization}`);
  if (config.title) lines.push(`TITLE:${config.title}`);
  if (config.phone) lines.push(`TEL;TYPE=CELL:${config.phone}`);
  if (config.email) lines.push(`EMAIL:${config.email}`);
  if (config.url) lines.push(`URL:${config.url}`);
  lines.push('END:VCARD');

  return lines.join('\n');
}

/**
 * Generate QR code as a PNG Data URL
 */
export async function generateQRDataUrl(options: QRCodeOptions): Promise<string> {
  if (!options.text || !options.text.trim()) {
    throw new Error('Please enter text or a URL to encode into the QR code.');
  }

  return await QRCode.toDataURL(options.text, {
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: options.margin,
    width: options.width,
    color: {
      dark: options.fgColor,
      light: options.bgColor,
    },
  });
}

/**
 * Generate QR code as an SVG string
 */
export async function generateQRSvg(options: QRCodeOptions): Promise<string> {
  if (!options.text || !options.text.trim()) {
    throw new Error('Please enter text or a URL to encode into the QR code.');
  }

  return await QRCode.toString(options.text, {
    type: 'svg',
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: options.margin,
    width: options.width,
    color: {
      dark: options.fgColor,
      light: options.bgColor,
    },
  });
}

/**
 * Convert SVG string to downloadable Blob
 */
export function svgStringToBlob(svgString: string): Blob {
  return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
}

/**
 * Convert base64 data URL to Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Generate a professional printable A4 PDF card with the QR code
 */
export async function generatePrintableQRPdf(
  qrDataUrl: string,
  title: string,
  subtitle?: string
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Background subtle card border
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(1);
  doc.roundedRect(25, 30, 160, 237, 8, 8);

  // Top header accent line
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(25, 30, 160, 6, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(title || 'Scan Me', pageWidth / 2, 60, { align: 'center' });

  // Subtitle
  if (subtitle && subtitle.trim()) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(subtitle, pageWidth / 2, 70, { align: 'center' });
  }

  // QR Code Image in Center
  const qrSize = 100; // 100mm x 100mm
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = 85;
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // Scan instruction
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('Point camera or scan with phone', pageWidth / 2, 202, { align: 'center' });

  // Footer branding
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Generated with ConvertX Universal Tools · 100% Private', pageWidth / 2, 252, {
    align: 'center',
  });

  const pdfOutput = doc.output('blob');
  return pdfOutput;
}
