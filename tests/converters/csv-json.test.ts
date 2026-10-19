import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { csvToJson, jsonToCsv } from '../../src/lib/converters/csv-json';

describe('csv-json', () => {
  const csv = readFileSync('tests/fixtures/sample.csv', 'utf8');
  const json = readFileSync('tests/fixtures/sample.json', 'utf8');

  it('csvToJson', () => {
    const out = JSON.parse(csvToJson(csv));
    expect(out).toHaveLength(2);
    expect(out[0].name).toBe('Ada');
  });

  it('jsonToCsv', () => {
    const out = jsonToCsv(json);
    expect(out).toContain('name,role');
    expect(out).toContain('Ada');
  });
});
