import type { SOURCE_ADMISSIONS, OBSERVATION_STATUSES, DATA_FREQUENCIES, PRICE_BASES } from "./enums";
type Text = { en: string; zh: string };
export type DataSource = {
  id: string; publisher: Text; name: Text; datasetCode: string; datasetUrl: string;
  apiBase: string; licenseId: string; licenseUrl: string; termsUrl: string;
  attribution: Text; licenseCheckedAt: string;
  admission: typeof SOURCE_ADMISSIONS[number]; evidenceRefs: string[];
};
export type DataIndicator = {
  id: string; sourceId: string; providerIndicatorId: string; name: Text; definition: Text;
  unit: string; currency: string; priceBasis: typeof PRICE_BASES[number]; scale: number;
  frequency: typeof DATA_FREQUENCIES[number]; coverage: Text;
  countryMapping: Record<string, string>; allowedYears: string[];
  allowedStatuses: (typeof OBSERVATION_STATUSES[number])[];
};
// Local admission receipt only. Network/page/hash receipts are added in 09.02/03.
export type BatchManifest = {
  id: string; sourceId: string; retrievedAt: string; checkedAt: string;
  upstreamDatasetUpdatedAt: string | null;
};
export type Observation = {
  recordId: string; countryIso3: string; sourceId: string; indicatorId: string;
  period: string; value: string | null; status: typeof OBSERVATION_STATUSES[number];
  unit: string; currency: string; priceBasis: typeof PRICE_BASES[number]; scale: number;
  batchId: string; retrievedAt: string; checkedAt: string;
  upstreamDatasetUpdatedAt: string | null; sourcePublishedAt: string | null;
  sourceRevisedAt: string | null; providerObservationStatus: string;
};
export type PublishedManifest = { schemaVersion: 1; batches: BatchManifest[] };
