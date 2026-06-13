import bcrypt from "bcryptjs";
import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  applyRateLimit,
  logSecurityEvent,
  readValidatedJson,
  requireCsrf,
  toErrorResponse,
} from "@/lib/security";
import { passwordChangeSchema } from "@/lib/validation";

const PASSWORD_HASH_ROUNDS = 12;

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
      bucket: "profile:password",
      identity: auth.user.id,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { currentPassword, newPassword } = await readValidatedJson(
      request,
      passwordChangeSchema
    );

    const valid = bcrypt.compareSync(currentPassword, auth.user.passwordHash);
    if (!valid) {
      logSecurityEvent("password_change_failed", request, {
        userId: auth.user.id,
        reason: "bad_current_password",
      });
      return Response.json(
        { error: "Current password is incorrect." },
        { status: 401 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, PASSWORD_HASH_ROUNDS);
    const updatedUser = await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        passwordHash,
        passwordUpdatedAt: new Date(),
      },
      select: {
        passwordUpdatedAt: true,
      },
    });

    return Response.json({
      passwordUpdatedAt: updatedUser.passwordUpdatedAt,
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to update password");
  }
}
