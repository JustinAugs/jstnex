import { Fragment } from "react";
import { formatMetricDecimal } from "@/lib/format-metric";
import type { MetricSnapshot } from "@/lib/data/published-snapshot";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { pick } from "@/lib/i18n";

/** A separate statistical context; its sources do not endorse the qualitative country profile. */
export default function CountryMetrics({ code, snapshot }: { code: string; snapshot: MetricSnapshot }) {
  const { language, dict } = useLanguage();
  const t = dict.countryMetrics;
  const rows = snapshot.observations.filter(r => r.recordId === code).sort((a,b) => b.period.localeCompare(a.period));
  const indicator = snapshot.indicators.find(i => i.id === rows[0]?.indicatorId);
  const source = snapshot.sources.find(s => s.id === rows[0]?.sourceId);
  return <section data-ui aria-labelledby="country-metrics-heading" className="mt-12 max-w-4xl wrap-anywhere bg-surface p-5 sm:p-8">
    <h2 id="country-metrics-heading" className="text-h3 text-ink">{t.title}</h2>
    {!rows.length || !indicator || !source ? <p className="mt-4 text-body text-mist">{t.uncovered}</p> : <>
      <p className="mt-3 text-body font-medium text-ink">{pick(indicator.name, language)}</p>
      <p className="mt-2 max-w-2xl text-small text-mist">{t.scope}</p>
      <table className="mt-6 w-full table-fixed text-body text-ink">
        <caption className="pb-3 max-w-[65ch] text-left text-small text-mist">{t.caption}</caption>
        <thead><tr><th scope="col" className="w-[5ch] py-2 text-left font-medium">{t.year}</th><th scope="col" className="py-2 text-right font-medium">{t.value}</th></tr></thead>
        <tbody>{rows.map(row => <tr key={`${row.indicatorId}-${row.period}`}>
          <th scope="row" className="py-3 text-left font-normal whitespace-nowrap">{row.period}</th>
          <td className="py-3 text-right tabular-nums wrap-anywhere">{row.value === null ? t.missing : formatMetricDecimal(row.value, language === "zh" ? "zh-CN" : "en-US").split(",").map((part, index, parts) => <Fragment key={index}>{part}{index < parts.length - 1 ? <>,<wbr /></> : null}</Fragment>)}</td>
        </tr>)}</tbody>
      </table>
      <dl className="mt-6 space-y-3 text-small text-ink wrap-anywhere">
        <div><dt className="text-mist">{t.source}</dt><dd className="mt-1"><a className="underline underline-offset-4 hover:text-deep" href={source.datasetUrl}>{pick(source.publisher, language)} · {pick(source.name, language)}</a></dd></div>
        <div><dt className="text-mist">{t.retrieved}</dt><dd><time dateTime={rows[0].retrievedAt}>{rows[0].retrievedAt.slice(0,10)} UTC</time></dd></div>
        <div><dt className="text-mist">{t.checked}</dt><dd><time dateTime={rows[0].checkedAt}>{rows[0].checkedAt}</time></dd></div>
        <div><dt className="text-mist">{t.license}</dt><dd className="mt-1 flex flex-wrap gap-x-4 gap-y-2"><a className="underline underline-offset-4 hover:text-deep" href={source.licenseUrl}>{source.licenseId}</a><a className="underline underline-offset-4 hover:text-deep" href={source.termsUrl}>{t.terms}</a></dd></div>
      </dl>
      <p className="mt-5 max-w-[65ch] text-small text-mist">{pick(source.attribution, language)}</p>
    </>}
  </section>;
}
