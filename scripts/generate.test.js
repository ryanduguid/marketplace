const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const GENERATOR = process.env.GENERATOR_UNDER_TEST || path.join(__dirname, "generate.js");
const AU_DIR = path.resolve(__dirname, "../plugins/openaccountants-au");
const AU_FILES = [
  ".claude-plugin/plugin.json", ".mcp.json", "README.md",
  "commands/review.md", "commands/skills.md", "commands/start.md",
  "skills/openaccountants-au/SKILL.md",
];
const AU_IDS = fs.readFileSync(path.join(AU_DIR, "skills/openaccountants-au/SKILL.md"), "utf8")
  .split(/\r?\n/).map((line) => line.match(/^- `([a-z0-9-]+)`$/)?.[1]).filter(Boolean);

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function fixture(t, ids = AU_IDS) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wexler-mcgill-marketplace-"));
  const repo = path.join(root, "marketplace");
  const source = path.join(root, "openaccountants-push/packages/australia");
  write(path.join(repo, "scripts/generate.js"), fs.readFileSync(GENERATOR));
  fs.mkdirSync(source, { recursive: true });
  for (const id of ids) {
    write(path.join(source, `${id}.md`), `---\nname: ${id}\njurisdiction: AU\ncategory: international\ndescription: Synthetic routing fixture, no tax guidance.\n---\n\nFixture body.\n`);
  }
  t.after(() => {
    const resolved = fs.realpathSync(root);
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith("wexler-mcgill-marketplace-"));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  return { repo, source };
}

function run(repo) {
  return spawnSync(process.execPath, [path.join(repo, "scripts/generate.js")], {
    cwd: repo, encoding: "utf8", timeout: 15_000,
  });
}

function success(result) {
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
}

function read(repo, relative) {
  return fs.readFileSync(path.join(repo, relative), "utf8").replace(/\r\n/g, "\n");
}

function listedIds(text) {
  return text.split("\n").map((line) => line.match(/^- `([a-z0-9-]+)`$/)?.[1]).filter(Boolean);
}

test("regenerates the reviewed AU package and current marketplace layout", (t) => {
  const { repo } = fixture(t);
  success(run(repo));
  for (const relative of AU_FILES) {
    assert.equal(read(repo, `plugins/openaccountants-au/${relative}`),
      fs.readFileSync(path.join(AU_DIR, relative), "utf8").replace(/\r\n/g, "\n"), relative);
  }
  const marketplace = JSON.parse(read(repo, ".claude-plugin/marketplace.json"));
  assert.equal(typeof marketplace.metadata.description, "string");
  assert.equal(Object.hasOwn(marketplace, "description"), false);
  assert.equal(fs.existsSync(path.join(repo, "marketplace.json")), false);
  const au = marketplace.plugins.find((plugin) => plugin.name === "openaccountants-au");
  assert.equal(au.source, "./plugins/openaccountants-au");
  for (const plugin of marketplace.plugins) {
    assert.equal(Object.hasOwn(plugin, "recommended"), false);
    const manifest = JSON.parse(read(repo, `${plugin.source}/.claude-plugin/plugin.json`));
    assert.equal(plugin.name, manifest.name);
  }
});

test("keeps all source IDs beyond the old 30-skill and 50-skill caps", (t) => {
  const ids = Array.from({ length: 61 }, (_, index) => `au-fixture-${String(index).padStart(2, "0")}`);
  const { repo } = fixture(t, ids);
  success(run(repo));
  for (const slug of ["openaccountants-au", "openaccountants"]) {
    assert.deepEqual(listedIds(read(repo, `plugins/${slug}/skills/${slug}/SKILL.md`)), ids);
  }
});

test("produces the same catalogue for different source creation orders", (t) => {
  const first = fixture(t, [...AU_IDS].reverse());
  const second = fixture(t, AU_IDS);
  success(run(first.repo));
  success(run(second.repo));
  assert.equal(read(first.repo, ".claude-plugin/marketplace.json"), read(second.repo, ".claude-plugin/marketplace.json"));
  assert.equal(read(first.repo, "plugins/openaccountants-au/skills/openaccountants-au/SKILL.md"),
    read(second.repo, "plugins/openaccountants-au/skills/openaccountants-au/SKILL.md"));
});

test("reads quoted AU metadata, folded descriptions and CRLF without changing membership", (t) => {
  const { repo, source } = fixture(t);
  const id = AU_IDS[0];
  write(path.join(source, `${id}.md`), `---\r\nname: '${id}'\r\njurisdiction: "AU" # country\r\ncategory: international\r\ndescription: >-\r\n  Synthetic routing fixture.\r\n  No tax guidance.\r\ndepends_on:\r\n  - fixture-base\r\n---\r\n\r\nFixture body.\r\n`);
  success(run(repo));
  assert.deepEqual(listedIds(read(repo, "plugins/openaccountants-au/skills/openaccountants-au/SKILL.md")), AU_IDS);
});

test("reports documentation without frontmatter instead of inventing a skill ID", (t) => {
  const { repo, source } = fixture(t);
  write(path.join(source, "intake.md"), "# Package onboarding documentation\n");
  const result = run(repo);
  success(result);
  assert.match(result.stderr, /intake\.md/);
  assert.deepEqual(listedIds(read(repo, "plugins/openaccountants/skills/openaccountants/SKILL.md")), AU_IDS);
});

test("rejects duplicate IDs before changing existing generated files", (t) => {
  const { repo, source } = fixture(t);
  write(path.join(source, "duplicate.md"), `---\nname: ${AU_IDS[0]}\njurisdiction: AU\ncategory: international\n---\n`);
  const sentinel = ".claude-plugin/marketplace.json";
  write(path.join(repo, sentinel), "unchanged catalogue\n");
  const result = run(repo);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Duplicate skill slug/);
  assert.equal(read(repo, sentinel), "unchanged catalogue\n");
});

test("rejects malformed identity metadata before changing existing output", async (t) => {
  for (const [label, metadata] of [
    ["unterminated frontmatter", "---\nname: au-unclosed\n"],
    ["path traversal", "---\nname: ../outside\njurisdiction: AU\n---\n"],
    ["duplicate key", "---\nname: au-identity\nname: au-other\njurisdiction: AU\n---\n"],
    ["non-scalar jurisdiction", "---\nname: au-identity\njurisdiction: [AU, NZ]\n---\n"],
  ]) {
    await t.test(label, (t) => {
      const { repo, source } = fixture(t);
      write(path.join(source, "malformed.md"), metadata);
      write(path.join(repo, ".claude-plugin/marketplace.json"), "unchanged catalogue\n");
      const result = run(repo);
      assert.notEqual(result.status, 0);
      assert.equal(read(repo, ".claude-plugin/marketplace.json"), "unchanged catalogue\n");
      assert.equal(fs.existsSync(path.join(repo, "plugins")), false);
    });
  }
});

test("preserves unowned files and stale plugin directories during regeneration", (t) => {
  const { repo } = fixture(t);
  write(path.join(repo, "plugins/manual/README.md"), "keep manual plugin\n");
  write(path.join(repo, "plugins/openaccountants-au/notes.md"), "keep maintainer notes\n");
  success(run(repo));
  assert.equal(read(repo, "plugins/manual/README.md"), "keep manual plugin\n");
  assert.equal(read(repo, "plugins/openaccountants-au/notes.md"), "keep maintainer notes\n");
});

test("rejects an empty source before touching an existing catalogue", (t) => {
  const { repo } = fixture(t, []);
  write(path.join(repo, ".claude-plugin/marketplace.json"), "unchanged catalogue\n");
  const result = run(repo);
  assert.notEqual(result.status, 0);
  assert.equal(read(repo, ".claude-plugin/marketplace.json"), "unchanged catalogue\n");
});
