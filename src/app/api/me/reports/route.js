import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serializeReport } from "@/lib/reports";
import { parseValidatedSearchParams, toErrorResponse } from "@/lib/security";
import { myReportsQuerySchema } from "@/lib/validation";

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { limit } = parseValidatedSearchParams(request, myReportsQuerySchema);

    const reports = await prisma.report.findMany({
      where: { userId: user.id },
      include: {
        images: true,
        user: { select: { id: true, displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return Response.json(reports.map(serializeReport));
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch your reports");
  }
}
