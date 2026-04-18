"use client";

import { useEffect } from "react";
import { useLocale } from "lib/i18n/LocaleProvider";

export function DocumentLang() {
  const { locale } = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  return null;
}
