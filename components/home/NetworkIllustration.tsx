/*
  NetworkIllustration — 首页 Hero 右侧的「全球供应网络」主视觉（TASK 06.9）

  为什么自己画 SVG，而不是放一张图？
    · 零外部请求：不依赖图床，不会加载失败，也没有版权问题
    · 零新依赖：不装图表库、不接地图服务（V1 不做地图）
    · 颜色全部走 Design System 令牌（stroke-line / fill-deep），不在组件里写色值
    · 缩放不失真：任何屏幕都是矢量

  ⚠️ 这是「品牌示意图」，不是数据可视化 —— 必须和真实数据区分开：
    · 节点位置由构图需要决定，不代表真实港口或城市
    · 连线不代表真实航线、不代表真实贸易流量
    · 图里没有任何金额、吞吐量、流量数字
    · 图下方那句说明（Global Network Illustration）就是为了防止被误读成真实数据

  图形怎么分层（从淡到重，保证背景不抢戏）：
    第 1 层  经纬网格（graticule）  最淡的浅灰，只提供「地球」的识别度
    第 2 层  次要连线             深蓝低透明度，形成网络感
    第 3 层  主干连线             深蓝，稍粗，构成枢纽之间的三角骨架
    第 4 层  节点                 末梢 < 次节点 < 主枢纽，尺寸和颜色都有差别

  无障碍：整张 SVG 用 aria-hidden 屏蔽（纯装饰），
          真正的说明文字是下面 <figcaption> 里的那句话 —— 屏幕阅读器读得到。
*/

// 球心和半径：整个图形都按它算，改这一个数就能整体缩放
const CENTER = 200;
const RADIUS = 150;

/* ---------- 1. 节点：坐标全部落在球内（离球心 < RADIUS） ---------- */

type NodeKind = "hub" | "secondary" | "tertiary";

type NetworkNode = {
  x: number;
  y: number;
  kind: NodeKind;
};

// NODES 的下标会被下面的 ROUTES 引用，所以顺序不要随便调
const NODES: NetworkNode[] = [
  { x: 150, y: 118, kind: "hub" }, // 0
  { x: 262, y: 158, kind: "hub" }, // 1
  { x: 188, y: 272, kind: "hub" }, // 2
  { x: 108, y: 196, kind: "secondary" }, // 3
  { x: 206, y: 92, kind: "secondary" }, // 4
  { x: 276, y: 232, kind: "secondary" }, // 5
  { x: 152, y: 236, kind: "secondary" }, // 6
  { x: 96, y: 250, kind: "secondary" }, // 7
  { x: 232, y: 128, kind: "tertiary" }, // 8
  { x: 132, y: 152, kind: "tertiary" }, // 9
  { x: 300, y: 200, kind: "tertiary" }, // 10
  { x: 170, y: 312, kind: "tertiary" }, // 11
];

// 三档半径 + 三档颜色：扫一眼就能分出主次
const NODE_STYLE: Record<NodeKind, { r: number; className: string }> = {
  hub: { r: 5, className: "fill-deep" },
  secondary: { r: 3, className: "fill-deep opacity-45" },
  tertiary: { r: 2, className: "fill-mist opacity-60" },
};

/* ---------- 2. 连线：主干 3 条 + 次要 8 条 ---------- */

// 主干：三个枢纽之间的骨架（视觉上最重）
const MAIN_ROUTES: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [0, 2],
  [1, 2],
];

// 次要：把边上的节点接进网络（更淡，避免糊成一团）
const ROUTES: ReadonlyArray<readonly [number, number]> = [
  [3, 0],
  [4, 1],
  [5, 2],
  [6, 2],
  [7, 3],
  [8, 1],
  [9, 0],
  [10, 2],
  [11, 2],
];

/*
  把两点连成一条「向外鼓起」的弧线。
  直连会像电路图，鼓起来才像球面航线（大圆航线）的感觉。
  鼓起方向 = 从球心指向中点的方向，幅度约为弦长的 18%。
*/
function arcPath(from: NetworkNode, to: NetworkNode): string {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const chord = Math.hypot(to.x - from.x, to.y - from.y);

  // 中点相对球心的方向；长度为 0（正好在球心）时退回向上，避免除以 0
  const dx = midX - CENTER;
  const dy = midY - CENTER;
  const distance = Math.hypot(dx, dy) || 1;

  const bulge = chord * 0.18;
  const cx = midX + (dx / distance) * bulge;
  const cy = midY + (dy / distance) * bulge;

  return `M ${from.x} ${from.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x} ${to.y}`;
}

/* ---------- 3. 经纬网格 ---------- */

// 纬线：球面倾斜 20° 后，纬线圈投影成扁椭圆（越靠两极越小）
const LATITUDES = [
  { cy: 200, rx: 150, ry: 51 }, // 赤道
  { cy: 129.5, rx: 130, ry: 44 },
  { cy: 270.5, rx: 130, ry: 44 },
  { cy: 78, rx: 75, ry: 26 },
  { cy: 322, rx: 75, ry: 26 },
];

// 经线：投影成竖着的椭圆，rx 越大代表越靠近球体正面
const MERIDIAN_RX = [40, 82, 124];

type NetworkIllustrationProps = {
  /** 图下方的中性说明文字（由 i18n 提供，避免组件里写死语言） */
  caption: string;
  className?: string;
};

export default function NetworkIllustration({
  caption,
  className = "",
}: NetworkIllustrationProps) {
  return (
    <figure className={`m-0 ${className}`}>
      <svg
        viewBox="0 0 400 400"
        // 纯装饰：让屏幕阅读器跳过，说明交给下面的 figcaption
        aria-hidden="true"
        focusable="false"
        className="h-auto w-full"
      >
        {/* 球体底色：极浅灰，让球面和白底有一点点区分 */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          className="fill-surface stroke-line"
          strokeWidth="1"
        />

        {/* 第 1 层：经纬网格（最淡） */}
        <g className="stroke-line opacity-70" fill="none" strokeWidth="1">
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

        {/* 外面一圈虚线：增加一点「仪表 / 数据」的气质，不承载任何含义 */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS + 20}
          fill="none"
          className="stroke-line opacity-60"
          strokeWidth="1"
          strokeDasharray="2 6"
        />

        {/* 第 2 层：次要连线 */}
        <g
          fill="none"
          className="stroke-deep opacity-25"
          strokeWidth="1"
          strokeLinecap="round"
        >
          {ROUTES.map(([from, to]) => (
            <path key={`r-${from}-${to}`} d={arcPath(NODES[from], NODES[to])} />
          ))}
        </g>

        {/* 第 3 层：主干连线 */}
        <g
          fill="none"
          className="stroke-deep opacity-60"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          {MAIN_ROUTES.map(([from, to]) => (
            <path key={`mr-${from}-${to}`} d={arcPath(NODES[from], NODES[to])} />
          ))}
        </g>

        {/* 第 4 层：节点（白边描一圈，压在连线上更清楚） */}
        <g className="stroke-white" strokeWidth="1.5">
          {NODES.map((node, index) => {
            const style = NODE_STYLE[node.kind];
            return (
              <circle
                key={`n-${index}`}
                cx={node.x}
                cy={node.y}
                r={style.r}
                className={style.className}
              />
            );
          })}
        </g>
      </svg>

      {/* 移动端图形是居中的，说明也跟着居中；桌面左分栏时回到左对齐 */}
      <figcaption className="mt-4 text-center text-caption text-mist lg:text-left">
        {caption}
      </figcaption>
    </figure>
  );
}
