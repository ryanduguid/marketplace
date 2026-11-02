#!/usr/bin/env node
/**
 * Generator for openaccountants-marketplace.
 *
 * Reads all skill .md files from the OpenAccountants source repo
 * (../openaccountants-push/packages) and emits a marketplace.json + one
 * plugin folder per:
 *  - Jurisdiction (e.g. malta, germany, us-ca) — if it has >= 3 skills
 *  - Topical category (crypto, transfer-pricing, formation, payroll, …) —
 *    aggregated across jurisdictions
 *  - Vertical (saas, ecommerce, freelance-developer, …) — already grouped
 *    in source/packages/_verticals/
 *
 * Each plugin is a LIGHT router: a .mcp.json pointing at our hosted MCP,
 * a tiny SKILL.md that tells Claude when to invoke it, scoped slash
 * commands, and a README. The actual rule content stays on the MCP
 * server — plugins don't bundle skill bodies (one source of truth,
 * without copying skill bodies into plugins).
 */

const fs = require("fs");
const path = require("path");

const SOURCE_DIR = path.resolve(__dirname, "..", "..", "openaccountants-push", "packages");
const OUT_DIR = path.resolve(__dirname, "..", "plugins");
const MARKETPLACE_PATH = path.resolve(__dirname, "..", ".claude-plugin", "marketplace.json");
const MCP_URL = "https://www.openaccountants.com/api/mcp";
const MIN_SKILLS_PER_PLUGIN = 3;

// Minimal jurisdiction code → label map (extend as needed).
const JURISDICTION_LABEL = {
  AD: "Andorra", AE: "United Arab Emirates", AL: "Albania", AR: "Argentina",
  AT: "Austria", AU: "Australia", AZ: "Azerbaijan", BA: "Bosnia & Herzegovina",
  BD: "Bangladesh", BE: "Belgium", BG: "Bulgaria", BH: "Bahrain",
  BM: "Bermuda", BO: "Bolivia", BR: "Brazil", BS: "Bahamas",
  BW: "Botswana", BY: "Belarus", CA: "Canada", CH: "Switzerland",
  CL: "Chile", CM: "Cameroon", CN: "China", CO: "Colombia",
  CR: "Costa Rica", CY: "Cyprus", CZ: "Czechia", DE: "Germany",
  DK: "Denmark", DO: "Dominican Republic", DZ: "Algeria", EC: "Ecuador",
  EE: "Estonia", EG: "Egypt", ES: "Spain", ET: "Ethiopia",
  FI: "Finland", FR: "France", GB: "United Kingdom", GE: "Georgia",
  GG: "Guernsey", GH: "Ghana", GI: "Gibraltar", GR: "Greece",
  GT: "Guatemala", HK: "Hong Kong", HN: "Honduras", HR: "Croatia",
  HU: "Hungary", ID: "Indonesia", IE: "Ireland", IL: "Israel",
  IM: "Isle of Man", IN: "India", IQ: "Iraq", IS: "Iceland",
  IT: "Italy", JE: "Jersey", JM: "Jamaica", JO: "Jordan",
  JP: "Japan", KE: "Kenya", KG: "Kyrgyzstan", KH: "Cambodia",
  KR: "South Korea", KW: "Kuwait", KY: "Cayman Islands", KZ: "Kazakhstan",
  LB: "Lebanon", LI: "Liechtenstein", LK: "Sri Lanka", LT: "Lithuania",
  LU: "Luxembourg", LV: "Latvia", LY: "Libya", MA: "Morocco",
  MC: "Monaco", MD: "Moldova", ME: "Montenegro", MK: "North Macedonia",
  MN: "Mongolia", MO: "Macau", MT: "Malta", MU: "Mauritius",
  MV: "Maldives", MX: "Mexico", MY: "Malaysia", NA: "Namibia",
  NG: "Nigeria", NI: "Nicaragua", NL: "Netherlands", NO: "Norway",
  NP: "Nepal", NZ: "New Zealand", OM: "Oman", PA: "Panama",
  PE: "Peru", PH: "Philippines", PK: "Pakistan", PL: "Poland",
  PR: "Puerto Rico", PT: "Portugal", PY: "Paraguay", QA: "Qatar",
  RO: "Romania", RS: "Serbia", RU: "Russia", RW: "Rwanda",
  SA: "Saudi Arabia", SB: "Solomon Islands", SC: "Seychelles", SD: "Sudan",
  SE: "Sweden", SG: "Singapore", SI: "Slovenia", SK: "Slovakia",
  SM: "San Marino", SN: "Senegal", SR: "Suriname", SV: "El Salvador",
  TH: "Thailand", TJ: "Tajikistan", TM: "Turkmenistan", TN: "Tunisia",
  TR: "Turkey", TT: "Trinidad & Tobago", TW: "Taiwan", TZ: "Tanzania",
  UA: "Ukraine", UG: "Uganda", US: "United States", UY: "Uruguay",
  UZ: "Uzbekistan", VE: "Venezuela", VG: "British Virgin Islands",
  VN: "Vietnam", XK: "Kosovo", YE: "Yemen", ZA: "South Africa",
  ZM: "Zambia", ZW: "Zimbabwe",
  // US states
  "US-AL": "Alabama", "US-AK": "Alaska", "US-AZ": "Arizona", "US-AR": "Arkansas",
  "US-CA": "California", "US-CO": "Colorado", "US-CT": "Connecticut",
  "US-DE": "Delaware", "US-FL": "Florida", "US-GA": "Georgia (US)",
  "US-HI": "Hawaii", "US-ID": "Idaho", "US-IL": "Illinois", "US-IN": "Indiana",
  "US-IA": "Iowa", "US-KS": "Kansas", "US-KY": "Kentucky", "US-LA": "Louisiana",
  "US-ME": "Maine", "US-MD": "Maryland", "US-MA": "Massachusetts",
  "US-MI": "Michigan", "US-MN": "Minnesota", "US-MS": "Mississippi",
  "US-MO": "Missouri", "US-MT": "Montana", "US-NE": "Nebraska", "US-NV": "Nevada",
  "US-NH": "New Hampshire", "US-NJ": "New Jersey", "US-NM": "New Mexico",
  "US-NY": "New York", "US-NC": "North Carolina", "US-ND": "North Dakota",
  "US-OH": "Ohio", "US-OK": "Oklahoma", "US-OR": "Oregon", "US-PA": "Pennsylvania",
  "US-RI": "Rhode Island", "US-SC": "South Carolina", "US-SD": "South Dakota",
  "US-TN": "Tennessee", "US-TX": "Texas", "US-UT": "Utah", "US-VT": "Vermont",
  "US-VA": "Virginia", "US-WA": "Washington", "US-WV": "West Virginia",
  "US-WI": "Wisconsin", "US-WY": "Wyoming", "US-DC": "Washington DC",
  "US-PR": "Puerto Rico (US)",
  // Canadian provinces (CA + sub-region — but we treat full CA as one)
  // Cross-cutting / global
  GLOBAL: "Global (cross-border)",
  INTL: "International",
  EU: "European Union",
};

// Cross-cutting topical category → slug + label + description.
const TOPICAL_PLUGINS = {
  crypto: {
    slug: "crypto-tax",
    label: "Crypto Tax",
    description:
      "Crypto and digital-asset taxation across jurisdictions: disposals, mining, staking, airdrops, NFT royalties and DeFi. Check each fetched version's sources and review record.",
    keywords: ["crypto", "bitcoin", "ethereum", "nft", "staking", "defi", "digital asset"],
  },
  "transfer-pricing": {
    slug: "transfer-pricing",
    label: "Transfer Pricing",
    description:
      "OECD-aligned transfer pricing rules — master file, local file, CbCR, intercompany loans, IP licensing, services. Covers documentation thresholds, methods, and audit defence across jurisdictions.",
    keywords: ["transfer pricing", "master file", "local file", "CbCR", "intercompany", "OECD"],
  },
  formation: {
    slug: "company-formation",
    label: "Company Formation",
    description:
      "Entity choice and incorporation across jurisdictions — sole prop vs LLC vs LTD vs S-corp vs C-corp, incorporation costs, ongoing compliance, tax election windows.",
    keywords: ["incorporation", "LLC", "S-corp", "C-corp", "LTD", "entity choice", "formation"],
  },
  payroll: {
    slug: "payroll",
    label: "Payroll & Employer Taxes",
    description:
      "Employer payroll obligations across jurisdictions — withholding, social contributions, year-end reporting, employee vs contractor classification.",
    keywords: ["payroll", "withholding", "PAYE", "FICA", "social security", "employer"],
  },
  vat: {
    slug: "vat-gst",
    label: "VAT & GST",
    description:
      "VAT, GST, sales tax, and e-invoicing across jurisdictions — registration thresholds, reverse charge, OSS/IOSS, place of supply, real-time e-reporting.",
    keywords: ["VAT", "GST", "sales tax", "OSS", "IOSS", "reverse charge", "e-invoicing"],
  },
  "tax-optimization": {
    slug: "tax-optimization",
    label: "Tax Optimization & Planning",
    description:
      "Planning strategies — residency choice, IP holdings, R&D credits, patent boxes, restructuring, year-end positioning. Covers the legitimate end of optimisation; flags the audit-flash-point edge cases.",
    keywords: ["tax planning", "optimization", "residency", "R&D credit", "patent box"],
  },
  bookkeeping: {
    slug: "bookkeeping",
    label: "Bookkeeping & Financial Statements",
    description:
      "Transaction classification, chart of accounts, year-end financial statements (IFRS/local GAAP), bank reconciliation — across jurisdictions and entity types.",
    keywords: ["bookkeeping", "chart of accounts", "financial statements", "IFRS", "reconciliation"],
  },
  "cross-border": {
    slug: "cross-border",
    label: "Cross-Border & International Tax",
    description:
      "Treaty positions, permanent establishment, GILTI, FDII, BEAT, Pillar Two, DAC6, FATCA/CRS, CBAM — for any business operating across borders.",
    keywords: ["cross-border", "treaty", "GILTI", "Pillar Two", "DAC6", "FATCA", "CRS", "CBAM"],
  },
};

// ---------------------------------------------------------------------------
// Frontmatter parser (no YAML dependency)
// ---------------------------------------------------------------------------

function scalar(raw, source) {
  const value = raw.trim();
  if (!value || value === "null" || value === "~") return null;
  if (value.startsWith('"')) {
    const quoted = value.match(/^"(?:[^"\\]|\\.)*"(?=\s*(?:#|$))/)?.[0];
    if (!quoted) throw new Error(`${source}: unsupported quoted metadata`);
    return JSON.parse(quoted);
  }
  if (value.startsWith("'")) {
    const quoted = value.match(/^'((?:[^']|'')*)'\s*(?:#.*)?$/);
    if (!quoted) throw new Error(`${source}: unsupported quoted metadata`);
    return quoted[1].replace(/''/g, "'");
  }
  const plain = value.replace(/\s+#.*$/, "").trim();
  if (/^[\[\]{&*!|>%@`]/.test(plain) || /:\s/.test(plain) || /^(?:true|false|[-+]?\d+(?:\.\d+)?)$/i.test(plain)) {
    throw new Error(`${source}: expected scalar text metadata, got ${plain}`);
  }
  return plain;
}

// Read only the scalar fields generation uses. Reject unsupported syntax in
// those fields rather than treating YAML collections or quoted codes as IDs.
function parseFrontmatter(content, source) {
  const lines = content.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n");
  if (lines[0] !== "---") return null; // Package documentation is not a skill.
  const end = lines.indexOf("---", 1);
  if (end < 0) throw new Error(`${source}: unterminated frontmatter`);
  const meta = Object.create(null);
  const keys = new Set();
  const used = new Set(["name", "jurisdiction", "category", "description"]);
  let currentKey;
  for (let index = 1; index < end; index++) {
    const line = lines[index];
    if (!line.trim() || /^\s*#/.test(line)) continue;
    if (/^\s/.test(line)) {
      if (used.has(currentKey)) throw new Error(`${source}: unsupported continuation for ${currentKey}`);
      continue;
    }
    const field = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*):(?:\s+(.*))?$/);
    if (!field) throw new Error(`${source}: unsupported frontmatter line ${index + 1}`);
    const [, key, raw = ""] = field;
    if (keys.has(key)) throw new Error(`${source}: duplicate frontmatter key ${key}`);
    keys.add(key);
    currentKey = key;
    if (!used.has(key)) continue;
    if (/^[>|][+-]?(?:\s+#.*)?$/.test(raw)) {
      if (key !== "description") throw new Error(`${source}: ${key} must be scalar text`);
      const parts = [];
      while (index + 1 < end && (!lines[index + 1].trim() || /^\s/.test(lines[index + 1]))) {
        parts.push(lines[++index].trim());
      }
      meta[key] = parts.join(" ").replace(/\s+/g, " ").trim();
    } else {
      meta[key] = scalar(raw, `${source}:${key}`);
    }
  }
  if (!meta.name || !/^[a-z0-9][a-z0-9_-]*$/.test(meta.name)) {
    throw new Error(`${source}: invalid or missing skill name`);
  }
  if (meta.jurisdiction && !/^(?:[A-Z]{2}(?:-[A-Z0-9]+)?|GLOBAL|INTL)$/.test(meta.jurisdiction)) {
    throw new Error(`${source}: invalid jurisdiction ${meta.jurisdiction}`);
  }
  return { meta };
}

function compare(a, b) { return a < b ? -1 : a > b ? 1 : 0; }

// ---------------------------------------------------------------------------
// Read all skills
// ---------------------------------------------------------------------------

function readAllSkills() {
  const skills = [];
  const seen = new Map();
  const dirs = fs.readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name).sort(compare);

  for (const dir of dirs) {
    const dirPath = path.join(SOURCE_DIR, dir);
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md") && f !== "README.md").sort(compare);
    for (const file of files) {
      const full = path.join(dirPath, file);
      const content = fs.readFileSync(full, "utf8");
      const record = parseFrontmatter(content, full);
      if (!record) {
        console.warn(`Skipping documentation without frontmatter: ${full}`);
        continue;
      }
      const { meta } = record;
      if (seen.has(meta.name)) throw new Error(`Duplicate skill slug ${meta.name}: ${seen.get(meta.name)} and ${full}`);
      seen.set(meta.name, full);
      skills.push({
        sourceDir: dir,
        slug: meta.name,
        jurisdiction: meta.jurisdiction || null,
        category: meta.category || null,
        description: (meta.description || "").replace(/\s+/g, " "),
      });
    }
  }
  if (!skills.length) throw new Error(`No skills found in ${SOURCE_DIR}`);
  return skills.sort((a, b) => compare(a.slug, b.slug));
}

// ---------------------------------------------------------------------------
// Plugin emitters
// ---------------------------------------------------------------------------

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function writeJSON(p, obj) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

function writeFile(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content);
}

function emitPlugin({
  slug,
  name,
  description,
  scope,           // { kind: "jurisdiction", code: "MT" } | { kind: "topical", category: "crypto" } | { kind: "vertical", id: "saas" }
  skills,
  version = "1.0.0",
}) {
  const pluginDir = path.join(OUT_DIR, slug);
  ensureDir(pluginDir);

  // .claude-plugin/plugin.json
  writeJSON(path.join(pluginDir, ".claude-plugin", "plugin.json"), {
    name: slug,
    version,
    description,
    author: { name: "OpenAccountants", url: "https://openaccountants.com" },
    homepage: `https://openaccountants.com/connect`,
    privacyPolicyUrl: "https://www.openaccountants.com/privacy",
    repository: "https://github.com/openaccountants/marketplace",
    license: "MIT",
    keywords: ["tax", "accounting", "openaccountants", "mcp"],
  });

  // .mcp.json — every plugin shares the same hosted MCP backend
  writeJSON(path.join(pluginDir, ".mcp.json"), {
    mcpServers: {
      openaccountants: { type: "http", url: MCP_URL },
    },
  });

  // skills/<slug>/SKILL.md — auto-invoke router
  const country = JURISDICTION_LABEL[scope.code] || scope.code;
  const scopeText = scope.kind === "jurisdiction"
    ? `tax, GST, payroll, formation or accounting questions in ${country}`
    : scope.kind === "topical"
    ? `${TOPICAL_PLUGINS[scope.category].label.toLowerCase()} questions across jurisdictions`
    : scope.kind === "vertical"
    ? `tax and accounting questions for ${scope.id.replace(/-/g, " ")} businesses`
    : "tax and accounting questions across jurisdictions";
  const routingSubject = scope.kind === "jurisdiction"
    ? `${scope.code === "AU" ? "Australian" : country} questions`
    : scopeText;
  const jurisdictionCall = scope.kind === "jurisdiction" ? `jurisdiction: "${scope.code}"` : "jurisdiction";
  const scopeStep = scope.kind === "jurisdiction"
    ? `Confirm the ${scope.code === "AU" ? "Australian" : country} jurisdiction and the user's intent.`
    : scope.kind === "vertical"
    ? `Confirm the user's jurisdiction, industry and intent. Include the confirmed industry in the intent.`
    : scope.kind === "topical"
    ? `Confirm the user's jurisdiction, topic and intent. Include the confirmed topic in the intent.`
    : "Confirm the user's jurisdiction and intent.";
  const skillListMarkdown = skills.map((s) => `- \`${s.slug}\``).join("\n");
  const triggerHint = scope.kind === "topical"
    ? ` Topics include ${TOPICAL_PLUGINS[scope.category].keywords.join(", ")}.`
    : "";

  const skillMd = `---
name: ${slug}
description: Use for ${scopeText}. Route to the OpenAccountants MCP server at ${MCP_URL} and check the fetched version's applicable period, sources and review status.${triggerHint}
---

# ${name}

This plugin routes ${routingSubject} to the hosted OpenAccountants MCP server. The pack lists ${skills.length} skill IDs below; the live catalogue may contain more. Professional review varies by skill and version.

## How to use this plugin

When the user asks anything in scope, follow this workflow:

1. **Scope it.** ${scopeStep}
   For a dated tax question, confirm the relevant financial or assessment year.
   Call \`start({ intent, ${jurisdictionCall} })\` on the \`openaccountants\`
   MCP server, including the confirmed period in the intent.
2. **Load the skills.** For each slug in \`skills_to_load\`, call
   \`get_skill({ slug })\`. If it defers sections needed for the question,
   retrieve them with \`get_skill_sections\` using the advertised schema.
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
   the work, follow \`/review\`. A filing decision or money at stake does not
   itself authorise sharing a working paper or contacting OpenAccountants.

## Skills in this pack

${skillListMarkdown}

## Disclaimer

Outputs are working papers, not filed returns. No client–accountant
relationship until both sides sign an engagement letter. See
[openaccountants.com](https://openaccountants.com) for the verifier
network.
`;
  writeFile(path.join(pluginDir, "skills", slug, "SKILL.md"), skillMd);

  // commands/ — three universal slash commands per plugin
  emitCommands(pluginDir, scope);

  // README.md
  emitReadme(pluginDir, { slug, name, description, scope, skills });

}

function emitCommands(pluginDir, scope) {
  const cmdDir = path.join(pluginDir, "commands");

  const jurisdictionArg = scope.kind === "jurisdiction" ? scope.code : "the confirmed jurisdiction";
  const country = JURISDICTION_LABEL[scope.code] || scope.code;
  const confirmation = scope.kind === "jurisdiction"
    ? `Confirm that the question concerns ${country} and what the user wants.`
    : scope.kind === "vertical"
    ? `Confirm the user's jurisdiction, industry and what they want. Include the confirmed industry in the intent.`
    : scope.kind === "topical"
    ? `Confirm the user's jurisdiction, topic and what they want. Include the confirmed topic in the intent.`
    : "Confirm the user's jurisdiction and what they want.";
  const listing = scope.kind === "jurisdiction"
    ? ` with jurisdiction: ${scope.code}`
    : scope.kind === "topical"
    ? ` with domain: ${scope.category === "vat" ? "vat-gst" : scope.category}, retaining any jurisdiction filter the user requested`
    : " with any jurisdiction or domain filters the user requested; explain which filters you used and that the live catalogue is not limited to this pack's listed IDs";
  const retainFilters = scope.kind === "jurisdiction" ? `Keep the ${scope.code} filter` : "Keep the same filters";
  const listDescription = scope.kind === "vertical"
    ? "List this industry pack's skill ID and discover related skills on request."
    : "List every OpenAccountants skill in scope for this plugin.";
  const listingInstructions = scope.kind === "vertical"
    ? `This industry pack lists \`${scope.id}\`. Call \`get_skill({ slug: "${scope.id}" })\` and show its returned description, jurisdiction, applicable period and review record. If it defers sections needed for the question, use the advertised \`get_skill_sections\` schema. Report an unavailable ID instead of substituting another industry.

If the user wants related skills, confirm their jurisdiction and topic, then use \`start\` with their intent and jurisdiction to discover relevant skill IDs. Explain that these are related workflow suggestions, rather than a complete industry catalogue. Check each fetched version's applicability before using it.`
    : `Call the \`openaccountants\` MCP \`list_skills\` tool${listing}.

Follow each returned \`next_offset\` until pagination is complete. If a page fails or the result is incomplete, report that limit rather than present it as the full catalogue. ${retainFilters} on every request.

Format the result as a numbered list of slug + one-line description, grouped by category.`;

  writeFile(path.join(cmdDir, "review.md"),
`---
name: review
description: Send a requested working-paper review to OpenAccountants after confirming the information to share and the required contact details.
---

Use this command when the user asks for a person to check or do the work. If they ask whether your own answer is right, recheck it yourself without sending a request.

Explain that the complete working paper and contact details will be saved with OpenAccountants and its team notified. Obtain the user's agreement to share that information with that destination. Ask for their email and any missing working-paper details; do not invent them.

Use the currently advertised \`share_with_openaccountants\` schema with:
- \`request_review\`: \`true\`
- \`jurisdiction\`: \`${jurisdictionArg}\`
- \`scenario\`: a brief description of the situation
- \`contact_email\`: the email the user supplied for this request
- \`working_paper\`: the complete markdown, including every line item and assumption, rather than a summary
- \`note\`: an anonymised description of the request, with no names, amounts or personal information

Include \`contact_name\` only if the user supplies it and agrees to share it. If the tool or its schema is unavailable, explain the limitation instead of substituting a tool or sending to another destination.

The tool call is free. The professional work is paid, with scope and fee agreed on the call before work starts. Present the returned status and booking link; do not promise a named reviewer or a successful booking that the response does not confirm.

Call at most once per user request. An uncertain send is not permission to retry; report the uncertainty and resolve the existing request before sending again.
`);

  writeFile(path.join(cmdDir, "skills.md"),
`---
name: skills
description: ${listDescription}
---

${listingInstructions}
`);

  writeFile(path.join(cmdDir, "start.md"),
`---
name: start
description: Front door — scope your tax question and get a ready plan with the right skills loaded.
---

The user wants to start a tax/accounting workflow.

${confirmation} For a dated tax question, confirm the financial or assessment year.

Then call \`openaccountants\` MCP \`start\` with:
- intent: what they said, including the confirmed period when relevant
- jurisdiction: ${jurisdictionArg}

Load each exact slug in \`skills_to_load\`. Retrieve any deferred sections needed for the question using the advertised \`get_skill_sections\` schema. Check the fetched version's jurisdiction, applicable period, sources and published review record before applying it. Cite the slug and available version or review date. Describe professional review as unconfirmed when the record does not identify it. Use \`/review\` only when the user asks for a person to check or do the work and agrees to share the specified information.
`);
}

function emitReadme(pluginDir, { slug, name, description, scope, skills }) {
  const codeBlock = '```';
  const topSkills = skills.slice(0, 12).map((s) => `- \`${s.slug}\``).join("\n");
  const summary = scope.kind === "jurisdiction"
    ? `Tax and accounting skills for ${JURISDICTION_LABEL[scope.code] || scope.code} via the OpenAccountants MCP server.`
    : description;

  writeFile(path.join(pluginDir, "README.md"),
`# ${name}

${summary}

This pack lists ${skills.length} skill IDs. The live catalogue may contain more. Check each fetched version's jurisdiction, applicable period, sources and published review record; authorship or research verification does not establish professional sign-off.

## Install

${codeBlock}bash
claude plugin install ${slug} --marketplace openaccountants/marketplace
${codeBlock}

Or browse the full marketplace:

${codeBlock}bash
claude plugin marketplace add openaccountants/marketplace
${codeBlock}

## Slash commands

- \`/start\` — scope a workflow and load the right skills
- \`/skills\` — list every skill in scope
- \`/review\` — request a licensed accountant to review your work

\`/review\` sends a request only after you agree to share the complete working paper and contact details with OpenAccountants. The tool call is free; professional work is paid, with scope and fee agreed before work starts.

## Skills in this pack

${topSkills}${skills.length > 12 ? `\n\n_…and ${skills.length - 12} more — run \`/skills\` after installing._` : ""}

## License

MIT for code; skill content is dual-licensed (see [LICENSE-ADDITIONAL.md](https://github.com/openaccountants/openaccountants/blob/main/LICENSE-ADDITIONAL.md)).

## Not tax advice

Outputs are working papers, not filed returns. Have a qualified
professional review before filing. See
[openaccountants.com/connect](https://openaccountants.com/connect).
`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log("Reading skills from", SOURCE_DIR);
  const skills = readAllSkills();
  console.log(`Found ${skills.length} skills`);

  // Validate the complete plan before writing. Unlisted folders and maintainer
  // files are retained; generation does not authorise their removal.
  const generated = [];

  // ---- Axis 1: per-jurisdiction plugins ----
  const byJurisdiction = new Map();
  for (const s of skills) {
    if (!s.jurisdiction) continue;
    const j = s.jurisdiction;
    if (!byJurisdiction.has(j)) byJurisdiction.set(j, []);
    byJurisdiction.get(j).push(s);
  }
  for (const [code, set] of [...byJurisdiction].sort(([a], [b]) => compare(a, b))) {
    if (set.length < MIN_SKILLS_PER_PLUGIN) continue;
    if (["GLOBAL", "INTL", "EU"].includes(code)) continue; // handled by topical
    const label = JURISDICTION_LABEL[code] || code;
    const slug = "openaccountants-" + code.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const description =
      `Tax and accounting skills for ${label} via the OpenAccountants MCP server. ` +
      `This pack lists ${set.length} skill IDs; coverage and professional review vary by skill and version.`;
    generated.push({
      slug,
      name: `OpenAccountants — ${label}`,
      description,
      scope: { kind: "jurisdiction", code },
      skills: set,
      label,
      kind: "jurisdiction",
    });
  }

  // ---- Axis 2: topical cross-cutting plugins ----
  for (const [cat, def] of Object.entries(TOPICAL_PLUGINS)) {
    const set = skills.filter((s) =>
      s.category === cat ||
      (cat === "vat" && (s.category === "invoicing" || (s.slug || "").includes("vat"))) ||
      (cat === "cross-border" && s.category === "cross-border")
    );
    if (set.length < MIN_SKILLS_PER_PLUGIN) continue;
    const slug = "openaccountants-" + def.slug;
    generated.push({
      slug,
      name: `OpenAccountants — ${def.label}`,
      description: def.description,
      scope: { kind: "topical", category: cat },
      skills: set,
      label: def.label,
      kind: "topical",
    });
  }

  // ---- Axis 3: vertical plugins (industry packs) ----
  for (const skill of skills.filter((skill) => skill.sourceDir === "_verticals")) {
    const slug = "openaccountants-vertical-" + skill.slug.replace(/_/g, "-");
    const label = skill.slug
      .split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
    const description = skill.description || `Tax and accounting for ${label} businesses.`;
    generated.push({
      slug,
      name: `OpenAccountants — ${label} (vertical)`,
      description,
      scope: { kind: "vertical", id: skill.slug },
      skills: [skill],
      label,
      kind: "vertical",
    });
  }

  // ---- The "base" plugin — global, everything ----
  const base = {
    slug: "openaccountants",
    name: "OpenAccountants — Global",
    description:
      "Tax and accounting skills across jurisdictions via the OpenAccountants MCP server. Check each fetched version's applicable period, sources and published review record.",
    scope: { kind: "global" },
    skills,
  };
  const names = new Set();
  for (const plan of [base, ...generated]) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(plan.slug) || names.has(plan.slug)) {
      throw new Error(`Invalid or duplicate plugin slug ${plan.slug}`);
    }
    names.add(plan.slug);
  }
  for (const plan of [base, ...generated]) emitPlugin(plan);

  // ---- marketplace.json ----
  const marketplace = {
    name: "OpenAccountants",
    metadata: {
      description: "Tax and accounting plugins via the OpenAccountants MCP server. Coverage and professional review vary by skill and version; check each fetched record.",
    },
    owner: {
      name: "OpenAccountants",
      url: "https://openaccountants.com",
      email: "hello@openaccountants.com",
    },
    plugins: [
      {
        name: "openaccountants",
        source: "./plugins/openaccountants",
        description: "Tax and accounting skills across jurisdictions; check each fetched version's sources and review record.",
        category: "tax-accounting",
      },
      ...generated.map((g) => ({
        name: g.slug,
        source: `./plugins/${g.slug}`,
        description: `OpenAccountants ${g.label}. ${g.skills.length} skill(s).`,
        category: "tax-accounting",
      })),
    ],
  };
  writeJSON(MARKETPLACE_PATH, marketplace);

  // Summary
  console.log(`\n✓ Generated ${marketplace.plugins.length} plugins`);
  console.log(`  - 1 base plugin`);
  console.log(`  - ${generated.filter((g) => g.kind === "jurisdiction").length} jurisdiction plugins`);
  console.log(`  - ${generated.filter((g) => g.kind === "topical").length} topical plugins`);
  console.log(`  - ${generated.filter((g) => g.kind === "vertical").length} vertical plugins`);
  console.log(`\nMarketplace manifest: ${MARKETPLACE_PATH}`);
  console.log(`Plugin folders:        ${OUT_DIR}`);
}

main();
