"use client";

import type { Locale } from "lib/i18n/locale-types";
import { LocaleProvider } from "lib/i18n/LocaleProvider";
import { DocumentLang } from "lib/i18n/DocumentLang";
import { Provider } from "react-redux";
import { store } from "lib/redux/store";

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  return (
    <Provider store={store}>
      <LocaleProvider initialLocale={initialLocale}>
        <DocumentLang />
        {children}
      </LocaleProvider>
    </Provider>
  );
}
