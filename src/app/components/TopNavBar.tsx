"use client";
import Image from "next/image";
import logoSrc from "public/logo.svg";
import { cx } from "lib/cx";
import { useLocale } from "lib/i18n/LocaleProvider";
import { usePathname } from "next/navigation";
import { ResumeControlBarCSR } from "components/Resume/ResumeControlBar";
import { useAppSelector } from "lib/redux/hooks";
import { selectResume } from "lib/redux/resumeSlice";
import { selectSettings } from "lib/redux/settingsSlice";
import { BuilderResumePDF } from "components/Resume/ResumePDF/BuilderResumePDF";
import { useMemo } from "react";

export const TopNavBar = () => {
  const { t } = useLocale();
  const pathname = usePathname();
  const isResumeBuilderPage = pathname === "/resume-builder";
  
  const resume = useAppSelector(selectResume);
  const settings = useAppSelector(selectSettings);
  
  const document = useMemo(
    () => <BuilderResumePDF resume={resume} settings={settings} isPDF={true} />,
    [resume, settings]
  );

  return (
    <header
      aria-label={t("nav.ariaSiteHeader")}
      className={cx(
        "flex h-[var(--top-nav-bar-height)] items-center border-b-2 border-gray-100 px-3 lg:px-12"
      )}
    >
      <div className="flex h-10 w-full items-center justify-between">
        <a href="/">
          <span className="sr-only">{t("nav.srOpenResume")}</span>
          <Image
            src={logoSrc}
            alt={t("nav.logoAlt")}
            className="h-8 w-full"
            priority
          />
        </a>
        <nav
          aria-label={t("nav.ariaSiteNav")}
          className="flex items-center gap-2 text-sm font-medium"
        >
          {isResumeBuilderPage && (
            <div className="flex items-center">
              <ResumeControlBarCSR
                document={document}
                fileName={resume.profile.name + " - Resume"}
              />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
