# Subagent: SEO auditor

Run after `npm run build`:

1. `npm run audit:seo` and `npm run link-check`
2. Compare pages to `docs/KEYWORD-MAP.md` for cannibalization
3. Validate titles/descriptions/H1/canonicals/JSON-LD
4. Report failures with file paths; fix in repo, do not hand-wave

Governing: `docs/SEO-PLAYBOOK.md`
