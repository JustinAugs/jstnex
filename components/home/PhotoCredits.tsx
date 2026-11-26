"use client";
import {useLanguage} from "../providers/LanguageProvider";
import credits from "@/public/images/atlas/credits.json";
export default function PhotoCredits(){const{language}=useLanguage();return <section className="atlas-credits"><h2>{language==="zh"?"摄影与来源":"Photography and sources"}</h2><details><summary>{language==="zh"?"查看地点、作者与许可":"View locations, photographers and licenses"}</summary><ul>{credits.map(c=><li key={c.slug}><a href={c.source}>{c.title}</a> — {c.creator}. <a href={c.licenseURL}>{c.license}</a>. {language==="zh"?"响应式裁切与缩放，图片改编沿用原许可。":"Responsive crop and resize; image adaptations retain their source license."}</li>)}</ul></details></section>}
