import { Chip } from "@mui/material";

// Mirrors the backend's real CreativeConceptStatus values (app.models.enums.ContentStatus)
// mapped onto the spec's status vocabulary (§34) — "rejected" reads as "Changes
// requested" since a rejection always carries a reason. PUBLISHING/FAILED/CANCELLED
// aren't real concept states in aidigiplanner-backend, so they're not offered here.
const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  draft: { label: "Draft", bg: "#E8DDD2", color: "#6B5E57" },
  in_review: { label: "In Review", bg: "#E8A838", color: "#3D2F2A" },
  rejected: { label: "Changes Requested", bg: "#E25030", color: "#FFF9F5" },
  approved: { label: "Approved", bg: "#2A9D6A", color: "#FFF9F5" },
  scheduled: { label: "Scheduled", bg: "#FF6B45", color: "#FFF9F5" },
  published: { label: "Published", bg: "#1F8A80", color: "#FFF9F5" },
};

export function StatusBadge({ status, size = "small" }: { status?: string | null; size?: "small" | "medium" }) {
  const key = (status ?? "draft").toLowerCase();
  const meta = STATUS_META[key] ?? { label: status ?? "Draft", bg: "#E8DDD2", color: "#6B5E57" };

  return (
    <Chip
      size={size}
      label={meta.label}
      sx={{
        backgroundColor: meta.bg,
        color: meta.color,
        fontWeight: 700,
        fontSize: size === "small" ? 11 : 12.5,
      }}
    />
  );
}
