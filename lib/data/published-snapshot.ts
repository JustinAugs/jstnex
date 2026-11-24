import "server-only";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import type { Observation, DataIndicator, DataSource, PublishedManifest } from "./acquisition";

export type MetricSnapshot = { observations: Observation[]; indicators: DataIndicator[]; sources: DataSource[] };
/** Only the server reads an immutable snapshot; the mutable observation mirror is never consumed. */
export function readPublishedMetrics(): MetricSnapshot {
  const read = (file: string) => readFileSync(resolve(process.cwd(), "data", file.replace(/^data\//, "")), "utf8");
  const hash = (value: string) => createHash("sha256").update(value).digest("hex");
  const reject = (): never => { throw new Error("Published metric snapshot failed integrity checks"); };
  if (["transaction.json", ".publication.lock"].some(file => existsSync(resolve(process.cwd(), "data/acquisition", file)))) reject();
  const publishedRaw = read("data/acquisition/published.json");
  const p = JSON.parse(publishedRaw) as PublishedManifest;
  if (p.schemaVersion !== 1 || !Array.isArray(p.batches)) reject();
  if (p.batches.length === 0) {
    if (p.snapshotPath || p.observationsSha256) reject();
    return { observations: [], indicators: [], sources: [] };
  }
  if (p.batches.length !== 1 || !p.observationsSha256 || p.snapshotPath !== `data/acquisition/curated/snapshot-${p.observationsSha256}` || !/^[a-f0-9]{64}$/.test(p.observationsSha256)) reject();
  const raw = read(`${p.snapshotPath}/observations.json`);
  if (hash(raw) !== p.observationsSha256 || read(`${p.snapshotPath}/published.json`) !== publishedRaw) reject();
  for (const b of p.batches) {
    if (!/^data\/acquisition\/raw\/world-bank-wdi\/wdi-[a-f0-9]{64}\/manifest\.json$/.test(b.rawManifestPath) || hash(read(b.rawManifestPath)) !== b.rawManifestSha256 || b.observationsSha256 !== p.observationsSha256) reject();
  }
  const observations = JSON.parse(raw) as Observation[];
  const indicators = JSON.parse(read("data/indicators.json")) as DataIndicator[];
  const sources = JSON.parse(read("data/sources.json")) as DataSource[];
  if (!Array.isArray(observations) || !Array.isArray(indicators) || !Array.isArray(sources)) reject();
  for (const row of observations) {
    const indicator = indicators.find(i => i.id === row.indicatorId);
    const source = sources.find(s => s.id === row.sourceId);
    if (!indicator || source?.admission !== "approved" || indicator.sourceId !== row.sourceId || indicator.unit !== row.unit || indicator.currency !== row.currency || indicator.scale !== row.scale || indicator.priceBasis !== row.priceBasis || !indicator.allowedYears.includes(row.period) || indicator.countryMapping[row.recordId] !== row.countryIso3 || !p.batches.some(b => b.id === row.batchId)) reject();
  }
  return { observations, indicators, sources };
}
