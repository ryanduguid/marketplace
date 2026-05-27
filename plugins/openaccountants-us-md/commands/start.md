---
name: start
description: Front door — scope your tax question and get a ready plan with the right skills loaded.
---

The user wants to start a tax/accounting workflow.

If the user hasn't said what they want or which jurisdiction, ask them first.

Then call `openaccountants` MCP `start` with:
- intent: what they said (e.g. "VAT return", "tax filing", "formation", "find deductions")
- jurisdiction: US-MD

Walk through the returned `skills_to_load` and call `get_skill` for each. Apply the rules. Cite the skill slug. Hand off to the verifier when they're ready.
