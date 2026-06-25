const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const missing = [];
const checked = [];

function exists(localPath) {
  return fs.existsSync(path.join(root, localPath));
}

function isExternal(value) {
  return (
    !value ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("data:") ||
    value.startsWith("#")
  );
}

function check(assetPath, label = assetPath) {
  if (isExternal(assetPath)) return;

  const clean = assetPath.split("?")[0].split("#")[0];
  if (!clean) return;

  const local = clean.startsWith("/") ? clean.slice(1) : clean;
  checked.push(local);

  if (!exists(local)) {
    missing.push(`${label} -> ${local}`);
  }
}

function checkRelative(assetPath, baseDir, label = assetPath) {
  if (isExternal(assetPath)) return;

  const clean = assetPath.split("?")[0].split("#")[0];
  if (!clean) return;

  const local = clean.startsWith("/")
    ? clean.slice(1)
    : path.normalize(path.join(baseDir, clean));

  checked.push(local);

  if (!exists(local)) {
    missing.push(`${label} -> ${local}`);
  }
}

function checkSrcset(srcset, label) {
  for (const item of String(srcset || "").split(",")) {
    const [assetPath] = item.trim().split(/\s+/);
    check(assetPath, label);
  }
}

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

const htmlFiles = [
  "index.html",
  "maintenance/403.html",
  "maintenance/404.html",
  "maintenance/503.html",
].filter(filePath => fs.existsSync(path.join(root, filePath)));

const indexHtml = read("index.html");

for (const htmlFile of htmlFiles) {
  const fileHtml = read(htmlFile);
  const baseDir = path.dirname(htmlFile) === "." ? "" : path.dirname(htmlFile);

  for (const match of fileHtml.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
    checkRelative(match[1], baseDir, htmlFile);
  }
}

const stylesheets = Array.from(indexHtml.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/g))
  .map(match => match[1])
  .filter(href => !isExternal(href));

for (const stylesheet of stylesheets) {
  const stylesheetPath = stylesheet.startsWith("/") ? stylesheet.slice(1) : stylesheet;
  const stylesheetDir = path.dirname(stylesheetPath);
  const css = read(stylesheetPath);

  for (const match of css.matchAll(/url\((["']?)([^"')]+)\1\)/g)) {
    checkRelative(match[2].trim(), stylesheetDir, `${stylesheetPath} url()`);
  }
}

const manifestPath = "assets/img/favicon/site.webmanifest";
const manifest = JSON.parse(read(manifestPath));
for (const icon of manifest.icons || []) {
  check(path.join(path.dirname(manifestPath), icon.src), "manifest icon");
}

const configSandbox = { window: {} };
vm.runInNewContext(read("assets/js/site.config.js"), configSandbox);
const siteConfig = configSandbox.window.IZHT_SITE_CONFIG || {};

const sandbox = { window: {} };
vm.runInNewContext(read("assets/js/programs.data.js"), sandbox);
const programs = sandbox.window.IZHT_PROGRAMS || [];

for (const program of programs) {
  for (const variant of [
    `${program.number}-cover-640.jpg`,
    `${program.number}-cover-1200.jpg`,
    `${program.number}-professions-900.jpg`,
    `${program.number}-professions-1400.jpg`,
  ]) {
    check(path.join("assets/img/programs", variant), `program ${program.number}`);
  }
}

for (const [index, slide] of (siteConfig.desktopHeroSlides || []).entries()) {
  check(slide.src, `desktop hero ${index + 1}`);
  checkSrcset(slide.srcset, `desktop hero ${index + 1} srcset`);
}

for (const [index, slide] of (siteConfig.mobileHeroSlides || []).entries()) {
  check(slide.src, `mobile hero ${index + 1}`);
  checkSrcset(slide.srcset, `mobile hero ${index + 1} srcset`);
}

if (programs.length !== 33) {
  missing.push(`program data count -> expected 33, got ${programs.length}`);
}

if ((siteConfig.desktopHeroSlides || []).length !== 25) {
  missing.push(`desktop hero slide count -> expected 25, got ${(siteConfig.desktopHeroSlides || []).length}`);
}

if ((siteConfig.mobileHeroSlides || []).length !== 25) {
  missing.push(`mobile hero slide count -> expected 25, got ${(siteConfig.mobileHeroSlides || []).length}`);
}

if (missing.length > 0) {
  console.error(`Missing assets (${missing.length}):`);
  for (const asset of missing) {
    console.error(asset);
  }
  process.exit(1);
}

console.log(`asset-paths-ok checked=${checked.length} programs=${programs.length}`);
