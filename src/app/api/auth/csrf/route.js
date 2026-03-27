import { NextResponse } from "next/server";
import { createCsrfToken, getCsrfToken, setCsrfCookie } from "@/lib/security";

export async function GET(request) {
  const existingToken = getCsrfToken(request);
  if (!existingToken) {
    const token = createCsrfToken();
    const response = NextResponse.json({ csrfToken: token });
    setCsrfCookie(response, token);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const response = NextResponse.json({
    csrfToken: existingToken,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
