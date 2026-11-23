import type { Provenance } from "@/lib/data/provenance";
import { isSourceUrl } from "@/lib/data/provenance";
import Field from "./Field";

/** Within a dl; curated records deliberately have no empty source placeholder. */
export default function SourceField({ provenance, label }: {
  provenance?: Provenance;
  label: string;
}) {
  if (!provenance || provenance.kind === "curated" || !provenance.name?.trim()) return null;
  return <Field label={label}>
    {provenance.url && isSourceUrl(provenance.url) ? (
      <a href={provenance.url} className="wrap-anywhere underline underline-offset-4 hover:text-deep"
        target="_blank" rel="noopener noreferrer">{provenance.name}</a>
    ) : provenance.name}
  </Field>;
}
