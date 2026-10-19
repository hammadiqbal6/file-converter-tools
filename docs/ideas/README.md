# Ideas index (compiled research)

Governing sources for future niche sites and add-ons:

| File | What it is |
|---|---|
| [ideas.csv](./ideas.csv) | Ranked ideas #1–23 with keywords, volume/KD evidence, SERP notes, effort |
| [MORE-IDEAS.md](./MORE-IDEAS.md) | Round-2 writeup (#12–23), bonus add-ons, honourable mentions, sources |
| [../MARKET-RESEARCH.md](../MARKET-RESEARCH.md) | Full market research report (ideas #1–11 deep dive + AdSense/SEO takeaways) |
| [../SEO-PLAYBOOK.md](../SEO-PLAYBOOK.md) | Ranking / GEO / AdSense playbook (governing guidelines for this repo) |

**This repository implements idea #10: niche professional file converters (client-side).** Status: **in progress / built**.

Volumes and KD figures are cited from Ahrefs published data, the Meyerhans/Ahrefs-API census (tiers), Calcwright, or explicitly labelled low-confidence Nuqti estimates. Verify SERPs manually before spinning up a new site.

---

## All 23 ideas

| Rank | Niche | Key evidence | Status |
|---:|---|---|---|
| 1 | Home & garden material calculators (concrete, mulch, gravel, fence, deck, roof) | Concrete calc ~550k/mo (Calcwright); roof pitch 11k KD 13; deck material 1.2k KD 9 (Ahrefs); small sites rank long-tail | **backlog** |
| 2 | Marketplace seller fee & profit calculators (Etsy, eBay, Whatnot, FBA, TikTok Shop) | Etsy fee calc 2k **KD 7**; Amazon FBA 4.8k KD 20 (Ahrefs); fees change yearly | **backlog** |
| 3 | Pet calculators (puppy weight, dog food, age by breed) | SERPs dominated by small exact-match sites; volumes mostly Nuqti estimates (low confidence) | **backlog** |
| 4 | Pay & small-business money converters (hourly↔salary, margin, freelance rate) | Salary to hourly 42k; margin 55k (Ahrefs); avoid paycheck head term KD 72 | **backlog** |
| 5 | AI/LLM token & API cost calculators | Small dev sites rank; pricing/tokenizers change often; ad-block risk | **backlog** |
| 6 | Kenya payroll & import tax (PAYE, SHIF, NSSF, CRSP) | KRA official calc stale (to 2023); small .ke sites rank; low RPM | **backlog** |
| 7 | Pakistan tax & PTA mobile tax | Deep autocomplete; FY updates; low RPM; thin model pages = scaled-content risk | **backlog** |
| 8 | EV & energy cost calculators | Gov tools lead US; country variants less contested; strong CPC vertical | **backlog** |
| 9 | Rental property / landlord calculators | High CPC; YMYL; country-tax long-tail more open | **backlog** |
| 10 | **Niche professional file converters (client-side)** | stl→gcode 1.1k KD 1; yaml→json 2.9k KD 1; psd→png 2.8k KD 4; pdf statement→csv 90 KD 5 (Ahrefs) | **in progress / built (this repo)** |
| 11 | Niche name generators (band, podcast, D&D, clan) | Low KD; commodity AI output; low CPC | **backlog** |
| 12 | Veterans & military benefits (VA combined rating, BAH, GI Bill) | VA disability calc = body tier 10k–100k; law-firm calc ~68k visits/mo; YMYL | **backlog** |
| 13 | FIRE / financial independence (Coast, Barista, couples, country) | Long tail; theficalculator.com DR 0 in top 3 with 267 RDs | **backlog** |
| 14 | Auto fitment & performance (tire size, wheel offset, gear ratio, HP) | Long tail; DR 0–47 sites in top 3 | **backlog** |
| 15 | Payment processor & creator fees (Stripe, PayPal, Square, Patreon) | Long tail; PayPal G&S SERP all small tools; adjacent to #2 | **backlog** |
| 16 | Event & party planning (+ seating chart template) | Wedding seating chart template **1,900/mo KD 7**; hubtap earns DR 66–77 links | **backlog** |
| 17 | Soap, candle & resin maker calculators (lye, fragrance load, epoxy) | Long tail; small maker sites + Reddit demand; lye is safety-critical | **backlog** |
| 18 | Student exam score predictors (AP per subject, SAT; avoid head “final grade”) | AP subject SERPs show small sites; head grade calc owned by rogerhub | **backlog** |
| 19 | Car audio & DIY speaker box calculators | Long tail; subbox.pro DR 39 ~6k/mo; Reddit demand | **backlog** |
| 20 | Niche business document generators (fill → PDF) | Construction estimate template 1.2k **KD 2**; photography contract 1.1k KD 6; tattoo consent KD 0 | **backlog** |
| 21 | Outdoor sports sizing & performance | Long tail; DR 0–2 sites common; seasonal | **backlog** |
| 22 | Homestead & livestock (gestation, coop, firewood, propane) | Long tail; extension + small sites; overlaps #1 on firewood/propane | **backlog** |
| 23 | Fiber arts (yarn, gauge, fabric, quilt, cross-stitch) | Weakest-authority SERPs (DR 0–3); lower CPC craft retail | **backlog** |

---

## Bonus add-ons relevant to **this** site (file converters) — backlog

From `MORE-IDEAS.md` bonus section (Meyerhans census). Compatible with the privacy-first, client-side angle:

| Add-on | Why it fits | Status |
|---|---|---|
| **3D printing cost calculator** | Pairs with STL → G-code / STL → OBJ; small sites (printpal.io DR 29, 3dfils.com DR 14) already rank | **backlog** |
| Additional profession-specific format pairs | Ahrefs: format pairs tied to one profession keep single-digit KD; mine autocomplete for new pairs | **backlog** |
| DWG converters | Skipped unless a reliable client-side library appears (documented in tool FAQs / roadmap) | **blocked / skip** |
| MP3/WAV → MIDI | Skip unless a reliable client-side approach exists (documented) | **blocked / skip** |

Home & garden / pets bonus tools belong on **separate** topical sites (ideas #1 and #3), not this converters repo.

---

## How to use this folder

1. Pick a **backlog** niche with low KD + small sites on page one (see [SEO-PLAYBOOK.md](../SEO-PLAYBOOK.md)).
2. Do not clone this converters site into unrelated niches — start a dedicated topical site.
3. For converters expansions, prefer **unique format-pair pages** with real client-side capability, not thin keyword variants.
4. Update this table’s **Status** column when a new site ships or an add-on lands in this repo.
