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
    title: 'YAML to JSON Converter (Private)',
    description:
      'Convert YAML to JSON instantly in your browser. Files never leave your device. Free, no signup — conversion stays in your browser.',
    h1: 'YAML to JSON Converter',
    answerFirst:
      "YAML to JSON turns indented YAML into JSON objects. Example: `port: 8080` becomes {\"port\":8080}. Paste or drop a .yaml file — conversion runs in your browser with no upload.",
    inputFormats: ['.yaml', '.yml', 'text/yaml'],
    outputFormats: ['.json'],
    limits: ['JSON Schema only (no custom YAML tags)', 'Very large files may slow the tab', 'Duplicate keys follow js-yaml last-wins behavior'],
    related: ['json-to-yaml', 'toml-to-json', 'xml-to-json'],
    relatedGuides: ['yaml-vs-json', 'privacy-first-conversion'],
    library: 'js-yaml',
    lazy: true,
    component: 'YamlJsonTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-24',
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
    title: 'JSON to YAML Converter (Private)',
    description:
      'Convert JSON to readable YAML in your browser. No uploads. Ideal for Kubernetes manifests, CI configs, and docs.',
    h1: 'JSON to YAML Converter',
    answerFirst:
      "JSON to YAML rewrites strict JSON into 2-space YAML for editing. Example: {\"replicas\":3} becomes `replicas: 3`. Paste or drop .json — conversion stays on your device.",
    inputFormats: ['.json', 'application/json'],
    outputFormats: ['.yaml', '.yml'],
    limits: ['Input must be valid JSON', 'Non-JSON JS values are not supported', 'Object key order follows JSON.parse'],
    related: ['yaml-to-json', 'json-to-csv', 'toml-to-json'],
    relatedGuides: ['yaml-vs-json', 'toml-vs-yaml-vs-json'],
    library: 'js-yaml',
    lazy: true,
    component: 'YamlJsonTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-24',
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
      },,
      {
        question: "Does JSON to YAML upload my file?",
        answer:
          "No. js-yaml dump runs in your browser. Configs stay on-device.",
      },
      {
        question: "What indent is used?",
        answer:
          "2-space block style by default, with no anchors/aliases (noRefs).",
      }
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
    title: 'JSON to CSV Converter (Private)',
    description:
      'Convert a JSON array of objects to CSV in your browser. No upload. Great for exports, sheets, and pipelines.',
    h1: 'JSON to CSV Converter',
    answerFirst:
      "JSON to CSV flattens an array of objects into a header row plus data rows. Example: two {name,role} objects become 2 CSV rows. Paste JSON — Papa Parse runs locally, no upload.",
    inputFormats: ['.json'],
    outputFormats: ['.csv'],
    limits: ['Root value must be an array', 'Nested objects become "[object Object]" unless pre-flattened', 'Mixed keys across rows union into columns'],
    related: ['csv-to-json', 'json-to-yaml', 'xml-to-json'],
    relatedGuides: ['csv-json-pipelines'],
    library: 'papaparse',
    lazy: true,
    component: 'CsvJsonTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-24',
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
      },,
      {
        question: "Does this JSON to CSV tool upload my file?",
        answer:
          "No. Papa Parse runs in your browser. Your JSON never leaves your device for conversion.",
      },
      {
        question: "How are nested objects handled?",
        answer:
          "Only shallow objects are supported. Flatten nested fields (e.g. address.city → address_city) before converting.",
      },
      {
        question: "Can I open the CSV in Excel?",
        answer:
          "Yes. Download the .csv and open it. For some locales, switch the delimiter to semicolon in the tool controls if available.",
      }
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
    title: 'CSV to JSON Converter (Private)',
    description:
      'Parse CSV into a JSON array of objects in your browser. Auto-detects delimiters. Files stay on your device.',
    h1: 'CSV to JSON Converter',
    answerFirst:
      "CSV to JSON reads delimiter-separated rows into a JSON array of objects. Example: `name,score` / `Ada,10` becomes [{\"name\":\"Ada\",\"score\":\"10\"}]. Parsing stays in your browser.",
    inputFormats: ['.csv', 'text/csv'],
    outputFormats: ['.json'],
    limits: ['Malformed quotes can fail parsing', 'Dynamic typing is off (values stay strings)', 'Empty lines skipped'],
    related: ['json-to-csv', 'yaml-to-json', 'pdf-bank-statement-to-csv'],
    relatedGuides: ['csv-json-pipelines'],
    library: 'papaparse',
    lazy: true,
    component: 'CsvJsonTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-24',
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
      },,
      {
        question: "Does CSV to JSON upload my spreadsheet?",
        answer:
          "No. Parsing is local with Papa Parse. Your file never leaves your device.",
      },
      {
        question: "Are semicolons detected?",
        answer:
          "Leave the delimiter blank to auto-detect common separators (comma, semicolon, tab). Override when auto-detect is wrong.",
      },
      {
        question: "What about large CSV files?",
        answer:
          "Multi-megabyte files usually work; tens of MB may freeze the tab. Split large exports when possible.",
      }
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
    title: 'XML to JSON Converter (Private)',
    description:
      'Convert XML documents to JSON in your browser. Attributes preserved with @_ prefixes. No uploads.',
    h1: 'XML to JSON Converter',
    answerFirst:
      "XML to JSON maps elements and @_attributes into JSON. Example: <book id=\"1\"/> becomes {\"book\":{\"@_id\":\"1\"}}. Drop .xml — fast-xml-parser runs locally with no upload.",
    inputFormats: ['.xml', 'application/xml', 'text/xml'],
    outputFormats: ['.json'],
    limits: ['DTDs and XXE are not processed', 'Mixed content uses #text nodes', 'Namespace prefixes kept as written'],
    related: ['yaml-to-json', 'toml-to-json', 'json-to-csv'],
    relatedGuides: ['xml-json-attributes', 'yaml-vs-json'],
    library: 'fast-xml-parser',
    lazy: true,
    component: 'XmlJsonTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-24',
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
      },,
      {
        question: "Does XML to JSON upload my file?",
        answer:
          "No. fast-xml-parser runs in your browser. Payloads stay on-device.",
      },
      {
        question: "Why is a single child not an array?",
        answer:
          "Repeated sibling tags become arrays; a single occurrence stays an object. Normalize in your app if you need stable types.",
      },
      {
        question: "How are attributes represented?",
        answer:
          "Attributes use an @_ prefix (e.g. @_id) so they do not collide with child element names. See the XML attributes guide.",
      }
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
    title: 'TOML to JSON – Cargo & pyproject',
    description:
      'Convert TOML (Cargo, pyproject, config) to JSON in your browser. No uploads.',
    h1: 'TOML to JSON Converter',
    answerFirst:
      'TOML to JSON parses Cargo/pyproject-style tables into JSON. Example: [package] name="demo" becomes {"package":{"name":"demo"}}. Drop .toml — conversion never uploads.',
    inputFormats: ['.toml'],
    outputFormats: ['.json'],
    limits: ['Follows TOML v1 types as JSON allows', 'Dates become JSON strings', 'Invalid tables error clearly'],
    related: ['yaml-to-json', 'json-to-yaml', 'xml-to-json'],
    relatedGuides: ['toml-vs-yaml-vs-json', 'yaml-vs-json'],
    library: 'smol-toml',
    lazy: true,
    component: 'TomlJsonTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-24',
    howToSteps: ['Paste TOML or select a file.', 'Convert.', 'Copy JSON.'],
    method: 'smol-toml parse → JSON.stringify with 2-space indent.',
    workedExample: '`[package]\\nname = "demo"` → `{"package":{"name":"demo"}}`.',
    mistakes: ['Mixing JSON into TOML files.', 'Forgetting quoted keys when needed.'],
    faqs: [
      {
        question: 'Can I convert Cargo.toml to JSON?',
        answer: 'Yes — drop Cargo.toml and export JSON for scripts or documentation generators.',
      },,
      {
        question: "Does TOML to JSON upload my file?",
        answer:
          "No. smol-toml parses locally. Cargo.toml and pyproject.toml stay on your device.",
      },
      {
        question: "Which TOML version?",
        answer:
          "We follow TOML v1.0 types as far as JSON allows. Datetimes become JSON strings (ISO-8601).",
      },
      {
        question: "Is there JSON to TOML?",
        answer:
          "Not on this page. Keep TOML as the human-edited source and emit JSON for tools that require it.",
      }
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
    title: 'Markdown to HTML (GFM, Private)',
    description:
      'Convert Markdown (GFM) to HTML in your browser. Preview and download a full HTML document. No uploads.',
    h1: 'Markdown to HTML Converter',
    answerFirst:
      "Markdown to HTML turns GFM into HTML tags. Example: `# Hello` becomes one <h1>. Paste .md for a local preview or full document download — no upload.",
    inputFormats: ['.md', '.markdown', 'text/markdown'],
    outputFormats: ['.html'],
    limits: ['Raw HTML in Markdown is passed through (sanitize before publishing)', 'No server-side includes', 'Mermaid/math not rendered'],
    related: ['yaml-to-json', 'svg-to-png'],
    relatedGuides: ['markdown-html-for-blogs', 'privacy-first-conversion'],
    library: 'marked',
    lazy: true,
    component: 'MarkdownHtmlTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-24',
    howToSteps: ['Paste Markdown or open a .md file.', 'Convert / live preview.', 'Download HTML fragment or full document.'],
    method: 'marked.parse with GFM enabled produces HTML. An optional wrapper adds charset, viewport, and basic typography CSS.',
    workedExample: 'Input `# Hello` outputs a level-one heading element in HTML (rendered as a heading tag, not shown here to avoid duplicate headings on this page).',
    mistakes: ['Publishing unsanitized HTML from untrusted MD.', 'Expecting LaTeX to render.'],
    faqs: [
      {
        question: 'Is GitHub Flavored Markdown supported?',
        answer: 'Yes — tables, strikethrough, and task-list syntax follow GFM via marked.',
      },,
      {
        question: "Does Markdown to HTML upload my draft?",
        answer:
          "No. marked runs in your browser. Draft posts are not uploaded for conversion.",
      },
      {
        question: "Is the HTML sanitized against XSS?",
        answer:
          "Raw HTML inside Markdown may pass through. Sanitize before publishing untrusted content; local conversion is not a security filter.",
      },
      {
        question: "Can I download a full HTML document?",
        answer:
          "Yes — use the full-document option to wrap charset, viewport, and basic typography around the fragment.",
      }
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
    title: 'PSD to PNG Converter (Private)',
    description:
      'Convert Photoshop PSD files to PNG in your browser with ag-psd. Your design files never leave your device.',
    h1: 'PSD to PNG Converter',
    answerFirst:
      "PSD to PNG flattens a Photoshop document to a lossless PNG. Example: a 1200×800 PSD exports a 1200×800 PNG preview. ag-psd runs in your browser — artwork never uploads.",
    inputFormats: ['.psd'],
    outputFormats: ['.png'],
    limits: [
      'Some advanced blend modes/smart objects may not match Photoshop exactly',
      'Very large PSDs need enough RAM',
      'Color profiles are flattened to the canvas bitmap',
    ],
    related: ['heic-to-jpg', 'image-format-converter', 'svg-to-png'],
    relatedGuides: ['psd-without-photoshop'],
    library: 'ag-psd',
    lazy: true,
    component: 'PsdToPngTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-24',
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
      },,
      {
        question: "Does PSD to PNG upload my artwork?",
        answer:
          "No. ag-psd composites in your browser. Unpublished PSDs never leave your device for conversion.",
      },
      {
        question: "Are layers preserved?",
        answer:
          "No. PNG is a flattened bitmap. Keep the PSD as the editable master.",
      },
      {
        question: "Why does my preview look blank?",
        answer:
          "Some PSDs need Maximize Compatibility enabled when saved, or use features ag-psd cannot composite. Try flattening in Photoshop and re-export.",
      }
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
    title: 'HEIC to JPG Converter – Free, No Upload',
    description:
      'Convert iPhone HEIC/HEIF photos to JPG in your browser. No uploads. Ideal for sharing and older apps.',
    h1: 'HEIC to JPG Converter',
    answerFirst:
      "HEIC to JPG converts iPhone HEIC/HEIF photos to JPEG. Example: a 4032×3024 HEIC becomes a shareable JPG. Decode runs via WASM in your browser — photos never upload.",
    inputFormats: ['.heic', '.heif', 'image/heic', 'image/heif'],
    outputFormats: ['.jpg', '.jpeg'],
    limits: [
      'Animated/multi-image HEIC may export the primary frame only',
      'WASM decode needs a modern browser',
      'Quality slider trades size vs artifacts',
    ],
    related: ['image-format-converter', 'psd-to-png', 'svg-to-png'],
    relatedGuides: ['heic-vs-jpg', 'webp-vs-png-vs-jpg'],
    library: 'heic2any',
    lazy: true,
    component: 'HeicToJpgTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-24',
    howToSteps: ['Select a .heic photo.', 'Adjust JPEG quality if needed.', 'Download .jpg.'],
    method: 'heic2any converts HEIC Blob → JPEG Blob using a WASM decoder loaded on first use.',
    workedExample: 'A 4032×3024 iPhone HEIC becomes a JPEG you can attach to email clients that reject HEIC.',
    mistakes: ['Confusing HEIC with HEVC video.', 'Setting quality too low for print.'],
    faqs: [
      {
        question: 'Does heic to jpg work on Android Chrome?',
        answer: 'Most modern Chromium and Safari builds work; if WASM fails, try an updated browser.',
      },,
      {
        question: "Does HEIC to JPG upload my photos?",
        answer:
          "No. Decoding uses WASM in your browser. Camera-roll bytes are not posted for conversion.",
      },
      {
        question: "Does converting lose quality?",
        answer:
          "JPEG is lossy. Use quality around 0.85–0.92 for sharing and keep the HEIC master when possible.",
      },
      {
        question: "Can Windows open HEIC without converting?",
        answer:
          "With Microsoft HEIF/HEVC extensions, often yes. Otherwise convert to JPG locally — see the HEIC vs JPG guide.",
      }
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
    title: 'WebP PNG JPG Converter (Private)',
    description:
      'Convert between WebP, PNG, and JPG in your browser with canvas export. No uploads. Pick target format and quality.',
    h1: 'WebP, PNG, and JPG Converter',
    answerFirst:
      "WebP/PNG/JPG conversion re-encodes rasters between formats. Example: a 800×600 PNG → JPG at quality 0.85. Canvas export runs locally — files never leave your device.",
    inputFormats: ['.webp', '.png', '.jpg', '.jpeg'],
    outputFormats: ['.webp', '.png', '.jpg'],
    limits: ['SVG/PSD/HEIC have dedicated tools', 'JPEG flattens transparency to white', 'Browser codec support required for WebP'],
    related: ['heic-to-jpg', 'svg-to-png', 'psd-to-png'],
    relatedGuides: ['webp-vs-png-vs-jpg', 'heic-vs-jpg'],
    lazy: true,
    component: 'ImageFormatTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-24',
    howToSteps: ['Drop a WebP, PNG, or JPG.', 'Select output format and quality.', 'Download the result.'],
    method: 'createImageBitmap → canvas.drawImage → canvas.toBlob with the selected mime type.',
    workedExample: 'A transparent PNG converted to JPG fills transparency with white; converting to WebP can keep alpha when the browser supports it.',
    mistakes: ['Using JPG when you need alpha.', 'Re-compressing many times (generation loss).'],
    faqs: [
      {
        question: 'Should I use WebP to PNG or WebP to JPG?',
        answer:
          'Choose PNG for lossless/alpha needs; JPG for smaller opaque photos; WebP for modern web delivery.',
      },,
      {
        question: "Does this converter upload my image?",
        answer:
          "No. Canvas re-encoding runs in your browser. Files never leave your device for conversion.",
      },
      {
        question: "Does WebP to PNG keep transparency?",
        answer:
          "PNG keeps alpha. JPG does not (transparency fills white). WebP alpha depends on browser encode support.",
      },
      {
        question: "Why is there one hub instead of pair pages?",
        answer:
          "This page covers the common WebP/PNG/JPG triangle. Dedicated pair landings may be added later without changing this hub.",
      }
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
    title: 'SVG to PNG Converter – High-Res, Private',
    description:
      'Rasterize SVG to PNG in your browser at a chosen scale. No uploads. Perfect for icons and simple illustrations.',
    h1: 'SVG to PNG Converter',
    answerFirst:
      "SVG to PNG rasterizes vectors at a chosen scale. Example: a 24×24 icon at 3× exports a 72×72 PNG. Drawn on canvas in your browser — no upload.",
    inputFormats: ['.svg', 'image/svg+xml'],
    outputFormats: ['.png'],
    limits: [
      'External fonts/images referenced by URL may not load (browser security)',
      'Scripts inside SVG are not executed for export',
      'Huge scales can exhaust memory',
    ],
    related: ['image-format-converter', 'psd-to-png', 'markdown-to-html'],
    relatedGuides: ['svg-to-high-res-png', 'webp-vs-png-vs-jpg'],
    lazy: false,
    component: 'SvgToPngTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-24',
    howToSteps: ['Paste SVG or choose a file.', 'Set scale (1×, 2×, 3×).', 'Download PNG.'],
    method: 'Blob URL → Image → canvas draw at scaled size → PNG blob.',
    workedExample: 'A 24×24 icon SVG at 3× scale exports a 72×72 PNG for retina UI mocks.',
    mistakes: ['Relying on external CSS fonts.', 'Expecting CSS animations in the PNG.'],
    faqs: [
      {
        question: 'Why is my SVG to PNG blank?',
        answer:
          'Often missing width/height/viewBox, or external resources blocked. Inline critical styles and set viewBox.',
      },,
      {
        question: "Does SVG to PNG upload my file?",
        answer:
          "No. Rasterization uses canvas locally. Vector masters stay on your device.",
      },
      {
        question: "What scale should I use for retina?",
        answer:
          "2× or 3× is common for UI icons (e.g. 24×24 at 3× → 72×72). For print, target about 300 DPI.",
      },
      {
        question: "Why is the PNG blurry?",
        answer:
          "Exporting at 1× then upscaling elsewhere blurs edges. Increase scale here from the SVG master instead.",
      }
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
    title: 'STL to OBJ Converter & Viewer',
    description:
      'View STL files, convert STL to OBJ, and switch ASCII/binary STL — all in-browser. No uploads. Three.js viewer loads on demand.',
    h1: 'STL to OBJ Converter & Viewer',
    answerFirst:
      "STL to OBJ converts triangle meshes for DCC tools. Example: a binary benchy.stl exports an .obj with the same facet count. Parsing and preview stay on your device.",
    inputFormats: ['.stl'],
    outputFormats: ['.obj', '.stl'],
    limits: [
      'Normals are taken from the STL facets',
      'OBJ export expands vertices per facet (no welding)',
      'Very large meshes may be slow',
    ],
    related: ['stl-to-gcode'],
    relatedGuides: ['stl-formats-explained', 'stl-gcode-slicer-basics'],
    library: 'three',
    lazy: true,
    component: 'StlTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-24',
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
      },,
      {
        question: "Does STL to OBJ upload my mesh?",
        answer:
          "No. Parsing and Three.js preview load on demand in your browser.",
      },
      {
        question: "Are colour and materials preserved?",
        answer:
          "No. STL is geometry only. OBJ export here does not invent MTL appearance, units, or colours.",
      }
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
    title: 'STL to G-code: Basic Educational Slicer',
    description:
      'Generate basic educational G-code contours from STL in your browser. Documented limits — not a full production slicer.',
    h1: 'STL to G-code (Basic Slicer)',
    answerFirst:
      "STL to G-code (educational) emits simple Z-layer contours. Example: a 20 mm cube at 0.2 mm layers yields stacked square paths — not a full slicer. Runs locally; simulate before any print.",
    inputFormats: ['.stl'],
    outputFormats: ['.gcode'],
    limits: [
      'No supports, infill patterns, or multi-extruder logic',
      'Single contour segments per triangle intersection',
      'Always simulate before printing',
      'Temperatures in the preamble are placeholders you must edit',
    ],
    related: ['stl-to-obj'],
    relatedGuides: ['stl-gcode-slicer-basics', 'stl-formats-explained'],
    lazy: true,
    component: 'StlGcodeTool',
    datePublished: '2026-10-19',
    dateModified: '2026-10-24',
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
      },,
      {
        question: "Does STL to G-code upload my mesh?",
        answer:
          "No. Contour generation runs locally. Still simulate before any print.",
      },
      {
        question: "Which printers are supported?",
        answer:
          "None specifically — this is an educational contour exporter, not a profile-based production slicer. Use Cura, PrusaSlicer, or OrcaSlicer for real prints.",
      }
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
    title: 'PDF Bank Statement to CSV',
    description:
      'Extract text from PDF bank statements to CSV in your browser with pdf.js and column detection. Clear limits; no uploads.',
    h1: 'PDF Bank Statement to CSV',
    answerFirst:
      "PDF bank statement to CSV clusters text positions into spreadsheet rows. Example: Date/Description/Amount columns often become 3 CSV fields. pdf.js runs locally — statements never upload.",
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
    dateModified: '2026-10-24',
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
      },,
      {
        question: "Can I convert a scanned statement?",
        answer:
          "Not directly. This tool needs a text-based PDF. Run OCR first, or download CSV/OFX from your bank when available.",
      },
      {
        question: "Is it safe for bank PDFs?",
        answer:
          "Conversion never uploads the PDF. Still verify amounts and delete local CSV copies from shared machines when finished.",
      }
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
