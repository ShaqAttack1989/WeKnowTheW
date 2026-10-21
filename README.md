# We Know the W

A kid-friendly WNBA encyclopedia and automatically refreshed stats website.

## Live data

The live layer uses official WNBA statistics for standings and qualified player leaders, with TheSportsDB and ESPN-compatible feeds supplying schedule redundancy.

- WNBA league ID: `4516`
- Production environment variable: `THESPORTSDB_API_KEY`
- Standings come from the official WNBA standings table; the Commissioner’s Cup championship is kept out of regular-season records and remains available in its own competition view.
- Standings refresh at least every five minutes; current-season player and record tables refresh every 30 minutes.
- The site does not calculate standings from TheSportsDB's limited free development sample.

TheSportsDB should be credited as the live data source. Logos and other trademarked visual assets are not pulled into this implementation.

## Source layout and regression checks

Root files are the canonical website source. The legacy `site/` subtree contains
partial mirrors, not a standalone build. Keep existing copies synchronized with
`node scripts/sync-site-mirror.cjs --write`; CI checks parity without changing files.

Homepage story slots, weekly editorials, and headlines consume the same seven
feeds through `WHomeStories`. Published dates control eligibility; the most recent
non-future publication/update controls order. Feed failures preserve the last
successful snapshot during the visit.

Coach portraits are explicitly reviewed in `coach-photos.js`, including spelling
aliases, source credits, and backup photographs. Do not restore automatic person
name searches or article-preview fallbacks for coaches.

Run `node --test tests/site-repairs.test.js tests/homepage-fresh-stories.test.js
 tests/navigation-smoke.test.js` for focused checks. With Playwright and Chromium
installed, run `node scripts/verify-site-regressions.cjs` for rendered browser checks.
