import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "ad_prompt_builder_access";

export function GET(request: NextRequest) {
  const accessToken = process.env.ACCESS_TOKEN;
  const submittedToken = request.nextUrl.searchParams.get("token");
  const requestedRedirect = request.nextUrl.searchParams.get("next") || "/";
  const redirectTo = requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//") ? requestedRedirect : "/";

  if (!accessToken) {
    return new NextResponse("ACCESS_TOKEN is not configured.", { status: 500 });
  }

  if (submittedToken !== accessToken) {
    const lockedUrl = new URL("/locked?error=invalid", request.url);
    return NextResponse.redirect(lockedUrl);
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  return response;
}
