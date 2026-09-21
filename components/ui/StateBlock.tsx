"use client";

/*
  StateBlock —— 全站统一的「加载中 / 暂无数据 / 加载失败」状态（TASK 02.10）

  为什么现在就要做？
  V1 的数据都是本地 JSON，永远不会失败 —— 所以这三种状态在首页上看不到。
  但 V2 开始数据来自 PostgreSQL、Python API 和爬虫，那时网络慢、查不到数据、
  接口报错就是常态。到时候如果没统一设计，每个页面会各写各的提示，
  用户看到的文案和样式也会各说各话。所以趁现在定型。

  怎么用（未来）：
    if (isLoading) return <LoadingState />;
    if (items.length === 0) return <EmptyState />;
    if (error) return <ErrorState onRetry={refetch} />;

  设计约束：
    - 不引入新的视觉语言 —— 只复用 Design System 已有的颜色和字号令牌
    - 动画克制：只用一个 animate-pulse（Tailwind 自带的呼吸感），不做位移或弹跳
    - 无障碍：加载用 aria-live="polite"（不打断朗读），错误用 role="alert"（立刻播报）
*/

import type { ReactNode } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Button } from "./Button";

/*
  StateBlock 是三个组件共用的外壳：居中的一块区域，虚线边框（暗示「这里本来应该有东西」）。
  它不直接对外导出 —— 对外只暴露下面三个语义明确的组件。
*/
type StateBlockProps = {
  title: string;
  description?: string;
  children?: ReactNode; // 放补充说明或按钮
  role?: "status" | "alert"; // 屏幕阅读器怎么对待这块内容
  className?: string;
};

function StateBlock({
  title,
  description,
  children,
  role = "status",
  className = "",
}: StateBlockProps) {
  return (
    <div
      role={role}
      // aria-live="polite"：内容变化时温和地告诉屏幕阅读器，不要打断用户
      aria-live={role === "status" ? "polite" : undefined}
      className={`flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-line bg-surface px-6 py-12 text-center ${className}`}
    >
      <p className="text-body text-ink">{title}</p>
      {description ? (
        <p className="max-w-md text-small text-mist">{description}</p>
      ) : null}
      {children}
    </div>
  );
}

/* 1. 加载中 —— 数据还没到 */
export function LoadingState({ className }: { className?: string }) {
  const { dict } = useLanguage();
  return (
    <StateBlock
      title={dict.states.loading.title}
      description={dict.states.loading.description}
      className={className}
    >
      {/*
        一根会呼吸的细线，暗示「还在读数据」。
        只用 Tailwind 自带的 animate-pulse，不自定义关键帧动画。
      */}
      <div
        aria-hidden="true"
        className="mt-2 h-px w-32 animate-pulse bg-line"
      />
    </StateBlock>
  );
}

/* 2. 暂无数据 —— 请求成功了，但结果是空的（这不是错误，不要当成报错处理） */
export function EmptyState({ className }: { className?: string }) {
  const { dict } = useLanguage();
  return (
    <StateBlock
      title={dict.states.empty.title}
      description={dict.states.empty.description}
      className={className}
    />
  );
}

/* 3. 加载失败 —— 出错时可以给一个「重试」按钮（可选） */
export function ErrorState({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  const { dict } = useLanguage();
  return (
    <StateBlock
      title={dict.states.error.title}
      description={dict.states.error.description}
      role="alert"
      className={className}
    >
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">
          {dict.states.error.retry}
        </Button>
      ) : null}
    </StateBlock>
  );
}
