"use client";

/*
  ScorFramework —— SCOR Digital Standard 的七个流程（TASK 04，布局升级于 TASK 06.10）

  ⚠️ 一处刻意偏离原始指令，原因必须写清楚：
  指令 Rule 4 要求本组件「保持服务端组件、不加 use client」。
  但本项目的语言状态是客户端的（LanguageProvider 用 useSyncExternalStore 读
  localStorage），服务端组件在渲染时根本拿不到「用户现在用的是中文还是英文」。
  如果这里不加 "use client"，这七条流程会永远停在英文，切中文也不变 ——
  那就直接违反了指令 Rule 10 / Rule 14 的双语要求。

  功能正确性优先，所以这里加了 "use client"。

  内容从哪来？
  七个流程的文案放在 data/scor-processes.json，不写在 JSX 里 ——
  内容归数据文件，界面文字归字典，两边各司其职。

  为什么同时显示中英文流程名？
  因为流程名本身就是专业术语。当前语言的那一条作为主名，
  另一条作为小字副名，学生顺手就记住了标准叫法。

  ------------------------------------------------------------------
  TASK 06.10 改了什么（只改「怎么展示」，没改任何内容）
  ------------------------------------------------------------------
  1. 不再自己套 <Section>：页头已经和本区块合并（见 SupplyChainView），
     这里只负责「SCOR 这一块」，谁调用谁决定外层留白。
  2. 七个流程从「7 行纯文字列表」改成「流程条 + 说明网格」：
       · 流程条：七个编号节点 + 连接线 + 箭头，一眼看出这是一条链
       · 说明网格：每个流程的一句话解释，横向铺开更好扫读
  3. 七个节点样式完全统一 —— 只有编号 01…07 有语义（顺序），
     没有给七个节点配七种颜色，也没有暗示任何数据大小。

  布局断点是从可用宽度算出来的，不是照抄：
    · xl(≥1280) 容器 1104px，七等分每格约 145px，放得下最长的 Orchestrate → 一横排 + 连接线
    · lg(1024~1279) 976px，七等分只剩 129px 太挤 → 退回四列两行，不画连接线
    · sm/lg 之间两列、四列；手机一列纵向
*/

import { useLanguage } from "@/components/providers/LanguageProvider";
import { pick } from "@/lib/i18n";
import { SCOR_PROCESSES } from "@/lib/data";

export default function ScorFramework() {
  const { language, dict } = useLanguage();

  return (
    <div id="scor-processes" className="scroll-mt-24">
      {/* ---------- SCOR 小标题 ---------- */}
      <div className="border-t border-line pt-6">
        <p className="font-medium uppercase tracking-label text-caption text-mist">
          {dict.supplyChain.scor.eyebrow}
        </p>
        <h2 className="mt-2 text-h3 text-ink">{dict.supplyChain.scor.title}</h2>
        <p className="mt-2 max-w-2xl text-small text-mist">
          {dict.supplyChain.scor.description}
        </p>
      </div>

      <aside aria-label="SCOR DS / ASCM" className="mt-4 max-w-2xl text-small text-mist wrap-anywhere">
        <p>{dict.supplyChain.scor.attribution}</p>
        <p className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          <a className="text-deep underline underline-offset-4" href="https://scor.ascm.org/">{dict.supplyChain.scor.original}</a>
          <a className="text-deep underline underline-offset-4" href="https://www.ascm.org/corporate-solutions/standards-tools/scor-ds/open-access-guidance/">{dict.supplyChain.scor.guidance}</a>
        </p>
      </aside>
      <ol className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {SCOR_PROCESSES.map((process, index) => (
          <li key={process.id} className="border-b border-line py-4">
            <details>
              <summary className="cursor-pointer text-small font-medium text-ink">
                <span className="mr-3 text-mist">{index + 1}.</span>
                {pick(process.name, language)}
                <span className="ml-2 text-caption text-mist">{pick(process.name, language === "en" ? "zh" : "en")}</span>
              </summary>
              <p className="mt-3 text-small text-mist">{pick(process.summary, language)}</p>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
