import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STORAGE_KEY = "open-resume-locale";

/** Optional: echo locale cookie into request headers for debugging / future SSR i18n; does not change URLs. */
export function middleware(request: NextRequest) {
  const locale = request.cookies.get(STORAGE_KEY)?.value;
  const requestHeaders = new Headers(request.headers);
  if (locale === "zh" || locale === "en") {
    requestHeaders.set("x-open-resume-locale", locale);
  }
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
