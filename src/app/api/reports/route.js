import { getCurrentUser, requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serializeReport } from "@/lib/reports";
import {
  applyRateLimit,
  parseValidatedSearchParams,
  readValidatedJson,
  requireCsrf,
  toErrorResponse,
} from "@/lib/security";
import { createReportSchema, reportsQuerySchema } from "@/lib/validation";

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    const { limit, page, issueType, status, mine } = parseValidatedSearchParams(
      request,
      reportsQuerySchema
    );

    const where = {};

    if (issueType) {
      where.issueType = issueType;
    }

    if (status) {
      where.status = status;
    }

    if (mine) {
      if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      where.userId = user.id;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          images: true,
          user: { select: { id: true, displayName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return Response.json({
      items: reports.map(serializeReport),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch reports");
  }
}

export async function POST(request) {
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
      bucket: "reports:create",
      identity: auth.user.id,
      limit: 15,
      windowMs: 15 * 60 * 1000,
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await readValidatedJson(request, createReportSchema);

    const created = await prisma.report.create({
      data: {
        user: { connect: { id: auth.user.id } },
        issueType: body.issueType,
        description: body.description,
        latitude: body.latitude,
        longitude: body.longitude,
        severity: body.severity,
        address: body.address,
        images: body.images.length > 0
          ? {
              create: body.images.map((image) => ({
                url: image.url,
                publicId: image.publicId ?? null,
                width: image.width ?? null,
                height: image.height ?? null,
                format: image.format ?? null,
                bytes: image.bytes ?? null,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        user: { select: { id: true, displayName: true } },
      },
    });

    return Response.json(serializeReport(created), { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Failed to create report");
  }
}
