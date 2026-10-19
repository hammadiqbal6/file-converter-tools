import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { yamlToJson, jsonToYaml } from '../../src/lib/converters/yaml-json';

describe('yaml-json', () => {
  const yaml = readFileSync('tests/fixtures/sample.yaml', 'utf8');

  it('yamlToJson', () => {
    const out = yamlToJson(yaml);
    expect(JSON.parse(out)).toEqual({ service: { port: 8080, secure: true }, tags: ['api'] });
  });

  it('jsonToYaml roundtrip shape', () => {
    const json = yamlToJson(yaml);
    const back = jsonToYaml(json);
    expect(back).toContain('port: 8080');
  });
});
