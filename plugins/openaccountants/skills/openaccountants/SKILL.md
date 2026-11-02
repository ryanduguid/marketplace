---
name: openaccountants
description: Use for tax and accounting across jurisdictions. Trigger phrases include "tax", "accounting", "VAT", "GST", "payroll", "filing". Route to the OpenAccountants MCP server and check each fetched version's applicable period, sources and review status.
---

# OpenAccountants — Global

This plugin routes tax and accounting across jurisdictions to the hosted OpenAccountants MCP server. This snapshot advertised **50 skills** for this scope. The IDs below are a preview of that snapshot; the live catalogue may differ. Coverage and professional review vary by skill and version.

## How to use this plugin

When the user asks anything in scope, follow this workflow:

1. **Scope it.** Confirm the user's jurisdiction and intent.
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

- `amazon-seller-integration`
- `americas-corridors`
- `asia-pacific-corridors`
- `banking-sector`
- `cbam-carbon-border-adjustment`
- `charity-nonprofit`
- `construction-sector`
- `cross-border-invoicing-compliance`
- `cross-border-payroll-coordination`
- `cross-border-vat-gst`
- `cross-border-workflow-base`
- `dac6-mdr-reportable-arrangements`
- `digital-services-tax-matrix`
- `emerging-market-corridors`
- `eu-directives-cross-border`
- `eu-intra-rates`
- `eu-oss-digital`
- `eu-reverse-charge`
- `eu-social-security-coordination`
- `fatca-crs-automatic-exchange`
- `forex-controls`
- `free-zones-sez-matrix`
- `freeagent-integration`
- `ifrs-local-gaap-reconciliation`
- `inheritance-estate-gift-matrix`
- `international-incorporation`
- `ip-patent-box-matrix`
- `non-eu-export-services`
- `oecd-model-treaty-defaults`
- `paypal-integration`

_The snapshot advertised 20 more; use `/skills` to discover the current catalogue._

## Disclaimer

Outputs are working papers, not filed returns. No client–accountant
relationship until both sides sign an engagement letter. See
[openaccountants.com](https://openaccountants.com) for the verifier
network.
