import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  trimValues: true,
  parseTagValue: true,
  parseAttributeValue: true,
});

export function xmlToJson(input: string, pretty = true): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error('XML input is empty.');
  const data = parser.parse(trimmed);
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

export function jsonToXml(input: string): string {
  const data = JSON.parse(input);
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    indentBy: '  ',
  });
  return builder.build(data);
}
