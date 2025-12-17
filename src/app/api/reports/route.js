import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "500");

    const reports = await prisma.report.findMany({
      include: {
        images: true,
        user: { select: { id: true, displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 1000),
    });

    return Response.json(reports);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch reports", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Basic validation
    if (
      !body.issueType ||
      typeof body.latitude !== "number" ||
      typeof body.longitude !== "number"
    ) {
      return Response.json(
        { error: "Missing required fields: issueType, latitude, longitude" },
        { status: 400 }
      );
    }

    const data = {
      issueType: body.issueType,
      description: body.description ?? null,
      latitude: body.latitude,
      longitude: body.longitude,
      severity: body.severity ?? 1,
      address: body.address ?? null,
    };

    if (body.userId) data.user = { connect: { id: body.userId } };

    const created = await prisma.report.create({ data });

    // If images are provided as URLs, create ReportImage records
    if (Array.isArray(body.imageUrls) && body.imageUrls.length) {
      const imageCreates = body.imageUrls.map((url) =>
        prisma.reportImage.create({ data: { reportId: created.id, url } })
      );
      await Promise.all(imageCreates);
    }

    const result = await prisma.report.findUnique({
      where: { id: created.id },
      include: {
        images: true,
        user: { select: { id: true, displayName: true } },
      },
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: "Failed to create report", details: error.message },
      { status: 500 }
    );
  }
}
