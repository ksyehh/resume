"use client";
import Image from "next/image";
import logoSrc from "public/logo.svg";
import { cx } from "lib/cx";
import { useLocale } from "lib/i18n/LocaleProvider";

export const TopNavBar = () => {
  const { t } = useLocale();

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
            className="h-8"
            priority
          />
        </a>
        <nav
          aria-label={t("nav.ariaSiteNav")}
          className="flex items-center gap-2 text-sm font-medium"
        >
        </nav>
      </div>
    </header>
  );
};
