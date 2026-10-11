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
