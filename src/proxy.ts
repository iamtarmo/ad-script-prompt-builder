import { NextRequest, NextResponse } from "next/server";

const REALM = "Ad Script Prompt Builder";

function unauthorized(message = "Authentication required") {
  return new NextResponse(message, {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

export function proxy(request: NextRequest) {
  const password = process.env.PRIVATE_ACCESS_PASSWORD;
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    return NextResponse.next();
  }

  if (!password) {
    return unauthorized("PRIVATE_ACCESS_PASSWORD is not configured.");
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) {
    return unauthorized();
  }

  try {
    const decoded = atob(header.replace("Basic ", ""));
    const [, submittedPassword] = decoded.split(":");

    if (submittedPassword === password) {
      return NextResponse.next();
    }
  } catch {
    return unauthorized();
  }

  return unauthorized("Invalid password");
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
