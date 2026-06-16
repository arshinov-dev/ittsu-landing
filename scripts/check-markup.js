const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const errors = [];
const htmlFiles = [
  "index.html",
  "maintenance/403.html",
  "maintenance/404.html",
  "maintenance/503.html",
].filter(filePath => fs.existsSync(path.join(root, filePath)));

const htmlByFile = Object.fromEntries(
  htmlFiles.map(filePath => [
    filePath,
    fs.readFileSync(path.join(root, filePath), "utf8"),
  ]),
);
const html = htmlByFile["index.html"];

const forbiddenPatterns = [
  { pattern: /\son[a-z]+\s*=/i, message: "inline event handler found" },
  { pattern: /(?:src|href)=["']styles\.css["']/i, message: "old root styles.css reference found" },
  { pattern: /(?:src|href)=["']script\.js["']/i, message: "old root script.js reference found" },
  { pattern: /(?:src|href)=["']images\//i, message: "old images/ runtime reference found" },
  { pattern: /(?:src|href)=["']update\/favicon-2\//i, message: "old update/favicon-2 runtime reference found" },
  { pattern: /(?:src|href)=["']update\/head_update\/graphics\//i, message: "old update/head_update/graphics runtime reference found" },
];

for (const [filePath, fileHtml] of Object.entries(htmlByFile)) {
  for (const { pattern, message } of forbiddenPatterns) {
    if (pattern.test(fileHtml)) {
      errors.push(`${filePath}: ${message}`);
    }
  }
}

const expectedScripts = [
  "assets/js/site.config.js",
  "assets/js/site.utils.js",
  "assets/js/site.effects.js",
  "assets/js/hero.js",
  "assets/js/program-modal.js",
  "assets/js/programs.data.js",
  "assets/js/programs.js",
  "assets/js/app.js",
];
const scriptMatches = Array.from(html.matchAll(/<script\s+src=["']([^"']+)["']><\/script>/g)).map(match => match[1]);

if (scriptMatches.length !== expectedScripts.length) {
  errors.push(`expected ${expectedScripts.length} scripts, got ${scriptMatches.length}`);
} else {
  expectedScripts.forEach((script, index) => {
    if (scriptMatches[index] !== script) {
      errors.push(`script ${index + 1} should be "${script}", got "${scriptMatches[index]}"`);
    }
  });
}

if (!html.includes('id="modalOverlay" aria-hidden="true"')) {
  errors.push("modal overlay should start with aria-hidden=true");
}

if (!html.includes('role="dialog"') || !html.includes('aria-modal="true"') || !html.includes('aria-labelledby="modalTitle"')) {
  errors.push("modal dialog ARIA attributes are missing");
}

if (errors.length > 0) {
  console.error(`Markup errors (${errors.length}):`);
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log("markup-ok");
