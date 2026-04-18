"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logoSrc from "public/logo.svg";
import { cx } from "lib/cx";
import { useLocale } from "lib/i18n/LocaleProvider";

export const TopNavBar = () => {
  const pathName = usePathname();
  const isHomePage = pathName === "/";
  const { locale, setLocale, t } = useLocale();

  return (
    <header
      aria-label={t("nav.ariaSiteHeader")}
      className={cx(
        "flex h-[var(--top-nav-bar-height)] items-center border-b-2 border-gray-100 px-3 lg:px-12",
        isHomePage && "bg-dot"
      )}
    >
      <div className="flex h-10 w-full items-center justify-between">
        <Link href="/">
          <span className="sr-only">{t("nav.srOpenResume")}</span>
          <Image
            src={logoSrc}
            alt={t("nav.logoAlt")}
            className="h-8 w-full"
            priority
          />
        </Link>
        <nav
          aria-label={t("nav.ariaSiteNav")}
          className="flex items-center gap-2 text-sm font-medium"
        >
          {[
            ["/resume-builder", t("nav.builder")],
            ["/resume-parser", t("nav.parser")],
          ].map(([href, text]) => (
            <Link
              key={href}
              className="rounded-md px-1.5 py-2 text-gray-500 hover:bg-gray-100 focus-visible:bg-gray-100 lg:px-4"
              href={href}
            >
              {text}
            </Link>
          ))}
          <button
            type="button"
            className="rounded-md px-2 py-1 text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
            onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            aria-label={t("language.ariaToggle")}
          >
            {locale === "zh" ? t("language.switchToEn") : t("language.switchToZh")}
          </button>
          <div className="ml-1 mt-1">
            <iframe
              src="https://ghbtns.com/github-btn.html?user=xitanggg&repo=open-resume&type=star&count=true"
              width="100"
              height="20"
              className="overflow-hidden border-none"
              title={t("nav.githubIframeTitle")}
            />
          </div>
        </nav>
      </div>
    </header>
  );
};
