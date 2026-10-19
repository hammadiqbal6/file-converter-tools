# Google AdSense readiness

Governing checklist: [MARKET-RESEARCH.md](./MARKET-RESEARCH.md) §4, [SEO-PLAYBOOK.md](./SEO-PLAYBOOK.md).

## When to apply

- After **~20–30 quality pages** indexed with some organic traffic (not on day one).
- Site fully live on HTTPS with real domain and contact email.
- Privacy policy includes required ad cookie disclosures.

## This repo’s setup

- **Publisher ID:** set `PUBLIC_ADSENSE_PUBLISHER_ID` in `src/config/site.ts` or env. Until set, `<AdSlot />` renders a reserved placeholder only.
- **ads.txt:** template at `public/ads.txt` — uncomment and add your `google.com, pub-…` line after approval.
- **Slots:** fixed-height `.ad-slot` (100px) below the tool on tool pages; optional in-article on guides. Auto ads documented in `site.ts` (`adsenseAutoAds`).
- **CMP:** EEA/UK/CH require a **Google-certified CMP** (IAB TCF) before personalized ads. See [Google AdSense CMP help](https://support.google.com/adsense/answer/13554116).

## Eligibility checklist

- [ ] Original explanatory content on every tool page (not widget-only)
- [ ] About, Contact, Privacy, Terms, Methodology
- [ ] Working tools (no deceptive or broken flows)
- [ ] Clear navigation; no broken links (`npm run link-check`)
- [ ] Privacy policy mentions Google/third-party cookies and opt-out links
- [ ] No prohibited content; no incentivized clicks
- [ ] `ads.txt` live after approval

## Policy pitfalls

- Thin or duplicated pages with ads
- Ads above the tool on mobile (we keep the converter first)
- Missing privacy disclosures
- Applying while site is still mostly placeholders

Run `npm run audit:adsense` after `npm run build`.
