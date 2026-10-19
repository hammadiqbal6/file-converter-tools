---
name: seo-audit
description: Repo-specific skill for LocalFile Convert (niche in-browser file converters). Read AGENTS.md and docs/SEO-PLAYBOOK.md first.
---

# seo-audit

## When to use
Apply this skill for tasks involving **seo-audit** on the LocalFile Convert Astro site.

## Repo anchors
- Config: `src/config/site.ts`
- Tool registry: `src/data/tools.ts`
- Converter logic: `src/lib/converters/`
- Tool UI: `src/components/tools/` + `src/pages/tools/[slug].astro`
- SEO layout: `src/layouts/ToolLayout.astro`
- Audits: `npm run audit` after `npm run build`
- Governing docs: `docs/SEO-PLAYBOOK.md`, `docs/KEYWORD-MAP.md`

## Steps (generic)
1. Read existing patterns in the closest tool/page.
2. Keep conversion **client-side only**; lazy-load heavy libs on interaction.
3. Update `docs/KEYWORD-MAP.md` if intent changes.
4. Run `npm test`, `npm run build`, `npm run audit`.
5. Update `PROGRESS.md` and push.

See `AGENTS.md` for role-specific detail for **seo-audit**.
