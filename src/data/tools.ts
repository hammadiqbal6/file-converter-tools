export type ToolCategory = 'data' | 'documents' | 'images' | 'cad';

export type FaqItem = { question: string; answer: string };

export type ToolDefinition = {
  slug: string;
  name: string;
  shortName: string;
  category: ToolCategory;
  primaryKeyword: string;
  secondaryKeywords: string[];
  title: string;
  description: string;
  h1: string;
  answerFirst: string;
  inputFormats: string[];
  outputFormats: string[];
  limits: string[];
  related: string[];
  relatedGuides: string[];
  library?: string;
  lazy: boolean;
  component: string;
  datePublished: string;
  dateModified: string;
  howToSteps: string[];
  method: string;
  workedExample: string;
  mistakes: string[];
  faqs: FaqItem[];
  sources: { label: string; href: string }[];
  comparisonTable?: { headers: string[]; rows: string[][] };
  takeaways: string[];
  embeddable?: boolean;
};

export const categories: Record<
  ToolCategory,
  { slug: string; name: string; description: string; primaryKeyword: string }
> = {
  data: {
    slug: 'data',
    name: 'Data format converters',
    description:
      'Convert YAML, JSON, CSV, XML, and TOML entirely in your browser for configs, APIs, and data pipelines.',
    primaryKeyword: 'data format converter',
  },
  documents: {
    slug: 'documents',
    name: 'Document converters',
    description:
      'Markdown to HTML and PDF bank-statement text extraction to CSV — private and client-side.',
    primaryKeyword: 'document converter online',
  },
  images: {
    slug: 'images',
    name: 'Image converters',
    description:
      'PSD to PNG, HEIC to JPG, SVG to PNG, and WebP/PNG/JPG interconversion without uploading files.',
    primaryKeyword: 'image converter browser',
  },
  cad: {
    slug: 'cad-3d',
    name: 'CAD & 3D converters',
    description:
      'STL viewer, STL to OBJ, ASCII/binary STL, and a basic educational STL to G-code path with documented limits.',
    primaryKeyword: 'stl converter online',
  },
};

export const tools: ToolDefinition[] = [
  {
    slug: 'yaml-to-json',
    name: 'YAML to JSON Converter',
    shortName: 'YAML → JSON',
    category: 'data',
    primaryKeyword: 'yaml to json',
    secondaryKeywords: ['convert yaml to json online', 'yaml json converter', 'yml to json'],
    title: 'YAML to JSON Converter – Private, In-Browser',
    description:
      'Convert YAML to JSON instantly in your browser. Files never leave your device. Free, no signup, works offline after load.',
    h1: 'YAML to JSON Converter',
    answerFirst:
      'YAML to JSON conversion turns indentation-based YAML into JavaScript Object Notation. Paste or drop a .yaml/.yml file and this tool parses it with a JSON-compatible schema, then emits pretty-printed or compact JSON — entirely on your device.',
    inputFormats: ['.yaml', '.yml', 'text/yaml'],
    outputFormats: ['.json'],
    limits: ['JSON Schema only (no custom YAML tags)', 'Very large files may slow the tab', 'Duplicate keys follow js-yaml last-wins behavior'],
    related: ['json-to-yaml', 'toml-to-json', 'xml-to-json'],
    relatedGuides: ['yaml-vs-json', 'privacy-first-conversion'],
    library: 'js-yaml',
    lazy: true,
    component: 'YamlJsonTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    howToSteps: [
      'Paste YAML or choose a .yaml / .yml file.',
      'Click Convert to JSON (the library loads on first use).',
      'Copy or download the .json output.',
      'Optional: toggle compact JSON for minified output.',
    ],
    method:
      'The converter uses js-yaml with JSON_SCHEMA so results stay JSON-serializable (no dates-as-objects surprises). Parsing builds a native value tree; JSON.stringify then emits UTF-8 text. Invalid indentation or tabs mixed with spaces surface as parse errors with a message you can fix.',
    workedExample:
      'Input YAML `service:\\n  port: 8080\\n  secure: true` becomes `{"service":{"port":8080,"secure":true}}`. Note that unquoted `true`/`false`/`null` and numbers become JSON literals, matching common CI and Kubernetes config expectations.',
    mistakes: [
      'Using tabs for indentation (YAML requires spaces).',
      'Expecting custom tags (!!python/object) to round-trip into JSON.',
      'Forgetting that duplicate keys are not an error in YAML but collapse in JSON objects.',
    ],
    faqs: [
      {
        question: 'Does this YAML to JSON tool upload my file?',
        answer:
          'No. Conversion runs in your browser with js-yaml. Your file never leaves your device.',
      },
      {
        question: 'Can I convert YML to JSON?',
        answer:
          'Yes. .yml and .yaml are the same language; both work here.',
      },
      {
        question: 'Why did my date become a string?',
        answer:
          'We use JSON_SCHEMA, so timestamps stay strings or numbers you control — avoiding non-JSON Date objects.',
      },
      {
        question: 'Is there a size limit?',
        answer:
          'Browsers differ; multi-megabyte files usually work, but multi-tens-of-MB may freeze the tab. Split large docs when possible.',
      },
    ],
    sources: [
      { label: 'YAML 1.2 specification', href: 'https://yaml.org/spec/1.2.2/' },
      { label: 'MDN JSON.stringify', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify' },
    ],
    comparisonTable: {
      headers: ['Feature', 'YAML', 'JSON'],
      rows: [
        ['Comments', 'Yes (#)', 'No'],
        ['Trailing commas', 'N/A (indentation)', 'Not allowed'],
        ['Types', 'Rich scalars', 'string/number/bool/null/array/object'],
        ['Best for', 'Human-edited configs', 'APIs and strict interchange'],
      ],
    },
    takeaways: [
      'Primary intent: yaml to json conversion without uploads.',
      'Uses JSON-compatible YAML parsing for predictable output.',
      'Pair with JSON to YAML when you need the reverse direction.',
    ],
    embeddable: true,
  },
  {
    slug: 'json-to-yaml',
    name: 'JSON to YAML Converter',
    shortName: 'JSON → YAML',
    category: 'data',
    primaryKeyword: 'json to yaml',
    secondaryKeywords: ['convert json to yaml', 'json yaml converter online'],
    title: 'JSON to YAML Converter – In-Browser, Private',
    description:
      'Convert JSON to readable YAML in your browser. No uploads. Ideal for Kubernetes manifests, CI configs, and docs.',
    h1: 'JSON to YAML Converter',
    answerFirst:
      'JSON to YAML conversion rewrites strict JSON into indentation-based YAML for human editing. Paste JSON or drop a .json file; this tool parses it and emits 2-space YAML with no anchors by default — privately on your device.',
    inputFormats: ['.json', 'application/json'],
    outputFormats: ['.yaml', '.yml'],
    limits: ['Input must be valid JSON', 'Non-JSON JS values are not supported', 'Object key order follows JSON.parse'],
    related: ['yaml-to-json', 'json-to-csv', 'toml-to-json'],
    relatedGuides: ['yaml-vs-json', 'privacy-first-conversion'],
    library: 'js-yaml',
    lazy: true,
    component: 'YamlJsonTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    howToSteps: [
      'Paste JSON or select a .json file.',
      'Click Convert to YAML.',
      'Copy or download the .yaml result.',
    ],
    method:
      'JSON.parse validates the input, then js-yaml dump writes block-style YAML with indent 2, noRefs true (no anchors/aliases), and line wrapping near 100 characters for readability.',
    workedExample:
      '`{"replicas":3,"image":"app:1.2"}` becomes:\\n```\\nreplicas: 3\\nimage: app:1.2\\n```',
    mistakes: [
      'Trailing commas in JSON (invalid).',
      'Single-quoted JSON (JSON requires double quotes).',
      'Assuming YAML comments will appear — JSON has none to preserve.',
    ],
    faqs: [
      {
        question: 'Will my JSON key order be preserved?',
        answer:
          'Modern engines preserve insertion order from JSON.parse; we do not sort keys.',
      },
      {
        question: 'Can I get .yml instead of .yaml?',
        answer: 'Yes — download uses .yaml by default; rename freely; the content is identical.',
      },
    ],
    sources: [
      { label: 'YAML 1.2 specification', href: 'https://yaml.org/spec/1.2.2/' },
      { label: 'ECMA-404 JSON', href: 'https://www.ecma-international.org/publications-and-standards/standards/ecma-404/' },
    ],
    takeaways: [
      'Use this when configs need comments and softer editing than JSON.',
      'Round-trip via YAML to JSON to validate interchange.',
    ],
    embeddable: true,
  },
  {
    slug: 'json-to-csv',
    name: 'JSON to CSV Converter',
    shortName: 'JSON → CSV',
    category: 'data',
    primaryKeyword: 'json to csv',
    secondaryKeywords: ['convert json to csv online', 'json array to csv'],
    title: 'JSON to CSV Converter – Array of Objects, Private',
    description:
      'Convert a JSON array of objects to CSV in your browser. No upload. Great for exports, sheets, and pipelines.',
    h1: 'JSON to CSV Converter',
    answerFirst:
      'JSON to CSV flattens an array of objects into delimiter-separated rows with a header line from object keys. Paste JSON or drop a file; Papa Parse builds the CSV locally so spreadsheet tools can open it.',
    inputFormats: ['.json'],
    outputFormats: ['.csv'],
    limits: ['Root value must be an array', 'Nested objects become "[object Object]" unless pre-flattened', 'Mixed keys across rows union into columns'],
    related: ['csv-to-json', 'json-to-yaml', 'xml-to-json'],
    relatedGuides: ['csv-json-pipelines', 'privacy-first-conversion'],
    library: 'papaparse',
    lazy: true,
    component: 'CsvJsonTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    howToSteps: [
      'Provide a JSON array of objects.',
      'Choose delimiter (comma default).',
      'Convert and download .csv.',
    ],
    method:
      'Papa Parse unparse maps object keys to columns. Values are escaped when they contain commas, quotes, or newlines per RFC 4180-style rules.',
    workedExample:
      '`[{"name":"Ada","role":"Eng"},{"name":"Lin","role":"PM"}]` → CSV with header name,role and two data rows.',
    mistakes: [
      'Passing a single object instead of an array.',
      'Deep nesting without flattening.',
      'Assuming numbers stay typed in CSV (everything is text in sheets).',
    ],
    faqs: [
      {
        question: 'Does json to csv work for nested JSON?',
        answer:
          'Only shallow objects. Flatten nested fields first (e.g. address.city → address_city).',
      },
    ],
    sources: [
      { label: 'RFC 4180 CSV', href: 'https://datatracker.ietf.org/doc/html/rfc4180' },
    ],
    takeaways: [
      'Best for tabular API exports.',
      'Use CSV to JSON to reverse the flow.',
    ],
    embeddable: true,
  },
  {
    slug: 'csv-to-json',
    name: 'CSV to JSON Converter',
    shortName: 'CSV → JSON',
    category: 'data',
    primaryKeyword: 'csv to json',
    secondaryKeywords: ['convert csv to json', 'csv json parser browser'],
    title: 'CSV to JSON Converter – Private Browser Tool',
    description:
      'Parse CSV into a JSON array of objects in your browser. Auto-detects delimiters. Files stay on your device.',
    h1: 'CSV to JSON Converter',
    answerFirst:
      'CSV to JSON reads delimiter-separated rows and emits a JSON array of objects using the header row as keys. Drop a .csv file or paste text; parsing runs locally with Papa Parse.',
    inputFormats: ['.csv', 'text/csv'],
    outputFormats: ['.json'],
    limits: ['Malformed quotes can fail parsing', 'Dynamic typing is off (values stay strings)', 'Empty lines skipped'],
    related: ['json-to-csv', 'yaml-to-json', 'pdf-bank-statement-to-csv'],
    relatedGuides: ['csv-json-pipelines'],
    library: 'papaparse',
    lazy: true,
    component: 'CsvJsonTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    howToSteps: [
      'Paste CSV or choose a file.',
      'Optionally set delimiter (leave blank to auto-detect).',
      'Convert to pretty-printed JSON.',
    ],
    method:
      'Papa Parse tokenizes rows with RFC-style quote handling. With header mode on, each data row becomes an object. Errors report row numbers when available.',
    workedExample:
      '`name,score\\nAda,10` → `[{"name":"Ada","score":"10"}]` (strings preserved).',
    mistakes: [
      'Missing header row when you expect objects.',
      'Mixed delimiters in one file.',
      'UTF-16 exports from legacy Excel without converting to UTF-8.',
    ],
    faqs: [
      {
        question: 'Why are numbers quoted as strings?',
        answer:
          'We keep string typing to avoid silently corrupting IDs like 00123. Cast in your app if needed.',
      },
    ],
    sources: [{ label: 'RFC 4180 CSV', href: 'https://datatracker.ietf.org/doc/html/rfc4180' }],
    takeaways: ['Ideal for sheet → API payloads.', 'Pair with JSON to CSV for round-trips.'],
    embeddable: true,
  },
  {
    slug: 'xml-to-json',
    name: 'XML to JSON Converter',
    shortName: 'XML → JSON',
    category: 'data',
    primaryKeyword: 'xml to json',
    secondaryKeywords: ['convert xml to json online', 'xml json parser'],
    title: 'XML to JSON Converter – Client-Side, Private',
    description:
      'Convert XML documents to JSON in your browser. Attributes preserved with @_ prefixes. No uploads.',
    h1: 'XML to JSON Converter',
    answerFirst:
      'XML to JSON maps element trees into JSON objects and arrays. This tool uses fast-xml-parser, keeps attributes under @_ keys, and runs fully in-browser so sensitive payloads never upload.',
    inputFormats: ['.xml', 'application/xml', 'text/xml'],
    outputFormats: ['.json'],
    limits: ['DTDs and XXE are not processed', 'Mixed content uses #text nodes', 'Namespace prefixes kept as written'],
    related: ['yaml-to-json', 'toml-to-json', 'json-to-csv'],
    relatedGuides: ['privacy-first-conversion'],
    library: 'fast-xml-parser',
    lazy: true,
    component: 'XmlJsonTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    howToSteps: ['Paste XML or open a .xml file.', 'Convert to JSON.', 'Download or copy the result.'],
    method:
      'fast-xml-parser builds a plain object model. Attributes are prefixed with @_ to avoid colliding with child element names. Repeated sibling tags become arrays.',
    workedExample:
      '`<book id="1"><title>Go</title></book>` → `{"book":{"@_id":"1","title":"Go"}}`.',
    mistakes: [
      'Expecting exact DOM fidelity for comments and processing instructions.',
      'Feeding HTML (use an HTML parser instead).',
    ],
    faqs: [
      {
        question: 'Is XML to JSON safe for untrusted files?',
        answer:
          'Client-side parsing avoids server XXE, and this parser does not resolve external entities. Still treat unknown XML cautiously in your own apps.',
      },
    ],
    sources: [
      { label: 'W3C XML 1.0', href: 'https://www.w3.org/TR/xml/' },
    ],
    takeaways: ['Attribute prefix @_ is intentional and documented.', 'Good for API XML → JSON bridges.'],
  },
  {
    slug: 'toml-to-json',
    name: 'TOML to JSON Converter',
    shortName: 'TOML → JSON',
    category: 'data',
    primaryKeyword: 'toml to json',
    secondaryKeywords: ['convert toml to json', 'cargo toml to json'],
    title: 'TOML to JSON Converter – Private In-Browser',
    description:
      'Convert TOML (Cargo, pyproject, config) to JSON in your browser. No uploads.',
    h1: 'TOML to JSON Converter',
    answerFirst:
      'TOML to JSON parses Tom\'s Obvious Minimal Language into JSON objects. Paste or drop a .toml file; smol-toml parses locally and emits pretty JSON for tools that only speak JSON.',
    inputFormats: ['.toml'],
    outputFormats: ['.json'],
    limits: ['Follows TOML v1 types as JSON allows', 'Dates become JSON strings', 'Invalid tables error clearly'],
    related: ['yaml-to-json', 'json-to-yaml', 'xml-to-json'],
    relatedGuides: ['yaml-vs-json'],
    library: 'smol-toml',
    lazy: true,
    component: 'TomlJsonTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    howToSteps: ['Paste TOML or select a file.', 'Convert.', 'Copy JSON.'],
    method: 'smol-toml parse → JSON.stringify with 2-space indent.',
    workedExample: '`[package]\\nname = "demo"` → `{"package":{"name":"demo"}}`.',
    mistakes: ['Mixing JSON into TOML files.', 'Forgetting quoted keys when needed.'],
    faqs: [
      {
        question: 'Can I convert Cargo.toml to JSON?',
        answer: 'Yes — drop Cargo.toml and export JSON for scripts or documentation generators.',
      },
    ],
    sources: [{ label: 'TOML v1.0.0', href: 'https://toml.io/en/v1.0.0' }],
    takeaways: ['Useful for Rust/Python tooling bridges.', 'Keep originals as TOML for humans.'],
  },
  {
    slug: 'markdown-to-html',
    name: 'Markdown to HTML Converter',
    shortName: 'Markdown → HTML',
    category: 'documents',
    primaryKeyword: 'markdown to html',
    secondaryKeywords: ['md to html converter', 'convert markdown online'],
    title: 'Markdown to HTML Converter – GFM, Private',
    description:
      'Convert Markdown (GFM) to HTML in your browser. Preview and download a full HTML document. No uploads.',
    h1: 'Markdown to HTML Converter',
    answerFirst:
      'Markdown to HTML turns lightweight Markdown into HTML tags. This tool uses marked with GitHub Flavored Markdown, previews the result, and can wrap a full HTML document — all on your device.',
    inputFormats: ['.md', '.markdown', 'text/markdown'],
    outputFormats: ['.html'],
    limits: ['Raw HTML in Markdown is passed through (sanitize before publishing)', 'No server-side includes', 'Mermaid/math not rendered'],
    related: ['yaml-to-json', 'svg-to-png'],
    relatedGuides: ['privacy-first-conversion'],
    library: 'marked',
    lazy: true,
    component: 'MarkdownHtmlTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    howToSteps: ['Paste Markdown or open a .md file.', 'Convert / live preview.', 'Download HTML fragment or full document.'],
    method: 'marked.parse with GFM enabled produces HTML. An optional wrapper adds charset, viewport, and basic typography CSS.',
    workedExample: 'Input `# Hello` outputs a level-one heading element in HTML (rendered as a heading tag, not shown here to avoid duplicate headings on this page).',
    mistakes: ['Publishing unsanitized HTML from untrusted MD.', 'Expecting LaTeX to render.'],
    faqs: [
      {
        question: 'Is GitHub Flavored Markdown supported?',
        answer: 'Yes — tables, strikethrough, and task-list syntax follow GFM via marked.',
      },
    ],
    sources: [
      { label: 'CommonMark', href: 'https://commonmark.org/' },
      { label: 'GFM spec', href: 'https://github.github.com/gfm/' },
    ],
    takeaways: ['Great for docs snippets.', 'Sanitize if the Markdown is untrusted.'],
    embeddable: true,
  },
  {
    slug: 'psd-to-png',
    name: 'PSD to PNG Converter',
    shortName: 'PSD → PNG',
    category: 'images',
    primaryKeyword: 'psd to png',
    secondaryKeywords: ['convert psd to png online', 'photoshop to png browser'],
    title: 'PSD to PNG Converter – No Upload, In-Browser',
    description:
      'Convert Photoshop PSD files to PNG in your browser with ag-psd. Your design files never leave your device.',
    h1: 'PSD to PNG Converter',
    answerFirst:
      'PSD to PNG exports a Photoshop document to a lossless PNG. This page reads the PSD with ag-psd, composites the flattened canvas in-browser, and downloads PNG — without uploading your artwork.',
    inputFormats: ['.psd'],
    outputFormats: ['.png'],
    limits: [
      'Some advanced blend modes/smart objects may not match Photoshop exactly',
      'Very large PSDs need enough RAM',
      'Color profiles are flattened to the canvas bitmap',
    ],
    related: ['heic-to-jpg', 'image-format-converter', 'svg-to-png'],
    relatedGuides: ['psd-without-photoshop', 'privacy-first-conversion'],
    library: 'ag-psd',
    lazy: true,
    component: 'PsdToPngTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    howToSteps: ['Choose a .psd file.', 'Wait for local parse (library loads on demand).', 'Download PNG preview.'],
    method:
      'ag-psd reads the PSD ArrayBuffer and returns a composite canvas/image data when read options request compositing. We draw to a canvas and call toBlob(image/png).',
    workedExample:
      'A 1200×800 PSD of a marketing banner exports a 1200×800 PNG suitable for web previews without opening Photoshop.',
    mistakes: [
      'Expecting editable layers in the PNG (PNG is flat).',
      'Using truncated downloads of PSDs from cloud sync.',
    ],
    faqs: [
      {
        question: 'Why convert PSD to PNG in the browser?',
        answer:
          'Design files are sensitive. Client-side conversion keeps them local while producing a shareable preview.',
      },
    ],
    sources: [
      { label: 'Adobe Photoshop File Formats', href: 'https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/' },
    ],
    takeaways: ['Privacy-first alternative to upload converters.', 'PNG is flattened — keep PSD masters.'],
  },
  {
    slug: 'heic-to-jpg',
    name: 'HEIC to JPG Converter',
    shortName: 'HEIC → JPG',
    category: 'images',
    primaryKeyword: 'heic to jpg',
    secondaryKeywords: ['heic to jpeg', 'convert heic online browser'],
    title: 'HEIC to JPG Converter – Private, Client-Side',
    description:
      'Convert iPhone HEIC/HEIF photos to JPG in your browser. No uploads. Ideal for sharing and older apps.',
    h1: 'HEIC to JPG Converter',
    answerFirst:
      'HEIC to JPG converts High Efficiency Image Container photos (common on iPhones) into widely supported JPEG. This tool decodes HEIC locally via heic2any/WASM and exports JPG without uploading.',
    inputFormats: ['.heic', '.heif', 'image/heic', 'image/heif'],
    outputFormats: ['.jpg', '.jpeg'],
    limits: [
      'Animated/multi-image HEIC may export the primary frame only',
      'WASM decode needs a modern browser',
      'Quality slider trades size vs artifacts',
    ],
    related: ['image-format-converter', 'psd-to-png', 'svg-to-png'],
    relatedGuides: ['privacy-first-conversion'],
    library: 'heic2any',
    lazy: true,
    component: 'HeicToJpgTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    howToSteps: ['Select a .heic photo.', 'Adjust JPEG quality if needed.', 'Download .jpg.'],
    method: 'heic2any converts HEIC Blob → JPEG Blob using a WASM decoder loaded on first use.',
    workedExample: 'A 4032×3024 iPhone HEIC becomes a JPEG you can attach to email clients that reject HEIC.',
    mistakes: ['Confusing HEIC with HEVC video.', 'Setting quality too low for print.'],
    faqs: [
      {
        question: 'Does heic to jpg work on Android Chrome?',
        answer: 'Most modern Chromium and Safari builds work; if WASM fails, try an updated browser.',
      },
    ],
    sources: [
      { label: 'MPEG HEIF overview', href: 'https://mpeg.chiariglione.org/standards/mpeg-h/image-file-format' },
    ],
    takeaways: ['Solves iPhone → legacy app friction.', 'Files stay on-device.'],
  },
  {
    slug: 'image-format-converter',
    name: 'WebP PNG JPG Converter',
    shortName: 'WebP ↔ PNG ↔ JPG',
    category: 'images',
    primaryKeyword: 'webp to png',
    secondaryKeywords: ['png to jpg', 'jpg to webp', 'webp to jpg', 'png to webp'],
    title: 'WebP ↔ PNG ↔ JPG Converter – In-Browser',
    description:
      'Convert between WebP, PNG, and JPG in your browser with canvas export. No uploads. Pick target format and quality.',
    h1: 'WebP, PNG, and JPG Converter',
    answerFirst:
      'WebP/PNG/JPG conversion re-encodes raster images between formats. Drop an image, choose the target mime type, and this tool draws to canvas then exports — privately in your browser.',
    inputFormats: ['.webp', '.png', '.jpg', '.jpeg'],
    outputFormats: ['.webp', '.png', '.jpg'],
    limits: ['SVG/PSD/HEIC have dedicated tools', 'JPEG flattens transparency to white', 'Browser codec support required for WebP'],
    related: ['heic-to-jpg', 'svg-to-png', 'psd-to-png'],
    relatedGuides: ['privacy-first-conversion'],
    lazy: true,
    component: 'ImageFormatTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    howToSteps: ['Drop a WebP, PNG, or JPG.', 'Select output format and quality.', 'Download the result.'],
    method: 'createImageBitmap → canvas.drawImage → canvas.toBlob with the selected mime type.',
    workedExample: 'A transparent PNG converted to JPG fills transparency with white; converting to WebP can keep alpha when the browser supports it.',
    mistakes: ['Using JPG when you need alpha.', 'Re-compressing many times (generation loss).'],
    faqs: [
      {
        question: 'Should I use WebP to PNG or WebP to JPG?',
        answer:
          'Choose PNG for lossless/alpha needs; JPG for smaller opaque photos; WebP for modern web delivery.',
      },
    ],
    sources: [
      { label: 'MDN WebP guide', href: 'https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types' },
    ],
    comparisonTable: {
      headers: ['Format', 'Alpha', 'Typical use'],
      rows: [
        ['PNG', 'Yes', 'UI, screenshots, lossless'],
        ['JPG', 'No', 'Photos'],
        ['WebP', 'Yes*', 'Web delivery (*browser-dependent)'],
      ],
    },
    takeaways: ['One page covers the common raster triangle.', 'Avoid cannibalizing HEIC/PSD/SVG tools.'],
    embeddable: true,
  },
  {
    slug: 'svg-to-png',
    name: 'SVG to PNG Converter',
    shortName: 'SVG → PNG',
    category: 'images',
    primaryKeyword: 'svg to png',
    secondaryKeywords: ['convert svg to png', 'svg rasterize browser'],
    title: 'SVG to PNG Converter – Scale & Export Privately',
    description:
      'Rasterize SVG to PNG in your browser at a chosen scale. No uploads. Perfect for icons and simple illustrations.',
    h1: 'SVG to PNG Converter',
    answerFirst:
      'SVG to PNG rasterizes vector graphics into a PNG bitmap. Paste SVG markup or open a .svg file, set scale, and export — drawn via canvas in your browser without uploading.',
    inputFormats: ['.svg', 'image/svg+xml'],
    outputFormats: ['.png'],
    limits: [
      'External fonts/images referenced by URL may not load (browser security)',
      'Scripts inside SVG are not executed for export',
      'Huge scales can exhaust memory',
    ],
    related: ['image-format-converter', 'psd-to-png', 'markdown-to-html'],
    relatedGuides: ['privacy-first-conversion'],
    lazy: false,
    component: 'SvgToPngTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    howToSteps: ['Paste SVG or choose a file.', 'Set scale (1×, 2×, 3×).', 'Download PNG.'],
    method: 'Blob URL → Image → canvas draw at scaled size → PNG blob.',
    workedExample: 'A 24×24 icon SVG at 3× scale exports a 72×72 PNG for retina UI mocks.',
    mistakes: ['Relying on external CSS fonts.', 'Expecting CSS animations in the PNG.'],
    faqs: [
      {
        question: 'Why is my SVG to PNG blank?',
        answer:
          'Often missing width/height/viewBox, or external resources blocked. Inline critical styles and set viewBox.',
      },
    ],
    sources: [{ label: 'SVG 1.1', href: 'https://www.w3.org/TR/SVG11/' }],
    takeaways: ['Best for icons and flat art.', 'Keep SVG masters for editability.'],
  },
  {
    slug: 'stl-to-obj',
    name: 'STL to OBJ Converter & Viewer',
    shortName: 'STL → OBJ',
    category: 'cad',
    primaryKeyword: 'stl to obj',
    secondaryKeywords: ['stl viewer online', 'stl ascii to binary', 'binary stl to ascii'],
    title: 'STL to OBJ Converter & Viewer – Plus ASCII/Binary',
    description:
      'View STL files, convert STL to OBJ, and switch ASCII/binary STL — all in-browser. No uploads. Three.js viewer loads on demand.',
    h1: 'STL to OBJ Converter & Viewer',
    answerFirst:
      'STL to OBJ converts triangle meshes from stereolithography files into Wavefront OBJ. This tool also views meshes and converts ASCII ↔ binary STL locally; Three.js loads only when you open a file.',
    inputFormats: ['.stl'],
    outputFormats: ['.obj', '.stl'],
    limits: [
      'Normals are taken from the STL facets',
      'OBJ export expands vertices per facet (no welding)',
      'Very large meshes may be slow',
    ],
    related: ['stl-to-gcode'],
    relatedGuides: ['stl-formats-explained'],
    library: 'three',
    lazy: true,
    component: 'StlTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    howToSteps: ['Open an STL.', 'Preview in the viewer.', 'Download OBJ or ASCII/binary STL.'],
    method:
      'Custom STL parser detects ASCII vs binary, builds a triangle list, then emits OBJ (v/f) or re-encodes STL. Viewer uses Three.js BufferGeometry on demand.',
    workedExample: 'A binary benchy.stl exports an .obj that opens in Blender for UV or material work.',
    mistakes: ['Assuming units (STL has none — confirm mm vs inches).', 'Uploading proprietary CAD instead of STL.'],
    faqs: [
      {
        question: 'Can I convert binary STL to ASCII?',
        answer: 'Yes — choose ASCII STL export after the mesh parses.',
      },
      {
        question: 'Why not DWG?',
        answer:
          'No reliable, fully client-side DWG library meets our privacy bar yet; we document the skip in the roadmap.',
      },
    ],
    sources: [
      { label: 'Wikipedia STL (file format)', href: 'https://en.wikipedia.org/wiki/STL_(file_format)' },
    ],
    takeaways: ['Viewer + converters cover common mesh chores.', 'G-code has a separate educational tool.'],
  },
  {
    slug: 'stl-to-gcode',
    name: 'STL to G-code (Basic)',
    shortName: 'STL → G-code',
    category: 'cad',
    primaryKeyword: 'stl to gcode',
    secondaryKeywords: ['stl to g-code converter', 'browser slicer basic'],
    title: 'STL to G-code Converter – Basic Browser Slicer',
    description:
      'Generate basic educational G-code contours from STL in your browser. Documented limits — not a full production slicer.',
    h1: 'STL to G-code (Basic Slicer)',
    answerFirst:
      'STL to G-code conversion slices a mesh into printer machine moves. This educational tool emits simple contour G1 paths per Z layer in-browser. It is not a replacement for Cura/PrusaSlicer — limits are listed on the page.',
    inputFormats: ['.stl'],
    outputFormats: ['.gcode'],
    limits: [
      'No supports, infill patterns, or multi-extruder logic',
      'Single contour segments per triangle intersection',
      'Always simulate before printing',
      'Temperatures in the preamble are placeholders you must edit',
    ],
    related: ['stl-to-obj'],
    relatedGuides: ['stl-formats-explained'],
    lazy: true,
    component: 'StlGcodeTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    howToSteps: [
      'Open an STL (mm, Z-up preferred).',
      'Set layer height.',
      'Generate G-code and download.',
      'Simulate in your firmware tools before printing.',
    ],
    method:
      'For each Z layer, intersect triangle edges with the plane, then emit G0 travels and G1 extrusions with a constant E-per-mm heuristic. Preamble sets G21/G90 and placeholder temps.',
    workedExample:
      'A 20 mm cube at 0.2 mm layer height yields stacked square contours — enough to understand motion, not for dimensional accuracy.',
    mistakes: [
      'Printing without dry-run.',
      'Ignoring unit mismatches.',
      'Expecting production quality paths.',
    ],
    faqs: [
      {
        question: 'Is this a full slicer?',
        answer:
          'No. Full FDM slicing (supports, infill, machine profiles) is too large and safety-critical for a naïve in-browser port. We ship a basic contour exporter plus STL→OBJ tools instead of pretending otherwise.',
      },
    ],
    sources: [
      { label: 'RepRap G-code', href: 'https://reprap.org/wiki/G-code' },
    ],
    takeaways: ['Keyword coverage for stl to gcode with honest limits.', 'Use production slicers for real parts.'],
  },
  {
    slug: 'pdf-bank-statement-to-csv',
    name: 'PDF Bank Statement to CSV',
    shortName: 'PDF statement → CSV',
    category: 'documents',
    primaryKeyword: 'pdf bank statement to csv',
    secondaryKeywords: ['bank statement pdf to excel', 'extract transactions pdf csv'],
    title: 'PDF Bank Statement to CSV – Private Text Extract',
    description:
      'Extract text from PDF bank statements to CSV in your browser with pdf.js and column detection. Clear limits; no uploads.',
    h1: 'PDF Bank Statement to CSV',
    answerFirst:
      'PDF bank statement to CSV extracts text positions from a statement PDF and clusters them into columns for a spreadsheet-friendly CSV. Powered by pdf.js in your browser — your financial PDF never leaves your device. Scanned images need OCR first (not included).',
    inputFormats: ['.pdf', 'application/pdf'],
    outputFormats: ['.csv'],
    limits: [
      'Text-based PDFs only (no OCR for scans)',
      'Heuristic column detection can misalign unusual layouts',
      'No password-protected PDFs',
      'Always verify amounts before accounting use',
    ],
    related: ['csv-to-json', 'json-to-csv'],
    relatedGuides: ['bank-statements-as-data', 'privacy-first-conversion'],
    library: 'pdfjs-dist',
    lazy: true,
    component: 'PdfBankTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-19',
    howToSteps: [
      'Select a text-based statement PDF.',
      'Extract (pdf.js loads on demand).',
      'Download CSV and verify rows.',
    ],
    method:
      'pdf.js provides text items with X/Y. We cluster by Y into rows, cluster X into columns, then emit CSV. This beats naive line joins for tabular statements.',
    workedExample:
      'A digital PDF with Date / Description / Amount columns typically yields three CSV columns you can open in Sheets.',
    mistakes: [
      'Using scanned photo PDFs without OCR.',
      'Trusting OCR-less extraction on image-only pages.',
      'Importing to accounting without spot-checks.',
    ],
    faqs: [
      {
        question: 'Why is my CSV empty?',
        answer:
          'The PDF is likely image-only. Use OCR software first, then extract — or request a digital statement from your bank.',
      },
      {
        question: 'Is my bank data uploaded?',
        answer: 'No. pdf.js runs locally. Your file never leaves your device.',
      },
    ],
    sources: [
      { label: 'PDF Association', href: 'https://www.pdfa.org/' },
      { label: 'Mozilla pdf.js', href: 'https://mozilla.github.io/pdf.js/' },
    ],
    takeaways: [
      'Privacy matters for financial PDFs.',
      'Heuristic extraction requires human verification.',
    ],
  },
];

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((t) => t.slug === slug);
}

export function toolsByCategory(category: ToolCategory): ToolDefinition[] {
  return tools.filter((t) => t.category === category);
}

export function toolPath(slug: string): string {
  return `/tools/${slug}/`;
}
