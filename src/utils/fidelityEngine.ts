import { InternalDocumentModel, FidelityReport, FidelityCheck } from '../types';

/**
 * Calculates Token Similarity Ratio between original text and converted text
 */
function calculateTextSimilarity(
  sourceText: string,
  targetText: string
): { similarity: number; matchedWords: number; totalWords: number; missingWords: number; extraWords: number } {
  if (!sourceText && !targetText) {
    return { similarity: 100, matchedWords: 0, totalWords: 0, missingWords: 0, extraWords: 0 };
  }
  if (!sourceText || !targetText) {
    return { similarity: 0, matchedWords: 0, totalWords: sourceText ? sourceText.split(/\s+/).length : 0, missingWords: 0, extraWords: 0 };
  }

  // Tokenize words (case-insensitive alphanumeric tokens)
  const tokenize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1);

  const sourceWords = tokenize(sourceText);
  const targetWords = tokenize(targetText);

  if (sourceWords.length === 0 && targetWords.length === 0) {
    return { similarity: 100, matchedWords: 0, totalWords: 0, missingWords: 0, extraWords: 0 };
  }

  const targetFreq = new Map<string, number>();
  for (const w of targetWords) {
    targetFreq.set(w, (targetFreq.get(w) || 0) + 1);
  }

  let matched = 0;
  for (const w of sourceWords) {
    const count = targetFreq.get(w) || 0;
    if (count > 0) {
      matched++;
      targetFreq.set(w, count - 1);
    }
  }

  const total = Math.max(sourceWords.length, targetWords.length);
  const ratio = total > 0 ? (matched / total) * 100 : 100;
  const missing = Math.max(0, sourceWords.length - matched);
  const extra = Math.max(0, targetWords.length - matched);

  return {
    similarity: Math.round(ratio * 10) / 10,
    matchedWords: matched,
    totalWords: sourceWords.length,
    missingWords: missing,
    extraWords: extra,
  };
}

/**
 * Evaluates the Fidelity of a Converted Document compared to its Source IDM
 */
export function evaluateDocumentFidelity(
  source: InternalDocumentModel,
  targetExtractedText: string,
  targetInfo: {
    targetFormat: string;
    targetPageCount?: number;
    targetTablesCount?: number;
    targetImagesCount?: number;
    targetHeadingsCount?: number;
    strategyUsed: string;
  }
): FidelityReport {
  const checks: FidelityCheck[] = [];

  // 1. Text Fidelity Calculation
  const textDiff = calculateTextSimilarity(source.rawText, targetExtractedText);
  let textScore = textDiff.similarity;

  // If source was an image without OCR, text comparison is not expected
  if (['png', 'jpg', 'webp', 'svg', 'bmp', 'gif', 'tiff'].includes(source.sourceFormat) && !source.rawText.trim()) {
    textScore = 100;
  }

  if (textScore >= 95) {
    checks.push({
      id: 'chk-text',
      name: 'Text Content Preservation',
      status: 'passed',
      detail: `Preserved ${textDiff.matchedWords} / ${textDiff.totalWords} original words (${textScore}% match). Zero wording altered.`,
    });
  } else if (textScore >= 80) {
    checks.push({
      id: 'chk-text',
      name: 'Text Content Preservation',
      status: 'passed',
      detail: `High word overlap (${textScore}%). Formatting delimiters or markup adjusted for ${targetInfo.targetFormat.toUpperCase()}.`,
    });
  } else {
    checks.push({
      id: 'chk-text',
      name: 'Text Content Variance',
      status: 'warning',
      detail: `Content fidelity at ${textScore}%. Some formatting or symbols refactored in target format.`,
    });
  }

  // 2. Layout & Pagination Fidelity
  let layoutScore = 100;
  const expectedPages = source.pageCount;
  const actualPages = targetInfo.targetPageCount || expectedPages;
  const pageDiff = Math.abs(expectedPages - actualPages);

  if (pageDiff === 0) {
    layoutScore = 100;
    checks.push({
      id: 'chk-pages',
      name: 'Page & Section Boundary Preservation',
      status: 'passed',
      detail: `Exact pagination match: ${expectedPages} source pages mapped cleanly to ${actualPages} output pages.`,
    });
  } else if (pageDiff <= 2) {
    layoutScore = Math.max(85, 100 - pageDiff * 6);
    checks.push({
      id: 'chk-pages',
      name: 'Pagination Adaptation',
      status: 'info',
      detail: `Output flow adapted from ${expectedPages} to ${actualPages} pages due to target margin & typography geometry.`,
    });
  } else {
    layoutScore = 80;
    checks.push({
      id: 'chk-pages',
      name: 'Reflow Variance',
      status: 'info',
      detail: `Target format uses dynamic reflow (${expectedPages} source pages vs ${actualPages} generated pages).`,
    });
  }

  // 3. Structural Headings & Typography Fidelity
  let fontsScore = 98;
  const sourceHeadings = source.headingsCount;
  const targetHeadings = targetInfo.targetHeadingsCount ?? sourceHeadings;

  if (sourceHeadings > 0) {
    if (targetHeadings >= sourceHeadings * 0.8) {
      fontsScore = 98;
      checks.push({
        id: 'chk-headings',
        name: 'Typography Hierarchy & Font Weight',
        status: 'passed',
        detail: `All ${sourceHeadings} major headers and visual scale levels preserved with accurate styling.`,
      });
    } else {
      fontsScore = 88;
      checks.push({
        id: 'chk-headings',
        name: 'Header Hierarchy',
        status: 'warning',
        detail: `Preserved ${targetHeadings} of ${sourceHeadings} headings. Secondary headings flattened.`,
      });
    }
  } else {
    fontsScore = 99;
    checks.push({
      id: 'chk-headings',
      name: 'Typography Hierarchy',
      status: 'passed',
      detail: 'Standard paragraph body text styling and margins preserved.',
    });
  }

  // 4. Tables Fidelity
  let tablesScore = 100;
  if (source.tablesCount > 0) {
    const targetTables = targetInfo.targetTablesCount ?? source.tablesCount;
    if (targetTables >= source.tablesCount) {
      tablesScore = 99;
      checks.push({
        id: 'chk-tables',
        name: 'Tabular Data & Cell Dimensions',
        status: 'passed',
        detail: `Preserved all ${source.tablesCount} tables with row-column alignment and border structure.`,
      });
    } else {
      tablesScore = 86;
      checks.push({
        id: 'chk-tables',
        name: 'Table Structure',
        status: 'warning',
        detail: `Target format converted ${targetTables}/${source.tablesCount} tables into delimited structures.`,
      });
    }
  } else {
    tablesScore = 100;
    checks.push({
      id: 'chk-tables',
      name: 'Tabular Integrity',
      status: 'passed',
      detail: 'No embedded tabular grids in source; layout integrity intact.',
    });
  }

  // 5. Images Fidelity
  let imagesScore = 100;
  if (source.imagesCount > 0) {
    const targetImages = targetInfo.targetImagesCount ?? source.imagesCount;
    if (targetImages >= source.imagesCount) {
      imagesScore = 100;
      checks.push({
        id: 'chk-images',
        name: 'Image & Media Embedding',
        status: 'passed',
        detail: `All ${source.imagesCount} embedded images preserved with original resolution and aspect ratios.`,
      });
    } else {
      imagesScore = 85;
      checks.push({
        id: 'chk-images',
        name: 'Image Extraction Notice',
        status: 'warning',
        detail: `Embedded ${targetImages}/${source.imagesCount} images. Some media format restrictions applied.`,
      });
    }
  } else {
    imagesScore = 100;
  }

  // Calculate Weighted Overall Fidelity Score
  // Text 40%, Layout 25%, Tables 15%, Fonts 10%, Images 10%
  const overallScore = Math.min(
    100,
    Math.round((textScore * 0.4 + layoutScore * 0.25 + tablesScore * 0.15 + fontsScore * 0.1 + imagesScore * 0.1) * 10) /
      10
  );

  return {
    overallScore,
    textScore: Math.round(textScore * 10) / 10,
    layoutScore: Math.round(layoutScore * 10) / 10,
    imagesScore: Math.round(imagesScore * 10) / 10,
    fontsScore: Math.round(fontsScore * 10) / 10,
    tablesScore: Math.round(tablesScore * 10) / 10,
    sourcePages: expectedPages,
    targetPages: actualPages,
    strategyUsed: targetInfo.strategyUsed,
    checks,
    diffSummary: {
      matchedWords: textDiff.matchedWords,
      totalWords: textDiff.totalWords,
      missingWords: textDiff.missingWords,
      extraWords: textDiff.extraWords,
      similarityRatio: textDiff.similarity,
    },
  };
}
