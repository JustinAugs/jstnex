"use client";

/*
  NetworkIllustration —— 首页 Hero 右侧的「全球供应网络」主视觉（TASK 06.9）

  TASK 06.12C 升级为「轻量级交互式网络地球」：
    五个国家节点（CN/US/JP/DE/SG）可以 hover / 键盘聚焦 / 点击选中，
    选中后展示一张国家信息卡，卡片里的链接跳到 /global/{code} 详情页。
    其余 7 个节点继续作为纯装饰，不可交互。

  为什么还是自己画 SVG，而不是放图 / 上 3D？
    · 零外部请求、零新依赖 —— 不装图表库、不接地图服务、不上 Three.js/WebGL
    · 颜色全部走 Design System 令牌，不在组件里写色值
    · 矢量缩放不失真

  ⚠️ 这是「品牌示意图」，不是数据可视化 —— 必须和真实数据区分开：
    · 节点位置由构图需要决定，不代表真实港口 / 城市 / 经纬度
    · 连线不代表真实航线、不代表真实贸易流量
    · 图里没有任何金额、吞吐量、流量数字
    · 图下方那句说明（Global Network Illustration）就是为了防止被误读成真实数据

  ------------------------------------------------------------------
  交互状态设计（为什么是三个 state 而不是一个）
  ------------------------------------------------------------------
  hoveredCode  鼠标悬停在哪个国家（桌面预览：高亮 + 开卡）
  focusedCode  键盘 Tab 聚焦在哪个国家（只高亮节点，不单独开卡）
  selectedCode 用户"明确选中"的国家（点击 / Enter / Space 才发生）

  信息卡显示的国家按这个优先级取：
    selectedCode  →  hoveredCode  →  null（不显示）

  为什么 focusedCode 不放进卡片驱动链？
    键盘用户 Tab 到节点时，看到的是「节点高亮」，再按 Enter / Space 才是
    「确认打开卡片」—— 这符合"预览"和"确认"分离的直觉。
    更重要的是：关闭按钮会把焦点还给节点，节点 onFocus 会重设 focusedCode；
    若 focusedCode 也驱动卡片，刚关闭的卡片就会立刻重开（闪烁）。

  为什么这样拆？
    · 鼠标移出节点时只清 hoveredCode，不会清掉键盘焦点或已选国家
    · 点击只"选中 + 开卡"，不直接跳转（跳转交给卡片里的链接）
    · onBlur / onClick / onMouseLeave 的事件顺序不会导致卡片闪烁或误关

  ------------------------------------------------------------------
  无障碍
  ------------------------------------------------------------------
  · 交互节点用 <g role="button" tabIndex={0} aria-label="国家名，角色">，
    键盘可聚焦；Enter / Space 选中，Escape 关闭。
  · 装饰节点不加 role / tabIndex，读屏器不会把它们当可操作内容。
  · 整个 SVG 不再 aria-hidden（现在有可交互内容），但球体 / 网格 / 连线
    这些纯装饰子层各自 aria-hidden，读屏器只听到五个可交互节点。
  · 焦点可见不靠颜色：节点外圈画一道描边环，加上尺寸变化。
  · 触控热区：视觉节点 r≈5px，但叠一层透明的 r=14px 热区，约 28px 可点。
  · prefers-reduced-motion：过渡统一加 motion-safe，用户减少动效时直接关闭。
*/

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { pick } from "@/lib/i18n";
import { COUNTRIES, regionKey } from "@/lib/data";

/*
  球心和半径：整个图形都按它算，改这一个数就能整体缩放。
*/
const CENTER = 200;
const RADIUS = 150;

/* ---------- 节点：坐标全部落在球内（离球心 < RADIUS） ---------- */

type NodeKind = "secondary" | "tertiary";

/*
  交互节点：带国家代码，可 hover / 聚焦 / 选中。
  坐标沿用 06.9 原图的 hub + secondary 位置，不重新摆布构图。
*/
type GlobeNode = {
  code: string; // ISO alpha-2，对应 COUNTRIES 里的 code
  x: number;
  y: number;
};

/*
  装饰节点：纯视觉，不承载交互。
  保留原有的位置与三档样式，只是不再参与交互。
*/
type DecorNode = {
  x: number;
  y: number;
  kind: NodeKind;
};

/* 五个交互国家节点（复用原 3 个 hub + 2 个 secondary 的坐标） */
const GLOBE_NODES: GlobeNode[] = [
  { code: "CN", x: 150, y: 118 }, // 原 hub #0
  { code: "US", x: 262, y: 158 }, // 原 hub #1
  { code: "SG", x: 188, y: 272 }, // 原 hub #2
  { code: "DE", x: 108, y: 196 }, // 原 secondary #3
  { code: "JP", x: 276, y: 232 }, // 原 secondary #5
];

/* 剩余的 7 个装饰节点（原 12 个节点里去掉上面 5 个交互节点） */
const DECOR_NODES: DecorNode[] = [
  { x: 206, y: 92, kind: "secondary" }, // 原 #4
  { x: 152, y: 236, kind: "secondary" }, // 原 #6
  { x: 96, y: 250, kind: "secondary" }, // 原 #7
  { x: 232, y: 128, kind: "tertiary" }, // 原 #8
  { x: 132, y: 152, kind: "tertiary" }, // 原 #9
  { x: 300, y: 200, kind: "tertiary" }, // 原 #10
  { x: 170, y: 312, kind: "tertiary" }, // 原 #11
];

const DECOR_STYLE: Record<NodeKind, { r: number; className: string }> = {
  secondary: { r: 3, className: "fill-deep opacity-45" },
  tertiary: { r: 2, className: "fill-mist opacity-60" },
};

/* 交互节点：视觉半径 + 触控热区半径 */
const INTERACTIVE_R = 5;
const HIT_R = 14;

/* ---------- 连线：主干 3 条 + 次要 8 条 ---------- */

/*
  连线仍按原图的节点坐标连。这里为了不改构图，直接沿用原坐标的连线端点
  （原图用 NODES 下标连，这里改为用坐标直接连，避免维护两套下标）。
*/
type Point = { x: number; y: number };

const MAIN_ROUTES: ReadonlyArray<readonly [Point, Point]> = [
  [{ x: 150, y: 118 }, { x: 262, y: 158 }], // CN - US
  [{ x: 150, y: 118 }, { x: 188, y: 272 }], // CN - SG
  [{ x: 262, y: 158 }, { x: 188, y: 272 }], // US - SG
];

const ROUTES: ReadonlyArray<readonly [Point, Point]> = [
  [{ x: 108, y: 196 }, { x: 150, y: 118 }], // DE - CN
  [{ x: 206, y: 92 }, { x: 262, y: 158 }],
  [{ x: 276, y: 232 }, { x: 188, y: 272 }], // JP - SG
  [{ x: 152, y: 236 }, { x: 188, y: 272 }],
  [{ x: 96, y: 250 }, { x: 108, y: 196 }],
  [{ x: 232, y: 128 }, { x: 262, y: 158 }],
  [{ x: 132, y: 152 }, { x: 150, y: 118 }],
  [{ x: 300, y: 200 }, { x: 188, y: 272 }],
  [{ x: 170, y: 312 }, { x: 188, y: 272 }],
];

/*
  把两点连成一条「向外鼓起」的弧线。
  直连会像电路图，鼓起来才像球面航线（大圆航线）的感觉。
  鼓起方向 = 从球心指向中点的方向，幅度约为弦长的 18%。
*/
function arcPath(from: Point, to: Point): string {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const chord = Math.hypot(to.x - from.x, to.y - from.y);

  const dx = midX - CENTER;
  const dy = midY - CENTER;
  const distance = Math.hypot(dx, dy) || 1;

  const bulge = chord * 0.18;
  const cx = midX + (dx / distance) * bulge;
  const cy = midY + (dy / distance) * bulge;

  return `M ${from.x} ${from.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x} ${to.y}`;
}

/* ---------- 经纬网格 ---------- */

const LATITUDES = [
  { cy: 200, rx: 150, ry: 51 },
  { cy: 129.5, rx: 130, ry: 44 },
  { cy: 270.5, rx: 130, ry: 44 },
  { cy: 78, rx: 75, ry: 26 },
  { cy: 322, rx: 75, ry: 26 },
];

const MERIDIAN_RX = [40, 82, 124];

type NetworkIllustrationProps = {
  caption: string;
  className?: string;
};

export default function NetworkIllustration({
  caption,
  className = "",
}: NetworkIllustrationProps) {
  const { language, dict } = useLanguage();

  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [focusedCode, setFocusedCode] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  /*
    信息卡显示的国家：selected（明确选中）优先，其次 hover（桌面预览）。
    刻意不把 focusedCode 放进卡片驱动链 ——
    否则「关闭按钮把焦点还给节点」会触发 onFocus 重设 focusedCode，
    导致刚关闭的卡片又立刻重开（任务书明确要避免的闪烁）。
    focusedCode 只负责「节点高亮」，不负责「开卡」：
    键盘用户 Tab 到节点看到高亮，按 Enter 才真正打开卡片。
  */
  const activeCode = selectedCode ?? hoveredCode;
  const activeCountry = activeCode
    ? COUNTRIES.find((c) => c.code === activeCode) ?? null
    : null;

  /* 当前 hover / focus / selected 的国家，用于给节点上状态样式 */
  const isActive = (code: string) => activeCode === code;
  const isSelected = (code: string) => selectedCode === code;

  /* 选中：点击 / Enter / Space。只选中 + 开卡，不跳转。 */
  const select = (code: string) => {
    setSelectedCode(code);
    setFocusedCode(code);
  };

  /* 关闭信息卡：清除选中；由关闭按钮触发时，焦点返回对应节点（调用方处理） */
  const close = () => {
    setSelectedCode(null);
  };

  /*
    关闭按钮的处理：清除选中，并把焦点交还给当前国家节点。
    用 document 查询的方式定位节点（SVG 内 <g> 的 tabIndex=-1 可聚焦），
    找不到时优雅忽略，不抛错。
  */
  const closeAndReturnFocus = () => {
    setSelectedCode(null);
    // 焦点返回对应节点（仅当是由信息卡关闭按钮触发时）
    const node = document.getElementById(`globe-node-${activeCode}`);
    if (node) {
      node.focus();
    }
  };

  return (
    <figure className={`m-0 ${className}`}>
      <svg
        viewBox="0 0 400 400"
        className="h-auto w-full"
        role="group"
        aria-label={dict.hero.globe.label}
      >
        {/* 球体底色：极浅灰，让球面和白底有一点点区分（装饰，读屏跳过） */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          className="fill-surface stroke-line"
          strokeWidth="1"
          aria-hidden="true"
        />

        {/* 第 1 层：经纬网格（装饰） */}
        <g
          className="stroke-line opacity-70"
          fill="none"
          strokeWidth="1"
          aria-hidden="true"
        >
          {MERIDIAN_RX.map((rx) => (
            <ellipse
              key={`m-${rx}`}
              cx={CENTER}
              cy={CENTER}
              rx={rx}
              ry={RADIUS}
            />
          ))}
          {LATITUDES.map((lat) => (
            <ellipse
              key={`l-${lat.cy}`}
              cx={CENTER}
              cy={lat.cy}
              rx={lat.rx}
              ry={lat.ry}
            />
          ))}
        </g>

        {/* 虚线外圈（装饰） */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS + 20}
          fill="none"
          className="stroke-line opacity-60"
          strokeWidth="1"
          strokeDasharray="2 6"
          aria-hidden="true"
        />

        {/* 第 2 层：次要连线（装饰） */}
        <g
          fill="none"
          className="stroke-deep opacity-25"
          strokeWidth="1"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {ROUTES.map(([from, to], i) => (
            <path key={`r-${i}`} d={arcPath(from, to)} />
          ))}
        </g>

        {/* 第 3 层：主干连线（装饰） */}
        <g
          fill="none"
          className="stroke-deep opacity-60"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {MAIN_ROUTES.map(([from, to], i) => (
            <path key={`mr-${i}`} d={arcPath(from, to)} />
          ))}
        </g>

        {/* 第 4 层：7 个装饰节点（不可交互，读屏跳过） */}
        <g className="stroke-white" strokeWidth="1.5" aria-hidden="true">
          {DECOR_NODES.map((node, i) => {
            const style = DECOR_STYLE[node.kind];
            return (
              <circle
                key={`d-${i}`}
                cx={node.x}
                cy={node.y}
                r={style.r}
                className={style.className}
              />
            );
          })}
        </g>

        {/* 第 5 层：5 个可交互国家节点（最上层，压住连线） */}
        {GLOBE_NODES.map((node) => {
          const country = COUNTRIES.find((c) => c.code === node.code);
          const active = isActive(node.code);
          const selected = isSelected(node.code);

          return (
            <g
              key={node.code}
              id={`globe-node-${node.code}`}
              role="button"
              tabIndex={0}
              aria-label={
                country
                  ? `${pick(country.name, language)}, ${pick(country.role, language)}`
                  : node.code
              }
              aria-pressed={selected}
              onMouseEnter={() => setHoveredCode(node.code)}
              onMouseLeave={() => setHoveredCode(null)}
              onFocus={() => setFocusedCode(node.code)}
              onBlur={() => setFocusedCode(null)}
              onClick={() => select(node.code)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  select(node.code);
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  close();
                }
              }}
              className="cursor-pointer outline-none"
            >
              {/* 透明触控热区：保证约 28px 可点面积 */}
              <circle
                cx={node.x}
                cy={node.y}
                r={HIT_R}
                fill="transparent"
                className="pointer-events-auto"
              />

              {/* 焦点环：仅在未选中时渲染，避免与选中环叠加（重复环）。
                  键盘 Tab 聚焦 → 显示焦点环；Enter/Space 选中 → 换成选中环。
                  选中后键盘焦点仍在节点上，但选中环本身已给出清晰的可辨状态，
                  且焦点环/选中环互斥，不会出现「两环重叠」。 */}
              {focusedCode === node.code && !selected && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={INTERACTIVE_R + 5}
                  fill="none"
                  className="stroke-deep"
                  strokeWidth="1.5"
                  aria-hidden="true"
                />
              )}

              {/* 选中环：比焦点环更靠外、更细，和焦点区分 */}
              {selected && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={INTERACTIVE_R + 7}
                  fill="none"
                  className="stroke-ink"
                  strokeWidth="1"
                  aria-hidden="true"
                />
              )}

              {/* 实际节点：白描边 + 深蓝实心，选中/悬停时略微放大 */}
              <circle
                cx={node.x}
                cy={node.y}
                r={active ? INTERACTIVE_R + 1.5 : INTERACTIVE_R}
                className={`fill-deep transition-all duration-200 motion-safe:transition-all ${
                  active ? "opacity-100" : "opacity-90"
                }`}
                stroke="white"
                strokeWidth="1.5"
              />
            </g>
          );
        })}
      </svg>

      {/* 信息卡：放在 SVG 下方正常文档流，不用绝对定位，不遮挡 Hero 标题/CTA */}
      <div
        aria-live="polite"
        className="mt-5 min-h-[6rem]"
      >
        {activeCountry ? (
          <div className="rounded-sm border border-line bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium tracking-label text-caption text-deep uppercase">
                    {activeCountry.code}
                  </span>
                  <span className="text-caption text-mist">
                    {dict.regions[regionKey(activeCountry.region)]}
                  </span>
                </div>
                <h3 className="mt-1 text-h3 text-ink">
                  {pick(activeCountry.name, language)}
                </h3>
              </div>

              {/* 关闭按钮 */}
              <button
                type="button"
                onClick={closeAndReturnFocus}
                aria-label={dict.hero.globe.close}
                className="flex h-8 w-8 shrink-0 items-center justify-center text-mist transition-colors hover:text-ink"
              >
                <span aria-hidden className="text-body leading-none">
                  ×
                </span>
              </button>
            </div>

            <p className="mt-2 text-small text-mist">
              {pick(activeCountry.summary, language)}
            </p>

            <Link
              href={`/global/${activeCountry.code.toLowerCase()}`}
              className="mt-3 inline-flex items-center gap-2 font-medium tracking-label text-caption text-deep uppercase transition-colors hover:text-deep-hover"
            >
              {dict.hero.globe.viewDetail}
              <span aria-hidden className="h-px w-5 bg-deep" />
            </Link>
          </div>
        ) : (
          /* 无选中 / 无 hover / 无 focus 时的操作提示 */
          <p className="text-caption text-mist">{dict.hero.globe.hint}</p>
        )}
      </div>

      {/* 移动端图形居中，说明跟着居中；桌面左分栏时回到左对齐 */}
      <figcaption className="mt-4 text-center text-caption text-mist lg:text-left">
        {caption}
      </figcaption>
    </figure>
  );
}
