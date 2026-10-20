import { notFound } from "next/navigation";
import CountryDetail from "@/components/global/CountryDetail";
import { COUNTRIES } from "@/lib/data";
import { pick } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

/*
  app/global/[code]/page.tsx —— 国家详情页的服务端外壳（TASK 06.12B）

  它只做服务端能做的四件事，交互与双语展示交给 CountryDetail（客户端）：
    1. generateStaticParams —— 在构建时列出全部 8 个国家的小写 code，
       让每个详情页都预渲染成静态页（build 时就是 ○ Static）。
    2. dynamicParams = false —— 凡是不在这 8 个 code 里的路径，Next 直接
       返回 404，绝不回退去渲染某个默认国家。
    3. generateMetadata —— 给每个国家生成独立的 SEO 信息（标题 / 描述 / canonical）。
    4. notFound() —— 页面内再兜底一次：就算未来数据变化导致 code 对不上，
       也返回 404，而不是渲染空壳。

  大小写规则：数据里 countries.json 的 code 是大写 ISO alpha-2（如 CN），
  但 URL 用小写（/global/cn）。generateStaticParams 输出小写，
  页面里用 toLowerCase() 比对，两边统一，避免 /global/CN 和 /global/cn 分叉。
*/

/*
  generateStaticParams 告诉 Next「这个动态路由有哪些合法取值」。
  返回的数组每一项对应一个会被预渲染的静态页。
*/
export function generateStaticParams() {
  return COUNTRIES.map((country) => ({
    code: country.code.toLowerCase(),
  }));
}

/* 只允许预渲染列表里的 code；其他一律 404 */
export const dynamicParams = false;

type Props = {
  params: Promise<{ code: string }>;
};

/* 每个国家的独立 SEO 信息（复用 lib/seo 的 buildMetadata） */
export async function generateMetadata({ params }: Props) {
  const { code } = await params;
  const country = COUNTRIES.find(
    (c) => c.code.toLowerCase() === code.toLowerCase(),
  );

  if (!country) {
    return buildMetadata({
      title: "Not found",
      description: "This country is not part of the directory.",
      path: `/global/${code.toLowerCase()}`,
    });
  }

  // 国家名没有固定英文翻译之外的第三方文案，直接用当前默认英文名做标题，
  // canonical 用小写 URL（搜索引擎看到的正式地址）。
  return buildMetadata({
    title: country.name.en,
    description: pick(country.summary, "en"),
    path: `/global/${code.toLowerCase()}`,
  });
}

export default async function CountryDetailPage({ params }: Props) {
  const { code } = await params;
  const country = COUNTRIES.find(
    (c) => c.code.toLowerCase() === code.toLowerCase(),
  );

  // 双保险：正常情况下 dynamicParams=false 已经挡住未知 code，
  // 这里再兜底一次，防止未来数据结构变化导致静默渲染错误国家。
  if (!country) {
    notFound();
  }

  // CountryDetail 是客户端组件，自己读语言（useLanguage），所以这里传原始数据即可。
  return <CountryDetail country={country} />;
}
