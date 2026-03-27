export function serializeReport(report) {
  const imageUrls = report.images?.map((image) => image.url) ?? [];

  return {
    ...report,
    imageUrl: imageUrls[0] ?? null,
    imageUrls: imageUrls.length > 0 ? imageUrls : null,
  };
}

export function canManageReport(user, report) {
  if (!user || !report) return false;
  return user.role === "admin" || report.userId === user.id;
}
