---
name: start
description: Front door — scope your tax question and get a ready plan with the right skills loaded.
---

The user wants to start a tax/accounting workflow.

Confirm that the question concerns Australia and what the user wants. For a dated tax question, confirm the financial or assessment year.

Then call `openaccountants` MCP `start` with:
- intent: what they said, including the confirmed period when relevant
- jurisdiction: AU

Load each exact slug in `skills_to_load`. Retrieve any deferred sections needed for the question using the advertised `get_skill_sections` schema. Check the fetched version's jurisdiction, applicable period, sources and published review record before applying it. Cite the slug and available version or review date. Describe professional review as unconfirmed when the record does not identify it. Use `/review` only when the user asks for a person to check or do the work and agrees to share the specified information.
