import type { Guide } from '../guide-types';

const guide: Guide = {
  slug: "stl-formats-explained",
  title: "STL Formats: ASCII, Binary, OBJ",
  description: "Understand STL ASCII versus binary, when to convert to OBJ for DCC tools, and why browser G-code paths have limits compared with full slicers.",
  primaryKeyword: "stl ascii vs binary",
  secondaryKeywords: ["stl to obj","stl to gcode limits"],
  datePublished: "2026-10-19",
  dateModified: "2026-10-23",
  relatedTools: ["stl-to-obj","stl-to-gcode"],
  relatedGuides: ["stl-gcode-slicer-basics","privacy-first-conversion"],
  answerFirst: "STL stores triangle meshes as ASCII text or a compact binary layout. OBJ is a common text mesh for DCC tools. G-code is machine motion—not a mesh—so “STL to G-code” is slicing. Use browser mesh tools for private prep; use a full slicer with profiles and supports for printable parts.",
  takeaways: [
    "Binary STL is smaller; ASCII is greppable.",
    "Use STL→OBJ for Blender and many DCC handoffs.",
    "Treat browser G-code as educational unless you simulate.",
    "STL has no units—confirm mm versus inches with your CAD export."
  ],
  sections: [
    {
      h2: "Overview",
      html: "<table><thead><tr><th>Step</th><th>Action</th></tr></thead><tbody>\n<tr><td>1</td><td>Identify source and target formats</td></tr>\n<tr><td>2</td><td>Convert locally with the matching tool</td></tr>\n<tr><td>3</td><td>Validate in the consumer app</td></tr>\n<tr><td>4</td><td>Keep the editable master file</td></tr>\n</tbody></table><p>This guide focuses on stl ascii vs binary with practical steps you can apply without inventing marketing statistics. Examples use small, checkable inputs so you can reproduce results in the paired on-site tools. Where format specs exist, we cite them rather than paraphrasing folklore from forums.</p>\n<p>Always prefer official downloads from your bank, camera, or CAD tool when they already expose the format you need. Converters exist for the gaps: mismatched CMS requirements, colleague devices that lack a codec, or pipelines that only accept JSON.</p>",
    },
    {
      h2: "Worked example",
      html: "<p>Create or export a small sample file that contains realistic field names but no real secrets. Run it through the related converter on this site, then open the result in the target application (browser, CAD tool, spreadsheet, or CMS preview).</p>\n<p>If the output fails validation, adjust one variable at a time: encoding, delimiter, scale factor, or schema mode. Record the setting that worked in your team’s runbook so the next person does not rediscover it under deadline pressure.</p><ul><li>Prefer fixtures checked into a private repo over production data.</li><li>Strip credentials before sharing samples with contractors.</li><li>Compare file sizes only on the same asset generations—do not generalize from a single photo or mesh.</li></ul><pre><code>sample-input → local converter → validate → archive master</code></pre>",
    },
    {
      h2: "Limits and safe defaults",
      html: "<p>Browser memory, main-thread time, and incomplete format coverage set hard limits. Very large files may freeze a tab; split batches when possible. Educational G-code, heuristic PDF extraction, and PSD compositing each document fidelity gaps on their tool pages—read those limits before relying on output.</p>\n<p>Safe defaults: keep masters, convert copies, verify with the consumer, and avoid uploading sensitive bytes to unknown websites. Our tool pages repeat the privacy line because it is the product promise: your file never leaves your device during conversion.</p><ol><li>Read the tool’s limits list.</li><li>Convert a non-sensitive fixture first.</li><li>Inspect Network during conversion.</li><li>Spot-check the output in the real consumer.</li></ol>",
    },
    {
      h2: "Related workflows on this site",
      html: "<p>Related tools: <a href=\"/tools/stl-to-obj/\">stl-to-obj</a>, <a href=\"/tools/stl-to-gcode/\">stl-to-gcode</a>. Related guides: <a href=\"/guides/stl-gcode-slicer-basics/\">stl-gcode-slicer-basics</a>, <a href=\"/guides/privacy-first-conversion/\">privacy-first-conversion</a>.</p>\n<p>Internal links exist so you can move between topical explainers without bouncing through unrelated hubs. If a guide does not list a tool, that is intentional—avoid carpet-linking every converter from every article.</p>\n<p>For category browsing, use the data, documents, images, and CAD hubs. Each hub lists the converters that belong to that cluster and the guides that cite them.</p>",
    },
    {
      h2: "Checklist before you publish or print",
      html: "<p>Publishing a blog HTML fragment, uploading a JPG, or sending G-code to a printer are different risk levels. Raise the verification bar as physical or financial risk rises.</p><ul><li>Confirm format support on the destination.</li><li>Confirm color/alpha expectations (especially PNG→JPG).</li><li>Confirm units for 3D meshes.</li><li>Confirm totals for financial CSV extracts.</li><li>Confirm license and attribution if assets are third-party.</li></ul><p>When in doubt, keep the original, export a copy, and label the copy with date and tool settings. That habit prevents silent quality loss from repeated lossy re-encoding and makes debugging tractable.</p>",
    },
    {
      h2: 'Operations notes',
      html: "\n<p>Document the consumer application version beside each successful fixture so future upgrades do not silently change parse rules. When a library updates its default schema mode, re-run the fixture before you delete the previous export.</p>\n<p>Prefer explicit settings over “smart” defaults whenever the tool offers a choice: pretty versus compact JSON, quality sliders for images, scale factors for SVG, or delimiter overrides for CSV. Explicit settings make results reproducible across teammates and machines.</p>\n<p>If you automate conversions in CI, keep using headless desktop tools under your control rather than posting files to third-party HTTP APIs. Browser tools on this site are aimed at interactive private use; CI usually needs a CLI with pinned versions.</p>\n<p>Security reviews should treat file converters like any other local document processor: malicious crafted files can stress parsers. Only open files you trust, and keep the browser updated. Conversion privacy (no upload) does not mean the parser is a sandbox for hostile content.</p>\n<p>Accessibility and usability still matter on tool pages: labels on inputs, status text for screen readers, and clear errors when parsing fails. If conversion fails, read the error, fix the source file, and retry after a refresh so lazy libraries can reload cleanly.</p>\n<p>Finally, link related explainers from the tool page “Learn more” section rather than stuffing every guide with every converter. Topical clusters help humans and citation systems find the right depth without diluting primary keywords across near-duplicate URLs.</p>\n",
    }
  ],
  faqs: [
    {
      question: "What is the main takeaway for stl ascii vs binary?",
      answer: "STL stores triangle meshes as ASCII text or a compact binary layout. OBJ is a common text mesh for DCC tools. G-code is machine motion—not a mesh—so “STL to G-code” is slicing. Use browser mesh tools for private prep; use a full slicer with profiles and supports for printable parts.",
    },
    {
      question: "Does LocalFile Convert upload my file?",
      answer: "No. Conversion runs in your browser. Your file never leaves your device.",
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
    { label: "STL file format", href: "https://en.wikipedia.org/wiki/STL_(file_format)" },
    { label: "RepRap G-code", href: "https://reprap.org/wiki/G-code" }
  ],
};

export default guide;
