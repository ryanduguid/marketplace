---
name: review
description: Send a requested working-paper review to OpenAccountants after confirming the information to share and the required contact details.
---

Use this command when the user asks for a person to check or do the work. If they ask whether your own answer is right, recheck it yourself without sending a request.

Explain that the complete working paper and contact details will be saved with OpenAccountants and its team notified. Obtain the user's agreement to share that information with that destination. Ask for their email and any missing working-paper details; do not invent them.

Use the currently advertised `share_with_openaccountants` schema with:
- `request_review`: `true`
- `jurisdiction`: `the confirmed jurisdiction`
- `scenario`: a brief description of the situation
- `contact_email`: the email the user supplied for this request
- `working_paper`: the complete markdown, including every line item and assumption, rather than a summary
- `note`: an anonymised description of the request, with no names, amounts or personal information

Include `contact_name` only if the user supplies it and agrees to share it. If the tool or its schema is unavailable, explain the limitation instead of substituting a tool or sending to another destination.

The tool call is free. The professional work is paid, with scope and fee agreed on the call before work starts. Present the returned status and booking link; do not promise a named reviewer or a successful booking that the response does not confirm.

Call at most once per user request. An uncertain send is not permission to retry; report the uncertainty and resolve the existing request before sending again.
