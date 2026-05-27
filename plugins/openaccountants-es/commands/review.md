---
name: review
description: Request a licensed accountant to review your working paper. Routes you to the named lead verifier with a Calendly booking link.
---

The user wants a licensed accountant to review their tax situation.

Call the `openaccountants` MCP `request_accountant_review` tool with:
- jurisdiction: ES
- scenario: a 1-2 sentence summary of the user's situation
- working_paper: if you have produced a worksheet, classified transactions, or computation in this conversation, paste it in full as markdown — the verifier needs to see the numbers, not just a text brief
- contact_email + contact_name: ask the user

Then present the returned accountant name and Calendly URL to the user.
