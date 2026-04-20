"use client";

import Link from "next/link";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { AutoTypingResume } from "home/AutoTypingResume";
import { useTranslations } from "lib/i18n/LocaleProvider";

export const Hero = () => {
  const t = useTranslations("home.hero");

  return (
    <section className="lg:flex lg:h-[825px] lg:justify-center">
      <FlexboxSpacer maxWidth={75} minWidth={0} className="hidden lg:block" />
      <div className="mx-auto max-w-xl pt-8 text-center lg:mx-0 lg:grow lg:pt-32 lg:text-left">
        <h1 className="text-primary pb-2 text-4xl font-bold lg:text-5xl">
          打造产品经理专属简历
        </h1>
        <ul className="mt-6 space-y-3 text-left text-gray-600 lg:mt-8">
          <li className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary"></span>
            <span>专业模板：基于产品经理岗位需求定制</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary"></span>
            <span>AI 优化：智能分析并提升简历竞争力</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary"></span>
            <span>一键导出：多格式输出，适配不同场景</span>
          </li>
        </ul>
        <Link href="/resume-import" className="btn-primary mt-6 lg:mt-14">
          立即开始 <span aria-hidden="true">→</span>
        </Link>
        <p className="ml-6 mt-3 text-sm text-gray-600">无需注册</p>
      </div>
      <FlexboxSpacer maxWidth={100} minWidth={50} className="hidden lg:block" />
      <div className="mt-6 flex justify-center lg:mt-4 lg:block lg:grow">
        <AutoTypingResume />
      </div>
    </section>
  );
};
