const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { test } = require("node:test");

test("regenerates the published single-plugin catalogue from a clean checkout", (t) => {
  const root = join(__dirname, "..");
  const fixture = mkdtempSync(join(tmpdir(), "marketplace-"));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  const plugin = "plugins/openaccountants/.claude-plugin";
  mkdirSync(join(fixture, plugin), { recursive: true });
  mkdirSync(join(fixture, "scripts"));
  copyFileSync(join(root, plugin, "plugin.json"), join(fixture, plugin, "plugin.json"));
  const script = join(fixture, "scripts", "generate.js");
  copyFileSync(join(__dirname, "generate.js"), script);

  execFileSync(process.execPath, [script], { cwd: fixture, timeout: 10_000 });
  const manifest = ".claude-plugin/marketplace.json";
  const generated = JSON.parse(readFileSync(join(fixture, manifest), "utf8"));
  assert.deepEqual(generated, JSON.parse(readFileSync(join(root, manifest), "utf8")));
  assert.deepEqual(generated.plugins.map((entry) => entry.name), ["openaccountants"]);
});
