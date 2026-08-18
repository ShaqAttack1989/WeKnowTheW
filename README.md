# We Know the W

A kid-friendly WNBA encyclopedia and automatically refreshed stats website.

## Live data

The live layer uses TheSportsDB official API, not a WNBA-owned API and not BALLDONTLIE.

- WNBA league ID: `4516`
- Production environment variable: `THESPORTSDB_API_KEY`
- Standings are calculated from completed regular-season game results.
- Live responses are cached for 15 minutes.
- The site does not calculate standings from TheSportsDB's limited free development sample.

TheSportsDB should be credited as the live data source. Logos and other trademarked visual assets are not pulled into this implementation.
