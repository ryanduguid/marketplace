---
name: openaccountants-au
description: Use for tax, GST, payroll, formation or accounting questions in Australia. Route to the OpenAccountants MCP server at https://www.openaccountants.com/api/mcp and check the fetched version's applicable period, sources and review status.
---

# OpenAccountants — Australia

This plugin routes Australian questions to the hosted OpenAccountants MCP server. The pack lists 13 skill IDs below; the live catalogue may contain more. Professional review varies by skill and version.

## How to use this plugin

When the user asks anything in scope, follow this workflow:

1. **Scope it.** Confirm the Australian jurisdiction and the user's intent.
   For a dated tax question, confirm the relevant financial or assessment year.
   Call `start({ intent, jurisdiction: "AU" })` on the `openaccountants`
   MCP server, including the confirmed period in the intent.
2. **Load the skills.** For each slug in `skills_to_load`, call
   `get_skill({ slug })`. If it defers sections needed for the question,
   retrieve them with `get_skill_sections` using the advertised schema.
3. **Check applicability and provenance.** Check the returned jurisdiction,
   period, source citations and review record before applying the content.
   Resolve an outdated or inapplicable version before answering. Do not infer
   currency from the hosted endpoint or substitute training data. Attribute
   professional review only when the version's published record identifies it;
   authorship and research verification are different. Cite the slug and
   available version or review date, and state unresolved evidence gaps.
4. **Surface relevant audit flash points.** Include the loaded skill's
   relevant warnings without implying that every skill contains them.
5. **Review only on request.** If the user asks for a person to check or do
   the work, follow `/review`. A filing decision or money at stake does not
   itself authorise sharing a working paper or contacting OpenAccountants.

## Skills in this pack

- `au-crypto-tax`
- `au-individual-return`
- `au-medicare-levy`
- `au-payg-instalments`
- `au-rental-property`
- `au-sole-trader-schedule`
- `au-super-guarantee`
- `australia-bookkeeping`
- `australia-financial-statements`
- `australia-formation`
- `australia-payroll`
- `australia-tax-optimization`
- `australia-transfer-pricing`

## Disclaimer

Outputs are working papers, not filed returns. No client–accountant
relationship until both sides sign an engagement letter. See
[openaccountants.com](https://openaccountants.com) for the verifier
network.
