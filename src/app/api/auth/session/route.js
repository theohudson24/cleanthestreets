import { getCurrentUser, toPublicUser } from "@/lib/auth";
import { getCsrfToken, setCsrfCookie, toErrorResponse } from "@/lib/security";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    const response = NextResponse.json({ user: toPublicUser(user) });
    if (!getCsrfToken(request)) {
      setCsrfCookie(response);
    }
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch session");
  }
}
