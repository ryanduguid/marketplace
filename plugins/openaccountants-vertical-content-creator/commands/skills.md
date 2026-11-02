---
name: skills
description: List this industry pack's skill ID and discover related skills on request.
---

This industry pack lists `content-creator`. Call `get_skill({ slug: "content-creator" })` and show its returned description, jurisdiction, applicable period and review record. If it defers sections needed for the question, use the advertised `get_skill_sections` schema. Report an unavailable ID instead of substituting another industry.

If the user wants related skills, confirm their jurisdiction and topic, then use `start` with their intent and jurisdiction to discover relevant skill IDs. Explain that these are related workflow suggestions, rather than a complete industry catalogue. Check each fetched version's applicability before using it.
