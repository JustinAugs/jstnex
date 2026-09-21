import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";

/*
  Hero = 页面最顶部的大标题区。
  目标：用户 5 秒内看懂 JSTNEX 是什么。

  这个组件不再自己写死文字，而是接收 content（当前语言的 Hero 文案）。
  好处：组件只管「怎么显示」，文字由调用方决定 —— 以后加日语也不用改这里。
*/
type HeroProps = {
  content: Dictionary["hero"];
};

export default function Hero({ content }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* 极淡的网格背景（纯黑白灰，不用彩色渐变），aria-hidden 表示屏幕阅读器忽略它 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,#ececec_1px,transparent_1px),linear-gradient(to_bottom,#ececec_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs font-medium tracking-[0.3em] text-mist uppercase">
          {content.eyebrow}
        </p>

        <h1 className="mt-6 text-4xl leading-tight font-bold tracking-tight text-ink md:text-6xl">
          {content.titleTop}
          <br />
          {content.titleBottom}
        </h1>

        <p className="mt-6 text-xl text-ink md:text-2xl">{content.slogan}</p>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist md:text-base">
          {content.description}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/global"
            className="bg-deep px-6 py-3 text-center text-xs font-medium tracking-[0.18em] text-white uppercase transition-colors hover:bg-deep-hover"
          >
            {content.primaryCta}
          </Link>
          <Link
            href="/supply-chain"
            className="border border-ink px-6 py-3 text-center text-xs font-medium tracking-[0.18em] text-ink uppercase transition-colors hover:bg-ink hover:text-white"
          >
            {content.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
