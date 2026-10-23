# CLAUDE.md — LocalFile Convert

Same project instructions as [AGENTS.md](./AGENTS.md). Prefer that file for architecture, commands, and definition of done.

**Must-read before SEO or deploy changes:** [docs/SEO-GUARDRAILS.md](./docs/SEO-GUARDRAILS.md)

Hard rules (enforced by `npm run audit` → `scripts/audit/seo-guardrails.mjs`):

1. Never fall back to `example.com` for site URL / sitemap / canonicals.
2. Never emit `og:image` (or other file asset) URLs with a trailing slash.
3. Keep `/sitemap.xml` → `/sitemap-index.xml` in `public/_redirects`.
4. Never ship IndexNow placeholder `00000000000000000000000000000000`.
5. Keep wrangler `html_handling: "force-trailing-slash"` and `"previews": {}`; do not add top-level `vars` for `PUBLIC_*` on this assets-only Worker.

```bash
npm test && npm run build && npm run audit
```
