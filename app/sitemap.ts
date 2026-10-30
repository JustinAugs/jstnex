import type { MetadataRoute } from "next";
import { COUNTRIES } from "@/lib/data";
import { IS_INDEXABLE, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!IS_INDEXABLE) return [];
  // Only actual public routes; no invented freshness dates or language variants.
  return ["/", "/global", "/companies", "/supply-chain", "/tools",
    ...COUNTRIES.map((country) => `/global/${country.code.toLowerCase()}`)]
    .map((path) => ({ url: `${SITE_URL}${path}` }));
}
