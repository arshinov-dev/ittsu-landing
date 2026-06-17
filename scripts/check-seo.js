const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const errors = [];
const siteUrl = "https://ittsu-rut-abitur.ru";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function expect(value, message) {
  if (!value) {
    errors.push(message);
  }
}

const robots = read("robots.txt");
const sitemap = read("sitemap.xml");

expect(/(?:^|\n)User-agent:\s*\*(?:\n|$)/.test(robots), "robots.txt should allow all user agents explicitly");
expect(/(?:^|\n)Allow:\s*\/(?:\n|$)/.test(robots), "robots.txt should allow /");
expect(
  robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`),
  "robots.txt should point to the production sitemap URL",
);

expect(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), "sitemap.xml should use sitemap namespace");
expect(sitemap.includes(`<loc>${siteUrl}/</loc>`), "sitemap.xml should include the production homepage URL");
expect(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(sitemap), "sitemap.xml should include ISO lastmod");

if (errors.length > 0) {
  console.error(`SEO errors (${errors.length}):`);
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log("seo-ok");
