export function normalizeVideoStatus(value) {
  const rawStatus = typeof value === "string"
    ? value
    : value?.video?.status ?? value?.status ?? value?.data?.video?.status ?? value?.data?.status;
  if (typeof rawStatus !== "string") return "unknown";

  const status = rawStatus.toLowerCase();
  if (["ready", "processed", "complete", "completed", "succeeded", "success"].includes(status)) return "ready";
  if (["processing", "queued", "pending"].includes(status)) return "processing";
  if (["failed", "error"].includes(status)) return "failed";
  if (["uploaded", "uploading"].includes(status)) return "uploaded";
  return "unknown";
}
