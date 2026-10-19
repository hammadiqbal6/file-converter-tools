import Papa from 'papaparse';

export type CsvToJsonOptions = {
  delimiter?: string;
  header?: boolean;
  skipEmptyLines?: boolean | 'greedy';
};

export function csvToJson(input: string, options: CsvToJsonOptions = {}): string {
  const result = Papa.parse(input, {
    header: options.header !== false,
    delimiter: options.delimiter || '',
    skipEmptyLines: options.skipEmptyLines ?? 'greedy',
    dynamicTyping: false,
  });
  if (result.errors.length) {
    const first = result.errors[0];
    throw new Error(`CSV parse error at row ${first.row ?? '?'}: ${first.message}`);
  }
  return JSON.stringify(result.data, null, 2);
}

export type JsonToCsvOptions = {
  delimiter?: string;
};

export function jsonToCsv(input: string, options: JsonToCsvOptions = {}): string {
  const data = JSON.parse(input);
  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array of objects (or arrays) to convert to CSV.');
  }
  if (data.length === 0) return '';
  return Papa.unparse(data, {
    delimiter: options.delimiter || ',',
  });
}
