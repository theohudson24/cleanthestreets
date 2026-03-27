import prisma from "@/lib/prisma";
import { parseValidatedSearchParams, toErrorResponse } from "@/lib/security";
import { leaderboardQuerySchema } from "@/lib/validation";

export async function GET(request) {
  try {
    const { period, limit } = parseValidatedSearchParams(
      request,
      leaderboardQuerySchema
    );
    const where = { userId: { not: null } };

    if (period === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      where.createdAt = { gte: oneWeekAgo };
    }

    const grouped = await prisma.report.groupBy({
      by: ["userId"],
      where,
      _count: { _all: true },
      orderBy: {
        _count: {
          userId: "desc",
        },
      },
      take: limit,
    });

    const userIds = grouped.map((entry) => entry.userId).filter(Boolean);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        location: true,
      },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));
    const leaderboard = grouped.map((entry, index) => {
      const user = userMap.get(entry.userId);

      return {
        userId: entry.userId,
        rank: index + 1,
        displayName: user?.displayName ?? "User",
        totalReports: entry._count._all,
        avatar: user?.avatarUrl ?? null,
        location: user?.location ?? null,
      };
    });

    return Response.json(leaderboard);
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch leaderboard");
  }
}
