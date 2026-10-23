---
name: add-new-converter
description: Add a new client-side converter tool page to this Astro repo (registry, lib, UI, tests, keyword map).
---

# Add a new converter

1. **Keyword** — Add a row to `docs/KEYWORD-MAP.md` (unique primary intent).
2. **Registry** — Extend `src/data/tools.ts` with full content fields (answerFirst, FAQs, sources, limits, related tools).
3. **Logic** — Implement `src/lib/converters/<name>.ts` (pure functions; no `window` unless unavoidable).
4. **Tests** — Add fixture(s) under `tests/fixtures/` and `tests/converters/<name>.test.ts`.
5. **UI** — Create `src/components/tools/<Name>Tool.astro` using `ToolChrome.astro`; `import()` heavy libs inside the convert handler only.
6. **Route** — Wire in `src/pages/tools/[slug].astro` and optional `src/pages/embed/[slug].astro` if `embeddable: true`.
7. **Verify** — `npm test && npm run build && npm run audit` (includes SEO guardrails — `docs/SEO-GUARDRAILS.md`).
8. **PROGRESS.md** — Update checkbox counts and push.

Template for lazy import:

```ts
const { myConvert } = await import('../../lib/converters/my-format');
```
