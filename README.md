# OpenAccountants Marketplace

Claude Code plugins that route tax and accounting questions to OpenAccountants skills via MCP.

Skills include accountant-reviewed versions and source-cited drafts. Check the [current catalogue](https://www.openaccountants.com/skills) and [review method](https://www.openaccountants.com/review-method) for each skill's review status, reviewer, version and review date. Authorship or a jurisdiction lead's name does not establish professional review of every skill version.

One install command adds the marketplace. Each plugin routes to the [hosted OpenAccountants MCP server](https://www.openaccountants.com/api/mcp); the available skills and their review status are published in the current catalogue. Use the `/review` command to request a professional review.

---

## Install

```bash
claude plugin marketplace add openaccountants/marketplace
```

Then browse and install any plugin from the `/plugin` menu in Claude Code:

```
/plugin install openaccountants-mt          # Malta; check each skill's review status
/plugin install openaccountants-za          # South Africa; check each skill's review status
/plugin install openaccountants-us-ca       # California
/plugin install openaccountants-crypto-tax  # Crypto, cross-jurisdiction
…
```

Or just install the base plugin and let it route everything:

```
/plugin install openaccountants
```

For **non-Claude-Code installs** (Claude.ai, ChatGPT, Cursor, Windsurf), see [openaccountants.com/connect](https://openaccountants.com/connect).

---

## What's in here

### Jurisdiction plugins (60)

Jurisdiction plugins scope the available skills by country or US state. Coverage and professional review vary by skill; check the current catalogue for the topic you need.

Examples: `openaccountants-mt` · `openaccountants-de` · `openaccountants-us-ca` · `openaccountants-gb` · `openaccountants-jp` · `openaccountants-in` · `openaccountants-br` · `openaccountants-za` · `openaccountants-sg` · …

### Topical plugins (8)

Cross-jurisdiction packs for users whose question is a *topic*, not a country.

- `openaccountants-crypto-tax` — crypto across jurisdictions
- `openaccountants-transfer-pricing` — TP documentation, CbCR
- `openaccountants-company-formation` — entity choice, incorporation
- `openaccountants-payroll` — employer obligations
- `openaccountants-vat-gst` — VAT, GST, sales tax, e-invoicing
- `openaccountants-tax-optimization` — planning, residency, R&D
- `openaccountants-bookkeeping` — classification, statements
- `openaccountants-cross-border` — treaty, PE, GILTI, Pillar Two, DAC6

### Vertical plugins (14)

Industry-specific. Each covers the sector-specific accounting + cross-jurisdiction tax issues for that business type.

`saas-digital-products` · `ecommerce-seller` · `freelance-developer` · `content-creator` · `consultant-professional` · `property-investor` · `medical-professional` · `construction-sector` · `banking-sector` · `insurance-sector` · `investment-funds-reits` · `oil-gas-extractives` · `shipping-aviation-tonnage-tax` · `charity-nonprofit`

### Base plugin (1)

`openaccountants` — global, routes everything to the MCP. Install this if you don't know what you need.

---

## How each plugin works

Every plugin is the same shape:

```
plugins/<slug>/
├── .claude-plugin/plugin.json    # plugin manifest
├── .mcp.json                     # routes to openaccountants.com/api/mcp
├── skills/<slug>/SKILL.md        # auto-invoke trigger
├── commands/                     # 3 slash commands per plugin
│   ├── start.md                  # /start — scope your question
│   ├── skills.md                 # /skills — list everything in scope
│   └── review.md                 # /review — book a real accountant
└── README.md
```

The plugins themselves are **light** — they're routers. The actual rules, rates, and computation logic live on the hosted MCP server, which means:

- One source of truth across 83 plugins
- Annual rate refreshes propagate instantly to every plugin
- Inspect the fetched skill's review record for its current version

---

## The handoff is the differentiator

Every plugin includes the `/review` slash command, which calls the MCP's `request_accountant_review` tool. When you're ready to file, the AI:

1. Captures your working paper (classified transactions, computations)
2. Routes the request to the **named lead verifier** for your jurisdiction (e.g. Werner Britz CA(SA) for South Africa, Michael Cutajar CPA for Malta)
3. Returns a Calendly link the user can book directly

The verifier sees the scenario + the worksheet **before the call**. No client-accountant relationship until both sides sign an engagement letter.

---

## Regenerate

The marketplace is auto-generated from the [OpenAccountants source repo](https://github.com/openaccountants/openaccountants). When new skills land or jurisdictions are added:

```bash
node scripts/generate.js
```

This rebuilds the plugin folders + `marketplace.json` from the current skill catalogue. Plugins below the minimum skill threshold (`MIN_SKILLS_PER_PLUGIN = 3`) are skipped.

---

## Licence

MIT for this plugin wrapper. Skill content has separate terms from this wrapper. The source repository's [licensing document](https://github.com/openaccountants/openaccountants/blob/main/LICENSING.md) describes the source-available Open Accountants Skills License, commercial options, third-party copyleft exceptions and prior AGPL releases. Check the terms for the skill version you use.

## Not tax advice

Outputs are working papers, not filed returns. Use the `/review` command to route to a credentialed accountant before acting on anything.
