import "globals.css";
import { cookies } from "next/headers";
import { TopNavBar } from "components/TopNavBar";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "components/Providers";
import { LOCALE_PERSIST_KEY } from "lib/i18n/locale-persist-key";
import type { Locale } from "lib/i18n/locale-types";

function readInitialLocaleFromCookie(): Locale {
  const value = cookies().get(LOCALE_PERSIST_KEY)?.value;
  if (value === "zh" || value === "en") {
    return value;
  }
  return "zh";
}

export const metadata = {
  title:
    "PMCV丨产品经理专属简历制作工具",
  description:
    "PMCV：免费开源的产品经理简历生成器；亦可解析 PDF 简历并检测 ATS 可读性。",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLocale = readInitialLocaleFromCookie();
  const htmlLang = initialLocale === "zh" ? "zh-CN" : "en";

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/NotoSansSC-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/NotoSansSC-Bold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers initialLocale={initialLocale}>
          <TopNavBar />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
