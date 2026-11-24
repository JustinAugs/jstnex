/** Decimal-string rounding uses BigInt, so large source values never pass through binary floats. */
export function formatMetricDecimal(value: string, locale: string): string {
  if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) throw new Error("Invalid metric decimal");
  const [integer, fraction = ""] = value.split(".");
  let cents = BigInt(integer) * BigInt(100) + BigInt(fraction.slice(0,2).padEnd(2,"0"));
  if (Number(fraction[2] ?? "0") >= 5) cents += BigInt(1);
  const whole = new Intl.NumberFormat(locale).format(cents / BigInt(100));
  const tail = (cents % BigInt(100)).toString().padStart(2,"0").replace(/0+$/, "");
  const separator = new Intl.NumberFormat(locale).formatToParts(1.1).find(p => p.type === "decimal")?.value ?? ".";
  return tail ? `${whole}${separator}${tail}` : whole;
}
