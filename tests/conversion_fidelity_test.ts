import { createDocxFromContent } from '../src/utils/docxGenerator';
import { parseDocx } from '../src/utils/conversionEngine';
import { parseHtmlToDocumentSlides, renderSectionsToPptx } from '../src/utils/docxToPptxConverter';

async function runFidelityTests() {
  console.log('=== CONVERSION FIDELITY & COVER PAGE TEST ===\n');

  // 1. Create a DOCX with Cover Page & Content
  console.log('1. Creating test DOCX with Title Cover Page & Content...');
  const docxBlob = await createDocxFromContent('Annual Financial Report', [
    { type: 'heading1', text: 'Annual Financial & Sustainability Report 2025' },
    { type: 'paragraph', text: 'Prepared by Enterprise Operations Team • October 2025' },
    { type: 'heading2', text: 'Executive Summary' },
    { type: 'paragraph', text: 'ConvertX delivered 99.9% uptime with 100% client-side privacy.' },
    { type: 'bullet', text: 'Zero server uploads guaranteed' },
    { type: 'bullet', text: 'Multi-page layout fidelity preserved' },
    { type: 'heading2', text: 'Q3 Financial Performance' },
    { type: 'paragraph', text: 'Revenue increased across all operating segments.' },
  ]);

  const arrayBuffer = await docxBlob.arrayBuffer();
  console.log(`✓ Generated DOCX buffer: ${arrayBuffer.byteLength} bytes`);

  // 2. Parse DOCX with Mammoth
  console.log('\n2. Testing parseDocx structure extraction...');
  const parsed = await parseDocx(arrayBuffer);
  console.log(`✓ Parsed HTML length: ${parsed.html.length} chars`);
  console.log(`✓ Parsed text length: ${parsed.text.length} chars`);
  console.log(`Parsed HTML content:\n${parsed.html}`);
  if (!parsed.html.includes('Annual Financial') || !parsed.html.includes('Sustainability Report 2025')) {
    throw new Error('Title missing from parsed HTML');
  }
  console.log('✓ Heading 1 and title preserved in HTML');

  // 3. Test PPTX Cover Slide & Sections
  console.log('\n3. Testing DOCX -> PPTX Cover Detection & Slide Architecture...');
  const { cover, sections } = parseHtmlToDocumentSlides(parsed.html, 'Annual Financial Report');
  console.log(`✓ Detected Cover Title: "${cover.title}"`);
  console.log(`✓ Detected Cover Subtitle: "${cover.subtitle}"`);
  console.log(`✓ Number of body slide sections: ${sections.length}`);

  if (!cover.title.includes('Annual Financial')) {
    throw new Error(`Cover title not detected properly: ${cover.title}`);
  }

  // 4. Render PPTX
  console.log('\n4. Testing renderSectionsToPptx with Cover Slide...');
  const pptxBlob = await renderSectionsToPptx(
    'Annual Financial Report',
    sections,
    (pct, msg) => console.log(`   [PPTX] ${pct}% - ${msg}`),
    cover
  );
  console.log(`✓ Generated PPTX Blob: ${pptxBlob.size} bytes`);
  if (pptxBlob.size < 5000) {
    throw new Error('PPTX Blob is too small');
  }

  console.log('\n=============================================');
  console.log('  ALL CONVERSION FIDELITY TESTS PASSED! ✓');
  console.log('=============================================');
}

runFidelityTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
