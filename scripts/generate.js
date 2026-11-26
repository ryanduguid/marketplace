#!/usr/bin/env node
const { mkdirSync, readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const source = "./plugins/openaccountants";
const plugin = JSON.parse(readFileSync(join(root, source, ".claude-plugin", "plugin.json"), "utf8"));

const marketplace = {
  name: "OpenAccountants",
  owner: {
    name: plugin.author.name,
    url: "https://openaccountants.com",
    email: "hello@openaccountants.com",
  },
  plugins: [
    {
      name: plugin.name,
      source,
      description: "Tax and accounting skills for 190+ jurisdictions, each with its official source and its approval status.",
      category: "tax-accounting",
    },
  ],
  metadata: {
    description: "Tax and accounting skills for 190+ jurisdictions (countries, US states, Canadian provinces). Each skill sets out the method for a tax task, names the official source for its figures, and says whether a licensed accountant has approved it.",
  },
};

const directory = join(root, ".claude-plugin");
mkdirSync(directory, { recursive: true });
writeFileSync(join(directory, "marketplace.json"), JSON.stringify(marketplace, null, 2) + "\n");
