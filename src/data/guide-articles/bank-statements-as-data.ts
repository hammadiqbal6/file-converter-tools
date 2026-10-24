import type { Guide } from '../guide-types';

const guide: Guide = {
  slug: "bank-statements-as-data",
  title: "Bank Statements as Data (PDF→CSV)",
  description: "How text extraction turns PDF bank statements into CSV, what fails on scans, and how to verify transactions before any accounting import.",
  primaryKeyword: "pdf bank statement to csv",
  secondaryKeywords: ["extract bank transactions pdf","statement to spreadsheet"],
  datePublished: "2026-10-19",
  dateModified: "2026-10-24",
  relatedTools: ["pdf-bank-statement-to-csv","csv-to-json"],
  relatedGuides: ["csv-json-pipelines","privacy-first-conversion"],
  answerFirst: "Prefer your bank’s native CSV/OFX first. For text PDFs, glyph clustering can yield usable CSV; scanned pages need OCR first. Always reconcile: opening + Σ transactions = closing (spot-check at least 3 rows) before imports.",
  takeaways: [
    "Prefer official CSV/OFX downloads when the bank offers them.",
    "No-upload extraction protects financial PDFs.",
    "Heuristics misread unusual layouts—verify totals.",
    "Empty output usually means image-only pages."
  ],
  sections: [
    {
      h2: "Overview",
      html: "<table><thead><tr><th>Step</th><th>Action</th></tr></thead><tbody>\n<tr><td>1</td><td>Identify source and target formats</td></tr>\n<tr><td>2</td><td>Convert locally with the matching tool</td></tr>\n<tr><td>3</td><td>Validate in the consumer app</td></tr>\n<tr><td>4</td><td>Keep the editable master file</td></tr>\n</tbody></table><p>This guide focuses on pdf bank statement to csv with practical steps you can apply without inventing marketing statistics. Examples use small, checkable inputs so you can reproduce results in the paired on-site tools. Where format specs exist, we cite them rather than paraphrasing folklore from forums.</p>\n<p>Always prefer official downloads from your bank, camera, or CAD tool when they already expose the format you need. Converters exist for the gaps: mismatched CMS requirements, colleague devices that lack a codec, or pipelines that only accept JSON.</p>",
    },
    {
      h2: "Worked example",
      html: "<p>Create or export a small sample file that contains realistic field names but no real secrets. Run it through the related converter on this site, then open the result in the target application (browser, CAD tool, spreadsheet, or CMS preview).</p>\n<p>If the output fails validation, adjust one variable at a time: encoding, delimiter, scale factor, or schema mode. Record the setting that worked in your team’s runbook so the next person does not rediscover it under deadline pressure.</p><ul><li>Prefer fixtures checked into a private repo over production data.</li><li>Strip credentials before sharing samples with contractors.</li><li>Compare file sizes only on the same asset generations—do not generalize from a single photo or mesh.</li></ul><pre><code>sample-input → local converter → validate → archive master</code></pre>",
    },
    {
      h2: "Limits and safe defaults",
      html: "<p>Text PDFs only—image scans need OCR first. Password-protected PDFs are unsupported. Column heuristics mis-read unusual layouts.</p><p>Safe defaults: prefer bank CSV; reconcile balances; never treat extraction as audit-ready without human checks.</p><ol><li>Confirm text is selectable in the PDF viewer.</li><li>Extract a short statement first.</li><li>Reconcile opening + Σ = closing.</li></ol>",
    },
    {
      h2: "Related workflows on this site",
      html: "<p>Related tools: <a href=\"/tools/pdf-bank-statement-to-csv/\">pdf-bank-statement-to-csv</a>, <a href=\"/tools/csv-to-json/\">csv-to-json</a>. Related guides: <a href=\"/guides/csv-json-pipelines/\">csv-json-pipelines</a>, <a href=\"/guides/privacy-first-conversion/\">privacy-first-conversion</a>.</p>\n<p>Internal links exist so you can move between topical explainers without bouncing through unrelated hubs. If a guide does not list a tool, that is intentional—avoid carpet-linking every converter from every article.</p>\n<p>For category browsing, use the data, documents, images, and CAD hubs. Each hub lists the converters that belong to that cluster and the guides that cite them.</p>",
    },
    {
      h2: "Checklist before you publish or print",
      html: "<p>Publishing a blog HTML fragment, uploading a JPG, or sending G-code to a printer are different risk levels. Raise the verification bar as physical or financial risk rises.</p><ul><li>Confirm format support on the destination.</li><li>Confirm color/alpha expectations (especially PNG→JPG).</li><li>Confirm units for 3D meshes.</li><li>Confirm totals for financial CSV extracts.</li><li>Confirm license and attribution if assets are third-party.</li></ul><p>When in doubt, keep the original, export a copy, and label the copy with date and tool settings. That habit prevents silent quality loss from repeated lossy re-encoding and makes debugging tractable.</p>",
    },
    {
      h2: 'Operations notes',
      html: "<p>Document which bank PDF layout you tested (e.g. three-column Date / Description / Amount) and the statement period. Heuristic column clustering can shift when the bank changes typography—re-check after any PDF redesign.</p><p>Always prefer the bank’s CSV/OFX download when available. Use PDF extraction only for gaps. Before accounting import, reconcile opening + sum(transactions) = closing, and spot-check 3–5 rows against the PDF.</p><p>Never email raw statement PDFs to third-party upload converters. Local pdf.js extraction keeps balances on-device; still delete downloaded CSVs from shared machines when done.</p>",
    }
  ],
  faqs: [
    {
      question: "What is the main takeaway for pdf bank statement to csv?",
      answer: "Digital PDF statements expose text glyphs with coordinates; clustering those positions can yield CSV columns. Scanned statements are images and need OCR first. Always spot-check amounts before accounting imports, and prefer bank CSV/OFX downloads when available.",
    },
    {
      question: "Does LocalFile Convert upload my file?",
      answer: "No. Statement PDFs are parsed with pdf.js in your browser. We never receive the PDF for conversion.",
    },
    {
      question: "Where should I go next?",
      answer: "Use the related tools linked on this page and the related guides for adjacent formats. Start from the converter that matches your input file extension.",
    },
    {
      question: "Are there invented benchmarks here?",
      answer: "No. This page avoids fabricated traffic or compression percentage claims. Compare outputs on your own files when quality matters.",
    }
  ],
  sources: [
    { label: "pdf.js", href: "https://mozilla.github.io/pdf.js/" }
  ],
};

export default guide;
