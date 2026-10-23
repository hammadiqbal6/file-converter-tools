import type { Guide } from '../guide-types';

const guide: Guide = {
  slug: "yaml-vs-json",
  title: "YAML vs JSON: When to Convert",
  description: "Compare YAML and JSON for configs and APIs: comments, types, readability, and when private yaml to json conversion helps without uploading files.",
  primaryKeyword: "yaml vs json",
  secondaryKeywords: ["when to use yaml","json or yaml for configs","yaml to json"],
  datePublished: "2026-10-19",
  dateModified: "2026-10-23",
  relatedTools: ["yaml-to-json","json-to-yaml","toml-to-json"],
  relatedGuides: ["toml-vs-yaml-vs-json","xml-json-attributes","privacy-first-conversion"],
  answerFirst: "Use JSON when machines exchange strict data such as APIs and many CLIs. Use YAML when humans edit configs and need comments. Convert YAML to JSON for tooling that only accepts JSON; convert back when you want editable manifests. Prefer a local converter so secrets in values never upload.",
  takeaways: [
    "JSON is the interchange default; YAML is the human-edit default.",
    "Comments are the main reason teams keep YAML as the source of truth.",
    "Always validate round-trips before committing converted files.",
    "JSON Schema YAML parsing avoids non-JSON types leaking into APIs."
  ],
  sections: [
    {
      h2: "What each format optimizes for",
      html: "<p>JSON (JavaScript Object Notation) is defined by ECMA-404 and RFC 8259 as a text format for structured data built from objects, arrays, strings, numbers, booleans, and null. It has no comments, requires quoted keys, and forbids trailing commas in the standard grammar. Those constraints make parsers simple and interoperable across languages, which is why HTTP APIs, many package manifests, and browser APIs treat JSON as the default interchange format.</p>\n<p>YAML (YAML Ain’t Markup Language) is designed for human-edited configuration. Version 1.2 documents indentation-based structure, comments starting with #, and optional anchors/aliases. Teams often author Kubernetes manifests, CI pipelines, and app configs in YAML because reviewers can annotate intent inline. The trade-off is a larger grammar surface: indentation mistakes, tab/space mixing, and older YAML 1.1 type guessing can surprise people who expected “JSON with comments.”</p>\n<p>Neither format is universally “better.” Choose based on who edits the file and which tools consume it. When those audiences diverge, conversion is a normal part of the workflow rather than a failure of either format.</p><table><thead><tr><th>Concern</th><th>YAML</th><th>JSON</th></tr></thead><tbody>\n<tr><td>Comments</td><td>Supported (#)</td><td>Not supported</td></tr>\n<tr><td>Trailing commas</td><td>N/A (indentation)</td><td>Invalid in standard JSON</td></tr>\n<tr><td>Learning curve</td><td>Indentation rules</td><td>Braces and quotes</td></tr>\n<tr><td>Browser APIs</td><td>Needs a library</td><td>Built-in JSON.parse</td></tr>\n<tr><td>Typical role</td><td>Human-edited configs</td><td>APIs and strict interchange</td></tr>\n</tbody></table><p>Authoritative references include the <a href=\"https://yaml.org/spec/1.2.2/\">YAML 1.2.2 specification</a> and <a href=\"https://www.ecma-international.org/publications-and-standards/standards/ecma-404/\">ECMA-404</a>.</p>",
    },
    {
      h2: "When yaml to json conversion helps",
      html: "<p>Conversion helps when humans keep YAML sources of truth but a dashboard, CLI, or API only accepts JSON. A common pattern is editing a service config in YAML, then emitting JSON for a deployment API that validates against a JSON Schema. The reverse path—JSON samples from an API turned into YAML for a repo—helps reviewers add comments before the next change.</p>\n<p>Use our <a href=\"/tools/yaml-to-json/\">YAML to JSON converter</a> locally so values that might contain tokens never leave the device. Reverse with <a href=\"/tools/json-to-yaml/\">JSON to YAML</a> when importing API samples into a repository. If you also maintain Cargo or other TOML configs, see <a href=\"/guides/toml-vs-yaml-vs-json/\">TOML vs YAML vs JSON</a> and the <a href=\"/tools/toml-to-json/\">TOML to JSON</a> tool.</p>\n<p>Privacy matters because config files frequently embed hostnames, feature flags, and occasionally credentials that should have lived in a secret store. An in-browser converter downloads library code, then parses and serializes in memory. Your document bytes should not appear as an upload body; verify with DevTools → Network during conversion, as described in <a href=\"/guides/privacy-first-conversion/\">privacy-first conversion</a>.</p>",
    },
    {
      h2: "Worked example",
      html: "<p>Start with a small YAML service block:</p><pre><code>service:\n  port: 8080\n  secure: true\n  # staging only\n  name: api</code></pre><p>After JSON-compatible YAML parsing and JSON.stringify with two-space indentation, you get an object with numeric port, boolean secure, and string name. The comment line disappears because JSON has no comment syntax—that loss is expected and is why many teams keep YAML as the editable master.</p>\n<p>Compact output collapses whitespace for wire transfer. Pretty output is easier to diff in code review when the consumer accepts either form. Round-trip back to YAML if you need comments again; re-add comments manually because they cannot be reconstructed from JSON alone.</p>",
    },
    {
      h2: "Pitfalls and how to avoid them",
      html: "<ul><li><strong>Norway problem / country codes:</strong> older YAML 1.1 could interpret some unquoted strings as booleans. Prefer JSON-compatible schemas and quote ambiguous scalars.</li><li><strong>Duplicate keys:</strong> YAML may allow repeats that collapse when mapped to JSON objects; treat duplicates as authoring errors.</li><li><strong>Anchors and aliases:</strong> YAML merge keys and aliases have no JSON equivalent; expand them before interchange.</li><li><strong>Tabs:</strong> YAML indentation requires spaces; tabs often cause parse errors.</li><li><strong>Custom tags:</strong> language-specific tags will not survive JSON conversion—strip or rewrite them first.</li></ul><p>For XML documents with attributes and mixed content, conversion rules differ; see <a href=\"/guides/xml-json-attributes/\">XML to JSON attributes and arrays</a>. Validate with the consumer’s parser, not only with a single library’s happy path.</p>",
    },
    {
      h2: "Practical checklist before you commit",
      html: "<ol><li>Decide which file is the source of truth (usually the commented YAML).</li><li>Convert with a local tool; confirm Network shows no document upload.</li><li>Parse the JSON with the same library your service uses.</li><li>Diff a round-trip; investigate any type changes (numbers, booleans, null).</li><li>Document in the README why both formats exist so future editors do not delete one casually.</li></ol><p>If your pipeline also moves tabular data, pair these habits with <a href=\"/guides/csv-json-pipelines/\">CSV and JSON pipeline tips</a>. Keep conversions boring and reversible whenever possible.</p>",
    },
    {
      h2: 'Operations notes',
      html: "\n<p>Document the consumer application version beside each successful fixture so future upgrades do not silently change parse rules. When a library updates its default schema mode, re-run the fixture before you delete the previous export.</p>\n<p>Prefer explicit settings over “smart” defaults whenever the tool offers a choice: pretty versus compact JSON, quality sliders for images, scale factors for SVG, or delimiter overrides for CSV. Explicit settings make results reproducible across teammates and machines.</p>\n<p>If you automate conversions in CI, keep using headless desktop tools under your control rather than posting files to third-party HTTP APIs. Browser tools on this site are aimed at interactive private use; CI usually needs a CLI with pinned versions.</p>\n<p>Security reviews should treat file converters like any other local document processor: malicious crafted files can stress parsers. Only open files you trust, and keep the browser updated. Conversion privacy (no upload) does not mean the parser is a sandbox for hostile content.</p>\n<p>Accessibility and usability still matter on tool pages: labels on inputs, status text for screen readers, and clear errors when parsing fails. If conversion fails, read the error, fix the source file, and retry after a refresh so lazy libraries can reload cleanly.</p>\n<p>Finally, link related explainers from the tool page “Learn more” section rather than stuffing every guide with every converter. Topical clusters help humans and citation systems find the right depth without diluting primary keywords across near-duplicate URLs.</p>\n",
    }
  ],
  faqs: [
    {
      question: "Is YAML a superset of JSON?",
      answer: "YAML 1.2 can parse most JSON documents, but treating YAML as “JSON with comments” still risks indentation and typing surprises. Prefer explicit conversion when systems require JSON.",
    },
    {
      question: "Will comments survive yaml to json?",
      answer: "No. JSON has no comment syntax. Keep YAML (or another documented format) as the commented source of truth and treat JSON as an export.",
    },
    {
      question: "Does LocalFile Convert upload my YAML?",
      answer: "No. Conversion runs in your browser. Your file never leaves your device. Library code may download once; your document bytes are not posted for conversion.",
    },
    {
      question: "When should I prefer TOML instead?",
      answer: "TOML targets unambiguous config with explicit types and sections. Compare formats in our TOML vs YAML vs JSON guide and convert with the TOML to JSON tool when needed.",
    }
  ],
  sources: [
    { label: "YAML 1.2.2", href: "https://yaml.org/spec/1.2.2/" },
    { label: "ECMA-404 JSON", href: "https://www.ecma-international.org/publications-and-standards/standards/ecma-404/" },
    { label: "RFC 8259", href: "https://datatracker.ietf.org/doc/html/rfc8259" }
  ],
};

export default guide;
