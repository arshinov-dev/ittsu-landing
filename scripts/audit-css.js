const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "assets/css/styles.css"), "utf8");
const runtimeFiles = [
  "index.html",
  "assets/js/app.js",
  "assets/js/hero.js",
  "assets/js/program-modal.js",
  "assets/js/programs.js",
  "assets/js/site.effects.js",
  "assets/js/site.utils.js",
  "assets/js/site.config.js",
  "assets/js/programs.data.js",
].map(file => fs.readFileSync(path.join(root, file), "utf8")).join("\n");

const cssClassNames = new Set();
const usedClassNames = new Set();
const ignoredClassNames = new Set([
  "active",
  "is-visible",
  "modal-about-image",
  "modal-about-image--edge-crop",
  "professions-count-5",
  "professions-count-6",
  "program-foreign-section",
  "program-group",
  "program-image",
  "program-image--edge-crop",
  "reveal-on-scroll",
]);

for (const match of css.matchAll(/\.([_a-zA-Z][-_a-zA-Z0-9]*)/g)) {
  cssClassNames.add(match[1]);
}

for (const match of runtimeFiles.matchAll(/class(?:Name)?\s*=\s*["'`]([^"'`]+)["'`]/g)) {
  for (const className of match[1].split(/\s+/)) {
    if (/^[A-Za-z_-][A-Za-z0-9_-]*$/.test(className)) {
      usedClassNames.add(className);
    }
  }
}

for (const match of runtimeFiles.matchAll(/class(?:Name)?=["']([^"']+)["']/g)) {
  for (const className of match[1].split(/\s+/)) {
    if (/^[A-Za-z_-][A-Za-z0-9_-]*$/.test(className)) {
      usedClassNames.add(className);
    }
  }
}

for (const match of runtimeFiles.matchAll(/classList\.(?:add|remove|toggle|contains)\(([^)]+)\)/g)) {
  for (const stringMatch of match[1].matchAll(/["'`]([^"'`]+)["'`]/g)) {
    if (/^[A-Za-z_-][A-Za-z0-9_-]*$/.test(stringMatch[1])) {
      usedClassNames.add(stringMatch[1]);
    }
  }
}

for (const match of runtimeFiles.matchAll(/querySelector(?:All)?\(["'`]([^"'`]+)["'`]\)/g)) {
  for (const classMatch of match[1].matchAll(/\.([_a-zA-Z][-_a-zA-Z0-9]*)/g)) {
    usedClassNames.add(classMatch[1]);
  }
}

for (const match of runtimeFiles.matchAll(/['"`]([_a-zA-Z][-_a-zA-Z0-9]*\$\{[^'"`]+)['"`]/g)) {
  ignoredClassNames.add(match[1]);
}

const maybeUnused = Array.from(cssClassNames)
  .filter(className => !usedClassNames.has(className))
  .filter(className => !ignoredClassNames.has(className))
  .sort();

console.log(`css-audit classes=${cssClassNames.size} used=${usedClassNames.size} maybeUnused=${maybeUnused.length}`);

if (maybeUnused.length) {
  console.log(maybeUnused.join("\n"));
}
