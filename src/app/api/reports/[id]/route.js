import { getCurrentUser, isAdmin, requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { canManageReport, serializeReport } from "@/lib/reports";
import {
  applyRateLimit,
  forbiddenError,
  logSecurityEvent,
  parseValidatedParam,
  readValidatedJson,
  requireCsrf,
  toErrorResponse,
} from "@/lib/security";
import { reportIdSchema, updateReportSchema } from "@/lib/validation";

async function parseId(params) {
  const resolvedParams = await params;
  return parseValidatedParam(resolvedParams.id, reportIdSchema);
}

export async function GET(request, { params }) {
  try {
    const id = await parseId(params);
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        images: true,
        user: { select: { id: true, displayName: true } },
      },
    });

    if (!report) {
      return Response.json({ error: "Report not found" }, { status: 404 });
    }

    return Response.json(serializeReport(report));
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch report");
  }
}

export async function PATCH(request, { params }) {
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
      bucket: "reports:update",
      identity: auth.user.id,
      limit: 30,
      windowMs: 15 * 60 * 1000,
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const id = await parseId(params);
    const existing = await prisma.report.findUnique({
      where: { id },
      include: {
        images: true,
        user: { select: { id: true, displayName: true } },
      },
    });

    if (!existing) {
      return Response.json({ error: "Report not found" }, { status: 404 });
    }

    if (!canManageReport(auth.user, existing)) {
      logSecurityEvent("report_update_forbidden", request, {
        userId: auth.user.id,
        reportId: String(id),
      });
      return forbiddenError();
    }

    const body = await readValidatedJson(request, updateReportSchema);
    const data = {};

    if (body.description !== undefined) {
      data.description = body.description;
    }

    if (body.address !== undefined) {
      data.address = body.address;
    }

    if (body.severity !== undefined) {
      data.severity = body.severity;
    }

    if (body.issueType !== undefined) {
      data.issueType = body.issueType;
    }

    if (body.status !== undefined) {
      if (!isAdmin(auth.user)) {
        logSecurityEvent("report_status_update_forbidden", request, {
          userId: auth.user.id,
          reportId: String(id),
        });
        return forbiddenError("Only admins can update report status.");
      }

      data.status = body.status;
    }

    const updated = await prisma.report.update({
      where: { id },
      data,
      include: {
        images: true,
        user: { select: { id: true, displayName: true } },
      },
    });

    return Response.json(serializeReport(updated));
  } catch (error) {
    return toErrorResponse(error, "Failed to update report");
  }
}

export async function DELETE(request, { params }) {
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
      bucket: "reports:delete",
      identity: auth.user.id,
      limit: 15,
      windowMs: 15 * 60 * 1000,
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const id = await parseId(params);
    const existing = await prisma.report.findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json({ error: "Report not found" }, { status: 404 });
    }

    if (!canManageReport(auth.user, existing)) {
      logSecurityEvent("report_delete_forbidden", request, {
        userId: auth.user.id,
        reportId: String(id),
      });
      return forbiddenError();
    }

    await prisma.reportImage.deleteMany({ where: { reportId: id } });
    await prisma.report.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    return toErrorResponse(error, "Failed to delete report");
  }
}
