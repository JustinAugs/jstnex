import type { Dictionary } from "@/lib/i18n";
import { ButtonLink } from "./ui/Button";

/*
  Hero = 页面最顶部的大标题区。
  目标：用户 5 秒内看懂 JSTNEX 是什么。

  这个组件不再自己写死文字，而是接收 content（当前语言的 Hero 文案）。
  好处：组件只管「怎么显示」，文字由调用方决定 —— 以后加日语也不用改这里。

  样式全部来自 Design System：
    text-display / text-lead / text-body  字号阶梯（自带响应式）
    container-page                          统一容器
    ButtonLink                              统一按钮（含 hover / focus 状态）
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

      <div className="container-page relative py-24 md:py-32">
        <p className="font-medium tracking-[0.3em] text-caption text-mist uppercase">
          {content.eyebrow}
        </p>

        <h1 className="mt-6 text-display text-ink">
          {content.titleTop}
          <br />
          {content.titleBottom}
        </h1>

        <p className="mt-6 text-lead text-ink">{content.slogan}</p>

        <p className="mt-4 max-w-xl text-body text-mist">{content.description}</p>

        {/* 主按钮深蓝实心，次按钮黑框空心 —— 视觉层级一眼分得清 */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink href="/global" variant="primary" size="md">
            {content.primaryCta}
          </ButtonLink>
          <ButtonLink href="/supply-chain" variant="secondary" size="md">
            {content.secondaryCta}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
