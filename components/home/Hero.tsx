"use client";

import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { useLanguage } from "../providers/LanguageProvider";

const photographs = [
  { slug: "hamburg", alt: "Hamburg: Eurogate and Burchardkai, 2024" },
  { slug: "singapore", alt: "Pasir Panjang Container Terminal, Singapore, 2011" },
  { slug: "los-angeles", alt: "NYK Themis at the Port of Los Angeles" },
  { slug: "shanghai", alt: "Yangshan Deepwater Port, historical photograph, 2007" },
];

export default function Hero({ content }: { content: Dictionary["hero"] }) {
  const { language } = useLanguage();
  const zh = language === "zh";

  return (
    <section className="atlas-hero">
      <div className="atlas-masthead">
        {photographs.map((photo, index) => {
          const image = (
            <Image
              src={`/images/atlas/${photo.slug}.jpg`}
              alt={photo.alt}
              fill
              sizes={index === 0 ? "50vw" : "(max-width: 600px) 45vw, 25vw"}
              preload={index === 0}
            />
          );
          const className = `atlas-photo atlas-photo-${index}`;

          return index === 0 ? (
            <Link href="/global/de" className={`${className} atlas-featured-photo`} key={photo.slug}>
              {image}
              <span className="atlas-photo-label">{zh ? "汉堡港 · 德国资料" : "Port of Hamburg · Germany profile"}</span>
            </Link>
          ) : (
            <div className={className} key={photo.slug}>{image}</div>
          );
        })}
      </div>
      <div className="atlas-intro">
        <p className="atlas-deck">{content.description}</p>
        <div>
          <h1>{zh ? <>看懂全球<br />供应链</> : <>Read the<br />supply network</>}</h1>
          <p className="atlas-slogan">{content.slogan}</p>
          <div className="atlas-actions">
            <Link className="atlas-primary" href="/global">
              {zh ? "探索国家" : "Explore countries"}
              <span className="atlas-action-arrow" aria-hidden="true">→</span>
            </Link>
            <Link className="atlas-secondary" href="/supply-chain">{content.secondaryCta}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
