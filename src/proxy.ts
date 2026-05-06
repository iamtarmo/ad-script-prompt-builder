import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "ad_prompt_builder_access";

function isPublicPath(pathname: string) {
  return pathname === "/locked" || pathname === "/unlock";
}

export function proxy(request: NextRequest) {
  const accessToken = process.env.ACCESS_TOKEN;
  const isProduction = process.env.NODE_ENV === "production";
  const { pathname } = request.nextUrl;

  if (!isProduction || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!accessToken) {
    return new NextResponse("ACCESS_TOKEN is not configured.", { status: 500 });
  }

  const cookieToken = request.cookies.get(ACCESS_COOKIE)?.value;
  if (cookieToken === accessToken) {
    return NextResponse.next();
  }

  const lockedUrl = request.nextUrl.clone();
  lockedUrl.pathname = "/locked";
  lockedUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(lockedUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
