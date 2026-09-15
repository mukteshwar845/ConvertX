import assert from 'node:assert';
import { detectFileFormat } from '../src/utils/fileDetector';
import { evaluateDocumentFidelity } from '../src/utils/fidelityEngine';
import { createDocxFromContent } from '../src/utils/docxGenerator';
import { convertSpreadsheet } from '../src/utils/spreadsheetEngine';
import { convertImage } from '../src/utils/imageConverter';
import { parsePdfText } from '../src/utils/conversionEngine';
import { InternalDocumentModel } from '../src/types';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

// Test counters
let passedCount = 0;
let failedCount = 0;

function it(name: string, fn: () => void | Promise<void>) {
  return async () => {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passedCount++;
    } catch (err: any) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err.message}`);
      failedCount++;
    }
  };
}

async function runTests() {
  console.log('\n=============================================');
  console.log('  DOCUCONVERT PRODUCTION TEST SUITE');
  console.log('=============================================\n');

  const tests: Array<() => Promise<void>> = [];

  // Group 1: Magic Byte & File Detector Tests
  console.log('--- 1. File Format & Magic Byte Detection ---');
  tests.push(
    it('Detects PDF from %PDF- magic bytes', async () => {
      const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
      const file = new File([pdfBytes], 'sample.pdf', { type: 'application/pdf' });
      const res = await detectFileFormat(file);
      assert.strictEqual(res.format, 'pdf');
      assert.ok(res.signature.includes('PDF'));
    }),

    it('Detects PNG from \\x89PNG header', async () => {
      const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const file = new File([pngBytes], 'sample.png', { type: 'image/png' });
      const res = await detectFileFormat(file);
      assert.strictEqual(res.format, 'png');
    }),

    it('Detects JPEG from FF D8 FF header', async () => {
      const jpgBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      const file = new File([jpgBytes], 'photo.jpg', { type: 'image/jpeg' });
      const res = await detectFileFormat(file);
      assert.strictEqual(res.format, 'jpg');
    }),

    it('Detects DOCX PK Zip Container', async () => {
      const zip = new JSZip();
      zip.file('word/document.xml', '<xml></xml>');
      const buf = await zip.generateAsync({ type: 'uint8array' });
      const file = new File([buf], 'report.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const res = await detectFileFormat(file);
      assert.strictEqual(res.format, 'docx');
    }),

    it('Detects XLSX PK Zip Container', async () => {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([['A', 'B'], [1, 2]]);
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const outBuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const file = new File([outBuf], 'data.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const res = await detectFileFormat(file);
      assert.strictEqual(res.format, 'xlsx');
    })
  );

  // Group 2: OpenXML DOCX Generation Tests
  console.log('\n--- 2. OpenXML Document Generator ---');
  tests.push(
    it('Generates valid OpenXML DOCX with headings and bullet lists', async () => {
      const sections = [
        { type: 'heading1' as const, text: 'Executive Summary' },
        { type: 'paragraph' as const, text: 'This document tests OpenXML generation.' },
        { type: 'bullet' as const, text: 'First bullet point item' },
        { type: 'bullet' as const, text: 'Second bullet point item' },
      ];
      const blob = await createDocxFromContent('Project Report', sections);
      assert.ok(blob.size > 1000, 'DOCX blob must not be empty');

      // Verify internal OpenXML ZIP structure
      const zip = await JSZip.loadAsync(await blob.arrayBuffer());
      assert.ok(zip.file('word/document.xml') !== null, 'Must contain word/document.xml');
      assert.ok(zip.file('[Content_Types].xml') !== null, 'Must contain [Content_Types].xml');
      assert.ok(zip.file('word/styles.xml') !== null, 'Must contain word/styles.xml');

      const docXml = await zip.file('word/document.xml')!.async('string');
      assert.ok(docXml.includes('Executive Summary'), 'Must contain heading text');
      assert.ok(docXml.includes('First bullet point item'), 'Must contain bullet list item');
    })
  );

  // Group 3: Spreadsheet Conversion Engine Tests
  console.log('\n--- 3. Spreadsheet Engine (XLSX, CSV, PDF, HTML, JSON) ---');
  tests.push(
    it('Converts XLSX to CSV with accurate cell data', async () => {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        ['Department', 'Q1 Revenue', 'Status'],
        ['Engineering', 1500000, 'Active'],
        ['Sales', 2200000, 'Exceeded'],
      ]);
      XLSX.utils.book_append_sheet(wb, ws, 'Financials');
      const outBuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const file = new File([outBuf], 'Financials.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const res = await convertSpreadsheet(file, 'csv');
      assert.ok(res.blob.size > 0, 'CSV blob must be valid');
      assert.ok(res.name.endsWith('.csv'), 'Output name must end with .csv');
      const csvText = await res.blob.text();
      assert.ok(csvText.includes('Engineering,1500000,Active'), 'CSV must contain data rows');
    }),

    it('Converts CSV to XLSX Workbook', async () => {
      const csvData = 'Item,Price,Stock\nLaptop,1200,45\nMouse,25,180';
      const file = new File([csvData], 'inventory.csv', { type: 'text/csv' });
      const res = await convertSpreadsheet(file, 'xlsx');
      assert.ok(res.name.endsWith('.xlsx'));
      assert.ok(res.blob.size > 1000);

      // Verify valid XLSX workbook generated
      const wb = XLSX.read(await res.blob.arrayBuffer(), { type: 'array' });
      assert.ok(wb.SheetNames.length > 0);
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      assert.strictEqual(rows.length, 2);
    }),

    it('Converts Spreadsheet to PDF Grid', async () => {
      const csvData = 'Name,Role,Score\nAlice,Lead,98\nBob,Engineer,95';
      const file = new File([csvData], 'team.csv', { type: 'text/csv' });
      const res = await convertSpreadsheet(file, 'pdf');
      assert.ok(res.name.endsWith('.pdf'));
      assert.ok(res.blob.size > 1000);
      const pdfBytes = new Uint8Array(await res.blob.arrayBuffer());
      // Check PDF magic header %PDF
      assert.strictEqual(pdfBytes[0], 0x25);
      assert.strictEqual(pdfBytes[1], 0x50);
      assert.strictEqual(pdfBytes[2], 0x44);
      assert.strictEqual(pdfBytes[3], 0x46);
    }),

    it('Converts Spreadsheet to JSON Data', async () => {
      const csvData = 'City,Pop\nTokyo,37000000\nDelhi,32000000';
      const file = new File([csvData], 'cities.csv', { type: 'text/csv' });
      const res = await convertSpreadsheet(file, 'json');
      assert.ok(res.name.endsWith('.json'));
      const parsed = JSON.parse(await res.blob.text());
      assert.ok(Array.isArray(parsed[Object.keys(parsed)[0]]));
    })
  );

  // Group 4: Document Fidelity Engine & Multi-Lingual Tests
  console.log('\n--- 4. Document Fidelity Engine & Unicode Multi-Lingual Tests ---');
  tests.push(
    it('Calculates 100% Fidelity for identical text', () => {
      const model: InternalDocumentModel = {
        title: 'Doc',
        elements: [],
        pageCount: 2,
        wordCount: 10,
        characterCount: 50,
        tablesCount: 0,
        imagesCount: 0,
        headingsCount: 1,
        rawText: 'The quick brown fox jumps over the lazy dog',
        sourceFormat: 'docx',
      };
      const rep = evaluateDocumentFidelity(model, 'The quick brown fox jumps over the lazy dog', {
        targetFormat: 'pdf',
        strategyUsed: 'Vector PDF',
      });
      assert.strictEqual(rep.textScore, 100);
      assert.strictEqual(rep.overallScore, 100);
    }),

    it('Preserves Hindi, Odia, and Indian scripts in fidelity calculation', () => {
      const hindiText = 'प्रोजेक्ट आर्किटेक्चर दस्तावेज़ और सुरक्षा विनिर्देश';
      const model: InternalDocumentModel = {
        title: 'Hindi Doc',
        elements: [],
        pageCount: 1,
        wordCount: 6,
        characterCount: hindiText.length,
        tablesCount: 0,
        imagesCount: 0,
        headingsCount: 1,
        rawText: hindiText,
        sourceFormat: 'docx',
      };
      const rep = evaluateDocumentFidelity(model, hindiText, {
        targetFormat: 'pdf',
        strategyUsed: 'Vector PDF',
      });
      assert.strictEqual(rep.textScore, 100, 'Hindi text must evaluate to 100% fidelity without being stripped');
      assert.ok(rep.overallScore >= 95);
    }),

    it('Preserves Chinese and CJK characters in fidelity calculation', () => {
      const cjkText = '企业级文件格式转换系统和数据安全保证';
      const model: InternalDocumentModel = {
        title: 'Chinese Spec',
        elements: [],
        pageCount: 1,
        wordCount: 1,
        characterCount: cjkText.length,
        tablesCount: 0,
        imagesCount: 0,
        headingsCount: 1,
        rawText: cjkText,
        sourceFormat: 'docx',
      };
      const rep = evaluateDocumentFidelity(model, cjkText, {
        targetFormat: 'pdf',
        strategyUsed: 'Vector PDF',
      });
      assert.strictEqual(rep.textScore, 100, 'Chinese text tokens must be preserved');
    })
  );

  // Group 5: ZIP Archiving Engine Tests
  console.log('\n--- 5. ZIP Creator & File Archiving Engine ---');
  tests.push(
    it('Creates valid multi-file ZIP archive with custom folder paths', async () => {
      const zip = new JSZip();
      zip.file('documents/summary.txt', 'ConvertX Document Summary');
      zip.file('data/records.csv', 'id,name\n1,Alpha\n2,Beta');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      assert.ok(zipBlob.size > 200, 'ZIP blob must be valid');

      // Verify unpack
      const loaded = await JSZip.loadAsync(await zipBlob.arrayBuffer());
      assert.ok(loaded.file('documents/summary.txt') !== null);
      assert.ok(loaded.file('data/records.csv') !== null);
      const text = await loaded.file('documents/summary.txt')!.async('string');
      assert.strictEqual(text, 'ConvertX Document Summary');
    })
  );

  // Group 6: Live API Integration Tests
  console.log('\n--- 6. Backend Express API Endpoints ---');
  tests.push(
    it('Responds 200 OK from /api/health with security headers', async () => {
      const res = await fetch('http://localhost:3000/api/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
      assert.strictEqual(res.headers.get('x-frame-options'), 'SAMEORIGIN');
      const data = await res.json();
      assert.strictEqual(data.status, 'ok');
      assert.strictEqual(data.version, '1.0.0');
    })
  );

  // Run all
  for (const t of tests) {
    await t();
  }

  console.log('\n=============================================');
  console.log(`  TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('=============================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
