import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        images: true,
        user: { select: { id: true, displayName: true } },
      },
    });

    if (!report)
      return Response.json({ error: "Report not found" }, { status: 404 });

    return Response.json(report);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch report", details: error.message },
      { status: 500 }
    );
  }
}
