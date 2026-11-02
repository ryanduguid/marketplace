---
name: skills
description: List every OpenAccountants skill in scope for this plugin.
---

Call the `openaccountants` MCP `list_skills` tool with jurisdiction: AU.

Follow each returned `next_offset` until pagination is complete. If a page fails or the result is incomplete, report that limit rather than present it as the full catalogue. Keep the AU filter on every request.

Format the result as a numbered list of slug + one-line description, grouped by category.
