import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { InternalDocumentModel } from '../types';

export interface SpreadsheetConversionResult {
  blob: Blob;
  name: string;
  size: number;
  preview: {
    type: 'html' | 'table' | 'text';
    content: string;
    sheets?: Array<{ name: string; data: (string | number)[][] }>;
  };
  tablesCount: number;
  extractedText: string;
}

/**
 * High-fidelity spreadsheet conversion engine using SheetJS & jsPDF
 */
export async function convertSpreadsheet(
  file: File,
  targetFormat: 'xlsx' | 'csv' | 'ods' | 'html' | 'pdf' | 'json' | 'txt',
  options?: { preserveFormulas?: boolean; onProgress?: (prog: number, msg: string) => void }
): Promise<SpreadsheetConversionResult> {
  const onProgress = options?.onProgress;
  onProgress?.(25, 'Reading workbook cells and formatting...');

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, {
    type: 'array',
    cellDates: true,
    cellStyles: true,
    cellFormula: options?.preserveFormulas ?? true,
  });

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const firstSheetName = workbook.SheetNames[0] || 'Sheet1';
  const firstSheet = workbook.Sheets[firstSheetName];

  // Extract all sheet data for preview
  const previewSheets = workbook.SheetNames.map((name) => {
    const s = workbook.Sheets[name];
    const data: (string | number)[][] = XLSX.utils.sheet_to_json(s, { header: 1 });
    return { name, data: data.slice(0, 50) };
  });

  let allText = '';
  workbook.SheetNames.forEach((sName) => {
    const s = workbook.Sheets[sName];
    const csv = XLSX.utils.sheet_to_csv(s);
    allText += `--- ${sName} ---\n` + csv + '\n\n';
  });

  // 1. Convert to CSV
  if (targetFormat === 'csv') {
    onProgress?.(70, 'Exporting Comma-Separated Values...');
    const csvData = XLSX.utils.sheet_to_csv(firstSheet);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    return {
      blob,
      name: `${baseName}.csv`,
      size: blob.size,
      preview: { type: 'table', content: csvData, sheets: previewSheets },
      tablesCount: workbook.SheetNames.length,
      extractedText: allText,
    };
  }

  // 2. Convert to XLSX
  if (targetFormat === 'xlsx') {
    onProgress?.(75, 'Encoding OpenXML Spreadsheet (XLSX)...');
    const outBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([outBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return {
      blob,
      name: `${baseName}.xlsx`,
      size: blob.size,
      preview: { type: 'table', content: 'OpenXML Spreadsheet', sheets: previewSheets },
      tablesCount: workbook.SheetNames.length,
      extractedText: allText,
    };
  }

  // 3. Convert to ODS
  if (targetFormat === 'ods') {
    onProgress?.(75, 'Encoding OpenDocument Spreadsheet (ODS)...');
    const outBuffer = XLSX.write(workbook, { bookType: 'ods', type: 'array' });
    const blob = new Blob([outBuffer], {
      type: 'application/vnd.oasis.opendocument.spreadsheet',
    });
    return {
      blob,
      name: `${baseName}.ods`,
      size: blob.size,
      preview: { type: 'table', content: 'OpenDocument Spreadsheet', sheets: previewSheets },
      tablesCount: workbook.SheetNames.length,
      extractedText: allText,
    };
  }

  // 4. Convert to HTML
  if (targetFormat === 'html') {
    onProgress?.(80, 'Generating semantic styled HTML tables...');
    let tablesHtml = '';
    workbook.SheetNames.forEach((sName) => {
      const s = workbook.Sheets[sName];
      const sheetHtml = XLSX.utils.sheet_to_html(s);
      tablesHtml += `<h2 class="sheet-title">${sName}</h2><div class="table-container">${sheetHtml}</div><hr/>`;
    });

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${file.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1e293b; background: #f8fafc; }
    .sheet-title { color: #0f172a; margin-top: 30px; font-size: 1.25rem; }
    .table-container { overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; }
    table { border-collapse: collapse; width: 100%; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
    tr:nth-child(even) { background-color: #f8fafc; }
    tr:hover { background-color: #f1f5f9; }
    th { background: #e2e8f0; font-weight: 600; color: #334155; }
  </style>
</head>
<body>
  <h1>${baseName}</h1>
  ${tablesHtml}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    return {
      blob,
      name: `${baseName}.html`,
      size: blob.size,
      preview: { type: 'html', content: fullHtml, sheets: previewSheets },
      tablesCount: workbook.SheetNames.length,
      extractedText: allText,
    };
  }

  // 5. Convert to JSON
  if (targetFormat === 'json') {
    onProgress?.(80, 'Serializing structured JSON data...');
    const resultObj: Record<string, any[]> = {};
    workbook.SheetNames.forEach((sName) => {
      const s = workbook.Sheets[sName];
      resultObj[sName] = XLSX.utils.sheet_to_json(s);
    });

    const jsonStr = JSON.stringify(resultObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    return {
      blob,
      name: `${baseName}.json`,
      size: blob.size,
      preview: { type: 'text', content: jsonStr, sheets: previewSheets },
      tablesCount: workbook.SheetNames.length,
      extractedText: allText,
    };
  }

  // 6. Convert to TXT
  if (targetFormat === 'txt') {
    onProgress?.(85, 'Formatting plain text sheet export...');
    const blob = new Blob([allText], { type: 'text/plain;charset=utf-8' });
    return {
      blob,
      name: `${baseName}.txt`,
      size: blob.size,
      preview: { type: 'text', content: allText, sheets: previewSheets },
      tablesCount: workbook.SheetNames.length,
      extractedText: allText,
    };
  }

  // 7. Convert to PDF
  onProgress?.(70, 'Rendering tabular grid layout to PDF...');
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(baseName, margin, margin + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Workbook converted with SheetJS High-Fidelity Grid • ${new Date().toLocaleDateString()}`, margin, margin + 26);

  let currentY = margin + 50;

  workbook.SheetNames.forEach((sheetName, sIdx) => {
    if (sIdx > 0) {
      doc.addPage();
      currentY = margin + 30;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(`Sheet: ${sheetName}`, margin, currentY);
    currentY += 18;

    const s = workbook.Sheets[sheetName];
    const data: (string | number)[][] = XLSX.utils.sheet_to_json(s, { header: 1 });
    if (data.length === 0) return;

    const maxCols = Math.min(8, data.reduce((acc, row) => Math.max(acc, row.length), 0));
    if (maxCols === 0) return;

    const colWidth = (pageWidth - margin * 2) / maxCols;
    const rowHeight = 18;

    data.slice(0, 100).forEach((row, rIdx) => {
      if (currentY + rowHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin + 30;
      }

      const isHeader = rIdx === 0;
      doc.setFillColor(isHeader ? 241 : rIdx % 2 === 0 ? 255 : 248, isHeader ? 245 : rIdx % 2 === 0 ? 255 : 250, isHeader ? 249 : 252);
      doc.rect(margin, currentY, pageWidth - margin * 2, rowHeight, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, currentY, pageWidth - margin * 2, rowHeight, 'S');

      doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
      doc.setFontSize(8);
      doc.setTextColor(isHeader ? 15 : 51, isHeader ? 23 : 65, isHeader ? 42 : 85);

      for (let c = 0; c < maxCols; c++) {
        const val = String(row[c] ?? '');
        const truncated = val.length > 22 ? val.substring(0, 20) + '..' : val;
        doc.text(truncated, margin + c * colWidth + 4, currentY + 12);
      }

      currentY += rowHeight;
    });
  });

  const pdfBlob = doc.output('blob');
  onProgress?.(100, 'Spreadsheet PDF generation complete');

  return {
    blob: pdfBlob,
    name: `${baseName}.pdf`,
    size: pdfBlob.size,
    preview: { type: 'table', content: allText, sheets: previewSheets },
    tablesCount: workbook.SheetNames.length,
    extractedText: allText,
  };
}
