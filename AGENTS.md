# AGENTS.md — LocalFile Convert

Privacy-first **niche file converters** (Astro 7 static site). All conversion runs in the browser.

## Governing guidelines

| Doc | Purpose |
|---|---|
| [docs/SEO-PLAYBOOK.md](docs/SEO-PLAYBOOK.md) | SEO, technical, GEO, AdSense synthesis |
| [docs/MARKET-RESEARCH.md](docs/MARKET-RESEARCH.md) | Niche selection evidence |
| [docs/KEYWORD-MAP.md](docs/KEYWORD-MAP.md) | One primary keyword per URL |
| [docs/ideas/README.md](docs/ideas/README.md) | 23 ranked ideas + backlog |

**Live progress:** [PROGRESS.md](PROGRESS.md) on the working branch.

## Architecture

```mermaid
flowchart TB
  subgraph build [Static build]
    Astro[Astro SSG]
    Dist[dist/ HTML + assets]
    Astro --> Dist
  end
  subgraph runtime [Browser]
    Page[Tool page HTML]
    Island[Tool island scripts]
    Lib[Lazy vendor chunks WASM]
    Page --> Island
    Island -->|dynamic import on convert| Lib
  end
  Dist --> Page
```

- **Config:** `src/config/site.ts` — brand, domain, AdSense, GA4, verification placeholders.
- **Tools metadata + long-form SEO:** `src/data/tools.ts`
- **Guides:** `src/data/guides.ts`
- **Converters:** `src/lib/converters/*` (tested with Vitest)
- **UI:** `src/components/tools/*`, shell `ToolChrome.astro`
- **Layouts:** `BaseLayout.astro`, `ToolLayout.astro`
- **Audits:** `scripts/audit/*`, `npm run audit`

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (Node 22.22 via `scripts/run-astro.mjs`) |
| `npm run build` | Production build + `postbuild` robots/llms patch |
| `npm test` | Vitest converter tests |
| `npm run audit` | SEO + AdSense + bundles + link check |
| `npm run lighthouse` | LHCI mobile budgets |
| `npm run screenshots` | 360px Playwright captures → `artifacts/screenshots/` |

## Add a converter (summary)

See skill `.cursor/skills/add-new-converter/SKILL.md`.

1. `docs/KEYWORD-MAP.md` row  
2. `src/data/tools.ts` entry (full content)  
3. `src/lib/converters/<x>.ts` + tests  
4. `src/components/tools/<X>Tool.astro` (lazy libs)  
5. Wire `[slug].astro` / embed if needed  
6. `npm test && npm run build && npm run audit`

## Subagents (`.cursor/agents/`)

| Agent | Role |
|---|---|
| `seo-auditor` | Post-build SEO + links |
| `content-writer` | tools.ts / guides.ts copy |
| `adsense-reviewer` | AdSense readiness audit |
| `performance-auditor` | Bundles + Lighthouse |
| `link-builder-researcher` | Off-page ideas |
| `converter-qa` | Tests + smoke checks |

Same roles can be used in other tools (Codex, Claude Code) by pointing at this file.

## Definition of done

- [ ] 14 working converters, client-side, documented limits (MP3→MIDI and DWG skipped with reason)
- [ ] Trust pages, 6 guides, hubs, embeds, sitemap/robots/schema/OG
- [ ] `npm test`, `npm run build`, `npm run audit`, `npm run lighthouse` pass
- [ ] Docs: README, DEPLOYMENT, SEO-GUIDE, ADSENSE, KEYWORD-MAP, ideas index
- [ ] AGENTS.md + `.cursor` skills/rules/agents
- [ ] PR to `main` ready for review with Lighthouse + screenshots
- [ ] `PROGRESS.md` at 100% and pushed

## Dev server

```
npm run dev
```

Uses Node 22.22 through `scripts/run-astro.mjs`.
