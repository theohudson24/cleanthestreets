import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  applyRateLimit,
  logSecurityEvent,
  readValidatedJson,
  requireCsrf,
  toErrorResponse,
} from "@/lib/security";
import { profileUpdateSchema } from "@/lib/validation";

function buildProfile(user, totalReports, groupedByStatus) {
  const reportStats = {
    reported: 0,
    in_progress: 0,
    fixed: 0,
  };

  for (const row of groupedByStatus) {
    reportStats[row.status] = row._count._all;
  }

  return {
    id: user.id,
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    avatar: user.avatarUrl,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    location: user.location,
    role: user.role,
    memberSince: user.createdAt,
    themePreference: user.themePreference,
    passwordUpdatedAt: user.passwordUpdatedAt,
    totalReports,
    reportStats,
  };
}

export async function GET(request) {
  try {
    const auth = await requireUser(request);
    if (auth.response) {
      return auth.response;
    }

    const [totalReports, groupedByStatus] = await Promise.all([
      prisma.report.count({ where: { userId: auth.user.id } }),
      prisma.report.groupBy({
        by: ["status"],
        where: { userId: auth.user.id },
        _count: { _all: true },
      }),
    ]);

    return Response.json(
      buildProfile(auth.user, totalReports, groupedByStatus)
    );
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch profile");
  }
}

export async function PATCH(request) {
  try {
    const auth = await requireUser(request);
    if (auth.response) {
      return auth.response;
    }

    const csrfError = requireCsrf(request);
    if (csrfError) {
      return csrfError;
    }

    const rateLimitResponse = applyRateLimit(request, {
      bucket: "profile:update",
      identity: auth.user.id,
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { displayName, bio, location, avatarUrl, themePreference } = await readValidatedJson(
      request,
      profileUpdateSchema
    );

    const updatedUser = await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        displayName,
        bio,
        location,
        avatarUrl,
        ...(themePreference ? { themePreference } : {}),
      },
    });

    const [totalReports, groupedByStatus] = await Promise.all([
      prisma.report.count({ where: { userId: auth.user.id } }),
      prisma.report.groupBy({
        by: ["status"],
        where: { userId: auth.user.id },
        _count: { _all: true },
      }),
    ]);

    return Response.json(
      buildProfile(updatedUser, totalReports, groupedByStatus)
    );
  } catch (error) {
    if (!(error?.issues)) {
      logSecurityEvent("profile_update_failed", request, {});
    }
    return toErrorResponse(error, "Failed to update profile");
  }
}
