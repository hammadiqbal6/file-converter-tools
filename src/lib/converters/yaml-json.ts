import { JSON_SCHEMA, load, dump } from 'js-yaml';

export function yamlToJson(input: string, pretty = true): string {
  const data = load(input, { schema: JSON_SCHEMA });
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

export function jsonToYaml(input: string): string {
  const data = JSON.parse(input);
  return dump(data, {
    indent: 2,
    lineWidth: 100,
    noRefs: true,
    sortKeys: false,
  });
}
