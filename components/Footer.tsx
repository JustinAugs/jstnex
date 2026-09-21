import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/global", label: "Global" },
  { href: "/supply-chain", label: "Supply Chain" },
  { href: "/companies", label: "Companies" },
  { href: "/tools", label: "Tools" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:justify-between">
        <div>
          <p className="text-base font-bold tracking-[0.25em] text-ink">
            JSTNEX
          </p>
          <p className="mt-3 text-xs font-medium tracking-[0.18em] text-mist uppercase">
            Global Supply Network Intelligence
          </p>
          <p className="mt-2 text-sm text-ink">Mapping How The World Moves.</p>
        </div>

        <nav>
          <ul className="flex flex-col gap-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs tracking-[0.18em] uppercase text-mist transition-colors hover:text-deep"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-mist md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} JSTNEX. Independent student project.</p>
          <p>Figures shown on this site are demo data unless stated otherwise.</p>
        </div>
      </div>
    </footer>
  );
}
