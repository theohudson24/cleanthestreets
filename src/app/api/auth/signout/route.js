import { clearSessionCookie, invalidateSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { requireCsrf, toErrorResponse } from "@/lib/security";

export async function POST(request) {
  try {
    const csrfError = requireCsrf(request);
    if (csrfError) {
      return csrfError;
    }

    await invalidateSession(request);

    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully",
    });
    clearSessionCookie(response);

    return response;
  } catch (error) {
    return toErrorResponse(error, "Sign out failed");
  }
}
