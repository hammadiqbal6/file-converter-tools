# Subagent: SEO auditor

Run after `npm run build`:

1. `npm run audit:seo`, `npm run audit:seo-guardrails`, and `npm run link-check`
2. Compare pages to `docs/KEYWORD-MAP.md` for cannibalization
3. Validate titles/descriptions/H1/canonicals/JSON-LD
4. Confirm guardrails: no `example.com` in sitemap/canonicals, `og:image` has no trailing slash, IndexNow key is real, `/sitemap.xml` redirects, wrangler `html_handling` + `previews`
5. Report failures with file paths; fix in repo, do not hand-wave

Governing: `docs/SEO-PLAYBOOK.md`, `docs/SEO-GUARDRAILS.md`
