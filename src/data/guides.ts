export type Guide = {
  slug: string;
  title: string;
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  datePublished: string;
  dateModified: string;
  relatedTools: string[];
  answerFirst: string;
  sections: { h2: string; html: string }[];
  faqs: { question: string; answer: string }[];
  sources: { label: string; href: string }[];
  takeaways: string[];
};

export const guides: Guide[] = [
  {
    slug: 'yaml-vs-json',
    title: 'YAML vs JSON: When to Convert (and When Not To)',
    description:
      'Compare YAML and JSON for configs and APIs: readability, types, comments, and when yaml to json or json to yaml conversion helps.',
    primaryKeyword: 'yaml vs json',
    secondaryKeywords: ['when to use yaml', 'json or yaml for kubernetes'],
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    relatedTools: ['yaml-to-json', 'json-to-yaml', 'toml-to-json'],
    answerFirst:
      'Use JSON when machines exchange strict data (APIs, many CLIs). Use YAML when humans edit configs and need comments. Convert yaml to json for tooling that only accepts JSON; convert back when you want editable manifests.',
    takeaways: [
      'JSON is the interchange default; YAML is the human-edit default.',
      'Comments are the #1 reason teams keep YAML sources of truth.',
      'Always validate round-trips before committing converted files.',
    ],
    sections: [
      {
        h2: 'Side-by-side differences',
        html: `<table><thead><tr><th>Concern</th><th>YAML</th><th>JSON</th></tr></thead><tbody>
<tr><td>Comments</td><td>Supported</td><td>Not supported</td></tr>
<tr><td>Trailing commas</td><td>N/A</td><td>Invalid</td></tr>
<tr><td>Learning curve</td><td>Indentation rules</td><td>Braces and quotes</td></tr>
<tr><td>Browser APIs</td><td>Needs a library</td><td>Built-in JSON.parse</td></tr>
</tbody></table>
<p>Authoritative references: the <a href="https://yaml.org/spec/1.2.2/">YAML 1.2 spec</a> and <a href="https://www.ecma-international.org/publications-and-standards/standards/ecma-404/">ECMA-404 JSON</a>.</p>`,
      },
      {
        h2: 'When conversion helps',
        html: `<p>Teams often author Kubernetes or CI config in YAML, then need JSON for a dashboard API. Use our <a href="/tools/yaml-to-json/">YAML to JSON converter</a> locally so secrets in values never upload. Reverse with <a href="/tools/json-to-yaml/">JSON to YAML</a> when importing API samples into a repo.</p>`,
      },
      {
        h2: 'Pitfalls',
        html: `<ul><li>Norway problem / unquoted country codes becoming booleans in older YAML 1.1 — prefer JSON-compatible schemas.</li>
<li>Duplicate keys silently collapsing.</li>
<li>Anchors/aliases that do not exist in JSON.</li></ul>`,
      },
    ],
    faqs: [
      {
        question: 'Is YAML a superset of JSON?',
        answer:
          'YAML 1.2 can parse most JSON, but treating YAML as “JSON with comments” still risks indentation and typing surprises. Prefer explicit conversion.',
      },
    ],
    sources: [
      { label: 'YAML 1.2.2', href: 'https://yaml.org/spec/1.2.2/' },
      { label: 'ECMA-404', href: 'https://www.ecma-international.org/publications-and-standards/standards/ecma-404/' },
    ],
  },
  {
    slug: 'psd-without-photoshop',
    title: 'How to Convert PSD to PNG Without Photoshop',
    description:
      'Export Photoshop PSD files to PNG for previews without installing Photoshop — including a private in-browser option.',
    primaryKeyword: 'convert psd to png without photoshop',
    secondaryKeywords: ['psd to png online private', 'open psd without photoshop'],
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    relatedTools: ['psd-to-png', 'image-format-converter', 'svg-to-png'],
    answerFirst:
      'To convert PSD to PNG without Photoshop, use a local or in-browser PSD reader that composites layers to a bitmap. Our PSD to PNG tool runs with ag-psd in your browser so design files are not uploaded.',
    takeaways: [
      'PNG exports are flattened — keep the PSD as the editable master.',
      'Privacy matters for unpublished brand assets.',
      'Complex smart objects may differ slightly from Photoshop.',
    ],
    sections: [
      {
        h2: 'Options compared',
        html: `<table><thead><tr><th>Option</th><th>Upload?</th><th>Best for</th></tr></thead><tbody>
<tr><td>In-browser (this site)</td><td>No</td><td>Quick previews, sensitive comps</td></tr>
<tr><td>GIMP / Photopea</td><td>Local or web app policies vary</td><td>Light edits</td></tr>
<tr><td>Photoshop</td><td>N/A</td><td>Full fidelity</td></tr>
</tbody></table>
<p>Try the <a href="/tools/psd-to-png/">PSD to PNG converter</a> for a no-upload export.</p>`,
      },
      {
        h2: 'What “good enough” PNG means',
        html: `<p>Marketing and review workflows usually need pixels, not layers. Export PNG, then use the <a href="/tools/image-format-converter/">WebP/PNG/JPG converter</a> if a CMS requires another raster format.</p>`,
      },
    ],
    faqs: [
      {
        question: 'Will layer styles match Photoshop exactly?',
        answer:
          'Most normal layers composite well; exotic blend modes and some smart objects can differ. Spot-check critical pixels.',
      },
    ],
    sources: [
      { label: 'Adobe Photoshop File Formats', href: 'https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/' },
    ],
  },
  {
    slug: 'privacy-first-conversion',
    title: 'Privacy-First File Conversion: Why In-Browser Matters',
    description:
      'Learn why client-side converters protect sensitive configs, photos, and bank PDFs — and how to verify a tool never uploads.',
    primaryKeyword: 'private file converter',
    secondaryKeywords: ['in browser file conversion', 'no upload converter'],
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    relatedTools: ['yaml-to-json', 'pdf-bank-statement-to-csv', 'heic-to-jpg'],
    answerFirst:
      'Privacy-first conversion means the file is read and rewritten in your browser (JavaScript/WASM) with no server upload. Check the Network tab during conversion: you should see no multipart upload of your document.',
    takeaways: [
      'Configs, HEIC camera rolls, and bank PDFs are high-sensitivity.',
      'Lazy-loaded libraries still run locally after download of the library code.',
      'Our tools state “your file never leaves your device” on every page.',
    ],
    sections: [
      {
        h2: 'How to verify',
        html: `<ol><li>Open DevTools → Network.</li><li>Start a conversion.</li><li>Confirm only static assets (JS/WASM) load — not your file as a request body.</li></ol>
<p>See also our <a href="/privacy/">Privacy Policy</a> and <a href="/methodology/">Methodology</a>.</p>`,
      },
      {
        h2: 'What still leaves the device',
        html: `<p>The converter <em>code</em> (and optional analytics/ads scripts if you enable them later) loads from the CDN/host. Your <em>document bytes</em> should not. Keep AdSense/GA disabled until you accept that tradeoff.</p>`,
      },
    ],
    faqs: [
      {
        question: 'Is WASM still private?',
        answer:
          'Yes. WASM executes in the browser sandbox. Privacy depends on whether your file bytes are sent elsewhere — ours are not.',
      },
    ],
    sources: [
      { label: 'MDN WebAssembly', href: 'https://developer.mozilla.org/en-US/docs/WebAssembly' },
    ],
  },
  {
    slug: 'csv-json-pipelines',
    title: 'CSV and JSON in Data Pipelines: Practical Conversion Tips',
    description:
      'How CSV to JSON and JSON to CSV fit ETL and spreadsheet workflows, with typing pitfalls and delimiter gotchas.',
    primaryKeyword: 'csv to json pipeline',
    secondaryKeywords: ['json to csv for excel', 'tabular json export'],
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    relatedTools: ['csv-to-json', 'json-to-csv', 'pdf-bank-statement-to-csv'],
    answerFirst:
      'CSV is the spreadsheet lingua franca; JSON is the API lingua franca. Convert CSV to JSON to feed scripts, and JSON to CSV to hand tabular exports to humans — keeping IDs as strings when leading zeros matter.',
    takeaways: [
      'Prefer string typing for IDs.',
      'Flatten nested JSON before CSV.',
      'Validate with RFC 4180-style quoting.',
    ],
    sections: [
      {
        h2: 'Recommended flow',
        html: `<p>Export from a sheet → <a href="/tools/csv-to-json/">CSV to JSON</a> → API. Or API dump → <a href="/tools/json-to-csv/">JSON to CSV</a> → Sheets. For bank PDFs, extract with <a href="/tools/pdf-bank-statement-to-csv/">PDF statement to CSV</a> then continue.</p>`,
      },
      {
        h2: 'Delimiter and encoding',
        html: `<p>European exports often use <code>;</code>. Our CSV tool can set a delimiter explicitly. Save UTF-8 to avoid mojibake.</p>`,
      },
    ],
    faqs: [
      {
        question: 'Can nested JSON become CSV?',
        answer: 'Only after flattening. Otherwise cells show unhelpful object strings.',
      },
    ],
    sources: [{ label: 'RFC 4180', href: 'https://datatracker.ietf.org/doc/html/rfc4180' }],
  },
  {
    slug: 'stl-formats-explained',
    title: 'STL Formats Explained: ASCII, Binary, OBJ, and G-code',
    description:
      'Understand STL ASCII vs binary, when to convert to OBJ, and why browser “slicers” have limits compared to Cura.',
    primaryKeyword: 'stl ascii vs binary',
    secondaryKeywords: ['stl to obj', 'stl to gcode limits'],
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    relatedTools: ['stl-to-obj', 'stl-to-gcode'],
    answerFirst:
      'STL stores triangle soups in ASCII text or a compact binary layout. OBJ adds a simpler text mesh for many DCC tools. G-code is machine motion — not a mesh — so “STL to G-code” is slicing, which production tools do with profiles, supports, and safety checks.',
    takeaways: [
      'Binary STL is smaller; ASCII is greppable.',
      'Use STL→OBJ for Blender/DCC handoff.',
      'Treat browser G-code as educational unless you simulate.',
    ],
    sections: [
      {
        h2: 'ASCII vs binary STL',
        html: `<p>ASCII begins with <code>solid</code> and lists facets; binary starts with an 80-byte header and a little-endian triangle count. Some binary files still say “solid” in the header — detect carefully. Convert with our <a href="/tools/stl-to-obj/">STL converter & viewer</a>.</p>`,
      },
      {
        h2: 'G-code expectations',
        html: `<p>Our <a href="/tools/stl-to-gcode/">basic STL to G-code</a> tool documents limits (no supports/infill). For printable parts use a full slicer, then keep mesh utilities here for privacy-friendly prep.</p>`,
      },
    ],
    faqs: [
      {
        question: 'Does STL include units?',
        answer: 'No. Confirm mm vs inches with your CAD export settings.',
      },
    ],
    sources: [
      { label: 'STL file format', href: 'https://en.wikipedia.org/wiki/STL_(file_format)' },
      { label: 'RepRap G-code', href: 'https://reprap.org/wiki/G-code' },
    ],
  },
  {
    slug: 'bank-statements-as-data',
    title: 'Reading Bank Statements as Data (PDF to CSV Limits)',
    description:
      'How text extraction turns PDF bank statements into CSV, what goes wrong with scans, and how to verify transactions.',
    primaryKeyword: 'pdf bank statement to csv',
    secondaryKeywords: ['extract bank transactions pdf', 'statement to spreadsheet'],
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    relatedTools: ['pdf-bank-statement-to-csv', 'csv-to-json'],
    answerFirst:
      'Digital PDF statements expose text glyphs with coordinates; clustering those positions yields CSV columns. Scanned statements are images and need OCR first. Always spot-check amounts before accounting imports.',
    takeaways: [
      'Prefer bank CSV/OFX downloads when available.',
      'No-upload extraction protects financial PDFs.',
      'Heuristics misread unusual layouts — verify.',
    ],
    sections: [
      {
        h2: 'Safe workflow',
        html: `<ol><li>Download a text-based PDF from your bank.</li>
<li>Run <a href="/tools/pdf-bank-statement-to-csv/">PDF bank statement to CSV</a> locally.</li>
<li>Diff totals against the PDF summary.</li>
<li>Optional: <a href="/tools/csv-to-json/">CSV to JSON</a> for scripts.</li></ol>`,
      },
      {
        h2: 'When extraction fails',
        html: `<p>Empty output usually means image-only pages. Ask the bank for a data export or run OCR offline, then extract.</p>`,
      },
    ],
    faqs: [
      {
        question: 'Can I use this for taxes?',
        answer:
          'Only as a convenience after human verification. It is not certified accounting software.',
      },
    ],
    sources: [
      { label: 'pdf.js', href: 'https://mozilla.github.io/pdf.js/' },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}
