# OpenAccountants Marketplace

**83 Claude Code plugins for tax and accounting. Coverage and professional review vary by skill and version.**

Each plugin routes to the [hosted OpenAccountants MCP server](https://www.openaccountants.com/api/mcp). The initial repository snapshot advertised **1,889 skills across 190+ jurisdictions**; the live catalogue can change. Check each fetched version's jurisdiction, applicable period, sources and published review record before applying it. Authorship or research verification does not establish professional sign-off.

---

## Install

```bash
claude plugin marketplace add openaccountants/marketplace
```

Then browse and install any plugin from the `/plugin` menu in Claude Code:

```
/plugin install openaccountants-mt          # Malta
/plugin install openaccountants-za          # South Africa
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

One per country / US state with ≥3 listed skills in the source snapshot. Topic
and year coverage vary; check the fetched records for your question.

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

Industry packs for sector-specific accounting and cross-jurisdiction tax questions. Check each fetched version's topic and period coverage.

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
│   └── review.md                 # /review — request professional review
└── README.md
```

The plugins themselves are **light** — they're routers. The actual rules, rates, and computation logic live on the hosted MCP server, which means:

- Plugin content is retrieved from the hosted service once the MCP connection loads
- Hosted content can change independently of a plugin snapshot
- Answers must preserve the fetched version's sources and published review status

---

## Request professional review

The AU, base, topical and industry packs use the currently advertised `share_with_openaccountants` schema only when you ask for a person to check or do the work. The generator emits the same workflow. Other country packs are separate snapshots. The updated command:

1. Explains that the complete working paper and contact details will be saved with OpenAccountants and its team notified, then obtains your agreement to share them
2. Sends the complete working paper, jurisdiction, scenario and supplied email, with the schema's required anonymised note
3. Presents the returned status and booking link without promising a named reviewer or a confirmed booking

The tool call is free. Professional work is paid, with scope and fee agreed before work starts. A question about whether the AI's own answer is right calls for a recheck, not a review request. An uncertain send must be resolved before any retry. See the [privacy policy](https://www.openaccountants.com/privacy).

---

## Regenerate

The marketplace is auto-generated from the [OpenAccountants source repo](https://github.com/openaccountants/openaccountants). When new skills land or jurisdictions are added:

```bash
node scripts/generate.js
```

The script reads the sibling `../openaccountants-push/packages` checkout and writes the generated files in `plugins/` and `.claude-plugin/marketplace.json`. It has no network or publication step. Record the source revision before regeneration and review membership and coverage-figure changes before applying them. Jurisdiction and topical packs below `MIN_SKILLS_PER_PLUGIN = 3` are skipped; vertical packs contain their single source skill.

The generator reads scalar `name`, `jurisdiction`, `category` and `description` frontmatter, including quoted text and folded descriptions. It reports and skips Markdown documentation without frontmatter. It rejects unterminated frontmatter, missing names, unsupported values in those fields, duplicates and empty input before writing. It retains all IDs in each generated skill list and keeps unlisted folders and maintainer files.

Run the isolated AU fixture checks and validate the generated marketplace with the installed Claude CLI:

```bash
node --check scripts/generate.js
node --test scripts/generate.test.js
claude plugin validate . --strict
```

The tests use temporary synthetic AU sources and do not regenerate this repository's catalogue. Validation reads local configuration; it does not install the plugin or exercise the hosted service.

---

## License

MIT for plugin code & manifests. Skill content is dual-licensed — see [openaccountants/openaccountants/LICENSE-ADDITIONAL.md](https://github.com/openaccountants/openaccountants/blob/main/LICENSE-ADDITIONAL.md).

## Not tax advice

Outputs are working papers, not filed returns. Seek qualified professional review where needed before filing. `/review` sends information only after your request and agreement to share it.
