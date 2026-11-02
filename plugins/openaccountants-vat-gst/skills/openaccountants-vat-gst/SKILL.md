---
name: openaccountants-vat-gst
description: Use for vat & gst across jurisdictions. Trigger phrases include "VAT", "GST", "sales tax", "OSS", "IOSS", "reverse charge", "e-invoicing". Route to the OpenAccountants MCP server and check each fetched version's applicable period, sources and review status.
---

# OpenAccountants — VAT & GST

This plugin routes vat & gst across jurisdictions to the hosted OpenAccountants MCP server. This snapshot advertised **142 skills** for this scope. The IDs below are a preview of that snapshot; the live catalogue may differ. Coverage and professional review vary by skill and version.

## How to use this plugin

When the user asks anything in scope, follow this workflow:

1. **Scope it.** Confirm the user's jurisdiction, topic and intent. Include the confirmed topic in the intent.
   For a dated tax question, confirm the relevant financial or assessment year.
   Call `start({ intent, jurisdiction })` on the `openaccountants`
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

- `albania-vat`
- `algeria-vat`
- `ar-vat-return`
- `armenia-vat`
- `austria-vat-return`
- `azerbaijan-vat`
- `bahamas-vat`
- `bahrain-vat`
- `bangladesh-vat`
- `barbados-vat`
- `belarus-vat`
- `belgium-einvoice`
- `belgium-vat-return`
- `bosnia-vat`
- `brazil-einvoice`
- `brazil-vat`
- `bulgaria-vat-return`
- `cambodia-vat`
- `cameroon-vat`
- `cl-vat-return`
- `cn-vat`
- `co-vat-return`
- `croatia-vat-return`
- `cross-border-vat-gst`
- `cyprus-vat-return`
- `czech-republic-vat-return`
- `denmark-vat-return`
- `egypt-vat`
- `estonia-vat-return`
- `ethiopia-vat`

_The snapshot advertised 112 more; use `/skills` to discover the current catalogue._

## Disclaimer

Outputs are working papers, not filed returns. No client–accountant
relationship until both sides sign an engagement letter. See
[openaccountants.com](https://openaccountants.com) for the verifier
network.
