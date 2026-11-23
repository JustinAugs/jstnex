// Run against an already-started build. HTTP/SEO evidence, not a JS interaction test.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const base = process.env.JSTNEX_TEST_URL || "http://localhost:3107";
const canonical = "https://jstnex.vercel.app";
const preview = process.argv.includes("--preview");
const countries = JSON.parse(readFileSync(new URL("../data/countries.json", import.meta.url), "utf8"));
const pages = ["/", "/global", "/companies", "/supply-chain", "/tools", ...countries.map(c => `/global/${c.code.toLowerCase()}`)];
let checks = 0;
async function get(path, status = 200) {
  const response = await fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, status, `${path}: HTTP ${response.status}`);
  if (preview) assert.match(response.headers.get("x-robots-tag") || "", /noindex/);
  checks++; return response;
}
for (const path of pages) {
  const html = await (await get(path)).text();
  assert.match(html, new RegExp(`rel="canonical" href="${canonical}${path === "/" ? "/?" : path}"`));
  assert.match(html, /<h1[ >]/);
  if (preview) assert.match(html, /name="robots" content="noindex/);
  if (path === "/global") for (const anchor of ["country-directory", "port-directory", "network-exploration"]) assert.ok(html.includes(`id="${anchor}"`), anchor);
}
for (const path of ["/global/CN", "/global/Cn", "/global/XX", "/global/xx"]) await get(path, 404);
const robots = await (await get("/robots.txt")).text();
assert.match(robots, preview ? /Disallow: \// : /Allow: \//);
const sitemap = await (await get("/sitemap.xml")).text();
assert.equal((sitemap.match(/<url>/g) || []).length, preview ? 0 : pages.length);
assert.doesNotMatch(sitemap, /localhost|<lastmod>/);
const image = await get("/opengraph-image");
assert.match(image.headers.get("content-type"), /image\/png/);
assert.deepEqual([...new Uint8Array(await image.arrayBuffer()).slice(0,8)], [137,80,78,71,13,10,26,10]);
console.log(`HTTP contracts: ${checks} paths passed (${preview ? "preview" : "production"}); lowercase routes, anchors, canonical, sitemap, robots and OG PNG.`);
