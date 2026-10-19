import { parse as parseToml, stringify as stringifyToml } from 'smol-toml';

export function tomlToJson(input: string, pretty = true): string {
  const data = parseToml(input);
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

export function jsonToToml(input: string): string {
  const data = JSON.parse(input);
  return stringifyToml(data);
}
