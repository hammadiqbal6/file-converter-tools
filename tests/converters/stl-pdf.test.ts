import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseStlText, stlToObj, stlToBasicGcode } from '../../src/lib/converters/stl';
import { extractStatementCsv, linesToMockPage } from '../../src/lib/converters/pdf-bank';

describe('stl', () => {
  const stl = readFileSync('tests/fixtures/cube.stl', 'utf8');

  it('parses ascii STL', () => {
    const mesh = parseStlText(stl);
    expect(mesh.triangles.length).toBe(1);
  });

  it('exports OBJ', () => {
    const mesh = parseStlText(stl);
    const obj = stlToObj(mesh);
    expect(obj).toContain('f 1 2 3');
  });

  it('basic gcode contains G21', () => {
    const mesh = parseStlText(stl);
    const g = stlToBasicGcode(mesh, { layerHeight: 0.2 });
    expect(g).toContain('G21');
  });
});

describe('pdf-bank', () => {
  it('clusters statement lines', () => {
    const page = linesToMockPage(['Date  Desc  Amount', '01/01  Pay   10.00']);
    const csv = extractStatementCsv([page]);
    expect(csv).toContain('Date');
    expect(csv).toContain('10.00');
  });
});
