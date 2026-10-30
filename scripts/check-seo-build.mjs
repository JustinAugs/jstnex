import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const preview = process.argv.includes("--preview");
const read = (path) => readFileSync(new URL(`../.next/${path}`, import.meta.url), "utf8");
const sitemap = read("server/app/sitemap.xml.body");
const robots = read("server/app/robots.txt.body");
const page = read("server/app/global.html");
if (preview) {
  assert.ok(page.includes("noindex"));
  assert.ok(robots.includes("Disallow: /"));
  assert.ok(!sitemap.includes("<url>"));
  const { headers } = JSON.parse(read("routes-manifest.json"));
  assert.ok(headers.some((rule) => rule.headers.some((header) =>
    header.key === "X-Robots-Tag" && header.value === "noindex, nofollow")));
} else {
  const countries = JSON.parse(readFileSync(new URL("../data/countries.json", import.meta.url), "utf8"));
  assert.equal((sitemap.match(/<url>/g) || []).length, countries.length + 5);
  for (const country of countries) assert.ok(sitemap.includes(`/global/${country.code.toLowerCase()}`));
  assert.ok(!sitemap.includes("<lastmod>"));
  assert.ok(robots.includes("Allow: /"));
  assert.ok(robots.includes("/sitemap.xml"));
  assert.ok(!page.includes('content="noindex'));
}
assert.ok(!sitemap.includes("localhost"));
console.log(`SEO build checks passed (${preview ? "preview" : "production"}).`);
