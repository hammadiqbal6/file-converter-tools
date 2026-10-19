/**
 * PDF bank-statement → CSV helpers.
 * Uses pdf.js text items + heuristic column clustering. Limits are intentional and documented.
 */

export const PDF_BANK_LIMITS = [
  'Works best on text-based (born-digital) PDFs. Scanned image statements need OCR first (not included).',
  'Column detection is heuristic: aligned X positions clustered into columns.',
  'Multi-column layouts, watermarks, and rotated pages can confuse parsing.',
  'Currency symbols and thousands separators vary by bank; review the CSV before importing.',
  'Password-protected PDFs are not supported in this client-side build.',
] as const;

export type PdfTextItem = {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PdfPageText = {
  page: number;
  items: PdfTextItem[];
};

export function clusterRows(items: PdfTextItem[], yTolerance = 3): PdfTextItem[][] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: PdfTextItem[][] = [];
  for (const item of sorted) {
    const row = rows.find((r) => Math.abs(r[0].y - item.y) <= yTolerance);
    if (row) row.push(item);
    else rows.push([item]);
  }
  for (const row of rows) row.sort((a, b) => a.x - b.x);
  return rows;
}

export function detectColumnXs(rows: PdfTextItem[][], threshold = 12): number[] {
  const xs: number[] = [];
  for (const row of rows) {
    for (const item of row) {
      const existing = xs.find((x) => Math.abs(x - item.x) <= threshold);
      if (existing == null) xs.push(item.x);
    }
  }
  return xs.sort((a, b) => a - b);
}

export function rowsToMatrix(rows: PdfTextItem[][], columns: number[], threshold = 12): string[][] {
  return rows.map((row) => {
    const cells = columns.map(() => '');
    for (const item of row) {
      let best = 0;
      let bestDist = Infinity;
      columns.forEach((cx, i) => {
        const d = Math.abs(cx - item.x);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      if (bestDist <= threshold * 2) {
        cells[best] = cells[best] ? `${cells[best]} ${item.str}` : item.str;
      }
    }
    return cells.map((c) => c.trim());
  });
}

export function matrixToCsv(matrix: string[][]): string {
  return matrix
    .filter((row) => row.some((c) => c.length > 0))
    .map((row) =>
      row
        .map((cell) => {
          if (/[",\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
          return cell;
        })
        .join(','),
    )
    .join('\n');
}

export function extractStatementCsv(pages: PdfPageText[]): string {
  const allItems = pages.flatMap((p) => p.items);
  if (!allItems.length) {
    throw new Error('No extractable text. This PDF may be scanned or empty.');
  }
  const rows = clusterRows(allItems);
  const columns = detectColumnXs(rows);
  if (columns.length < 2) {
    // Fallback: one cell per line
    return rows.map((r) => r.map((i) => i.str).join(' ')).join('\n');
  }
  const matrix = rowsToMatrix(rows, columns);
  return matrixToCsv(matrix);
}

/** Pure helper for tests: build items from plain lines with fake coordinates. */
export function linesToMockPage(lines: string[], page = 1): PdfPageText {
  const items: PdfTextItem[] = [];
  lines.forEach((line, row) => {
    const parts = line.split(/\s{2,}|\t/);
    parts.forEach((part, col) => {
      items.push({
        str: part.trim(),
        x: col * 100,
        y: 1000 - row * 14,
        width: part.length * 6,
        height: 12,
      });
    });
  });
  return { page, items };
}
