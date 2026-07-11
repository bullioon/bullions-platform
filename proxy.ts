import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "bullions_v6_access";

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/logo.png" ||
    pathname === "/icon.png" ||
    pathname === "/apple-icon.png" ||
    pathname.startsWith("/images/")
  );
}

function isOperationalRoute(pathname: string) {
  return (
    pathname.startsWith("/api/mt5/") ||
    pathname.startsWith("/api/cron/") ||
    pathname.startsWith("/api/dev/") ||
    pathname === "/api/challenge/confirm-payment"
  );
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (
    pathname === "/coming-soon" ||
    isPublicAsset(pathname) ||
    isOperationalRoute(pathname)
  ) {
    return NextResponse.next();
  }

  if (process.env.BULLIONS_COMING_SOON !== "true") {
    return NextResponse.next();
  }

  const configuredKey = process.env.BULLIONS_PREVIEW_KEY;
  const suppliedKey = searchParams.get("access");
  const hasSavedAccess =
    request.cookies.get(ACCESS_COOKIE)?.value === "granted";

  if (
    configuredKey &&
    suppliedKey &&
    suppliedKey === configuredKey
  ) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("access");

    const response = NextResponse.redirect(cleanUrl);

    response.cookies.set(ACCESS_COOKIE, "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  }

  if (hasSavedAccess) {
    return NextResponse.next();
  }

  const comingSoonUrl = request.nextUrl.clone();
  comingSoonUrl.pathname = "/coming-soon";
  comingSoonUrl.search = "";

  return NextResponse.rewrite(comingSoonUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
