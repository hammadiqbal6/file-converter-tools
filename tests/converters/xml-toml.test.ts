import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { xmlToJson } from '../../src/lib/converters/xml-json';
import { tomlToJson } from '../../src/lib/converters/toml-json';

describe('xml and toml', () => {
  it('xmlToJson', () => {
    const out = JSON.parse(xmlToJson('<book id="1"><title>Go</title></book>'));
    expect(out.book.title).toBe('Go');
    expect(String(out.book['@_id'])).toBe('1');
  });

  it('tomlToJson', () => {
    const toml = readFileSync('tests/fixtures/sample.toml', 'utf8');
    const out = JSON.parse(tomlToJson(toml));
    expect(out.package.name).toBe('demo');
  });
});
