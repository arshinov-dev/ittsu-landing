const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const errors = [];

const requiredPaths = [
  "index.html",
  "robots.txt",
  "sitemap.xml",
  "README.md",
  "package.json",
  "example.htaccess",
  "maintenance/403.html",
  "maintenance/404.html",
  "maintenance/503.html",
  "assets/css/styles.css",
  "assets/js/app.js",
  "assets/js/programs.data.js",
  "assets/img",
  "scripts/check-assets.js",
  "scripts/check-markup.js",
  "scripts/check-program-data.js",
];

const forbiddenPaths = [
  "images",
  "update",
  "script.js",
  "styles.css",
  "site.webmanifest",
];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.name === ".git") continue;

    if (entry.isDirectory()) {
      files.push(...walk(absolutePath));
    } else {
      files.push(path.relative(root, absolutePath));
    }
  }

  return files;
}

for (const requiredPath of requiredPaths) {
  if (!exists(requiredPath)) {
    errors.push(`missing required path: ${requiredPath}`);
  }
}

for (const forbiddenPath of forbiddenPaths) {
  if (exists(forbiddenPath)) {
    errors.push(`forbidden production path exists: ${forbiddenPath}`);
  }
}

for (const file of walk(root)) {
  if (path.basename(file) === ".DS_Store") {
    errors.push(`macOS metadata file found: ${file}`);
  }
}

if (errors.length > 0) {
  console.error(`Structure errors (${errors.length}):`);
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log("structure-ok");
