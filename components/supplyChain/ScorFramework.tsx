"use client";

/*
  ScorFramework —— SCOR Digital Standard 的七个流程（TASK 04）

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
*/

import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { pick } from "@/lib/i18n";
import { SCOR_PROCESSES } from "@/lib/data";

export default function ScorFramework() {
  const { language, dict } = useLanguage();

  return (
    <Section>
      <SectionHeader
        eyebrow={dict.supplyChain.scor.eyebrow}
        title={dict.supplyChain.scor.title}
        description={dict.supplyChain.scor.description}
      />

      <ol className="border-t border-line">
        {SCOR_PROCESSES.map((process, index) => (
          <li
            key={process.id}
            className="flex flex-col gap-2 border-b border-line py-5 sm:flex-row sm:gap-6"
          >
            {/* 序号：01 … 07，暗示这是一个有序的流程框架 */}
            <span className="shrink-0 font-medium tracking-label text-caption text-mist sm:w-8">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="sm:w-40 sm:shrink-0">
              <p className="text-body font-medium text-ink">
                {pick(process.name, language)}
              </p>
              <p className="mt-0.5 text-caption text-mist">
                {pick(process.name, language === "en" ? "zh" : "en")}
              </p>
            </div>

            <p className="text-small text-mist sm:flex-1">
              {pick(process.summary, language)}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
