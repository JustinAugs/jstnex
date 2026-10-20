import type { Dictionary } from "@/lib/i18n";
import { ButtonLink } from "../ui/Button";
import NetworkIllustration from "./NetworkIllustration";

/*
  Hero = 页面最顶部的大标题区。
  目标：用户 5 秒内看懂 JSTNEX 是什么。

  这个组件不再自己写死文字，而是接收 content（当前语言的 Hero 文案）。
  好处：组件只管「怎么显示」，文字由调用方决定 —— 以后加日语也不用改这里。

  样式全部来自 Design System：
    text-display / text-lead / text-body  字号阶梯（自带响应式）
    container-page                          统一容器
    ButtonLink                              统一按钮（含 hover / focus 状态）

  ------------------------------------------------------------------
  布局（TASK 06.9）：桌面端左右分栏，移动端上下堆叠
  ------------------------------------------------------------------
  为什么是 2fr : 1fr，不是常见的 7:5？
    实测出来的：英文标题第二行「NETWORK INTELLIGENCE」在 60px 下宽 688px。
    容器可用宽 1104px，若按 7:5，左栏只有 616px —— 标题会被挤成三行，
    原本「GLOBAL SUPPLY / NETWORK INTELLIGENCE」的断句就没了。
    2:1 下左栏约 709px，正好装下这两行；右栏约 355px 放主视觉。
    数字是从真实 DOM 量出来的，不是拍脑袋。

  高度由内容决定：没有写死 min-height，也没有靠加大 padding 撑场面。
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

      <div className="container-page relative py-20 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* ---------- 左：文字（品牌介绍 → 标题 → 标语 → 描述 → CTA） ---------- */}
          <div>
            <p className="font-medium uppercase tracking-label text-caption text-mist">
              {content.eyebrow}
            </p>

            <h1 className="mt-6 text-display text-ink">
              {content.titleTop}
              <br />
              {content.titleBottom}
            </h1>

            <p className="mt-6 text-lead text-ink">{content.slogan}</p>

            <p className="mt-4 max-w-xl text-body text-mist">
              {content.description}
            </p>

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

          {/*
            ---------- 右：全球供应网络主视觉 ----------
            自绘内联 SVG：不加载外部图片、不接地图服务、不含任何真实数据。
            移动端会自然落到文字下方（先读文字，再看图）。
          */}
          <NetworkIllustration
            caption={content.illustrationCaption}
            className="mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-none"
          />
        </div>
      </div>
    </section>
  );
}
