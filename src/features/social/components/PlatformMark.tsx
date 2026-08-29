import { Box } from "@mui/material";

const colors: Record<string, string> = {
  Instagram: "#E1306C",
  Facebook: "#1877F2",
  YouTube: "#FF0000",
  LinkedIn: "#0A66C2",
  TikTok: "#1F8A80",
  X: "#4A342C",
  Threads: "#4A342C",
  "Google Business": "#1F8A80",
  Blog: "#FF6B45",
};

export function platformColor(platform: string) {
  return colors[platform] ?? "#FF6B45";
}

export function PlatformMark({ platform, size = 18 }: { platform: string; size?: number }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "4px",
        backgroundColor: platformColor(platform),
        color: "#FFF9F5",
        display: "grid",
        placeItems: "center",
        fontSize: size * 0.48,
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      {platform.charAt(0)}
    </Box>
  );
}

export function handleFromName(name: string) {
  return `@${name.replace(/\s+/g, "").slice(0, 16).toLowerCase()}`;
}

export function mediaTone(kind: string) {
  if (kind === "video" || kind === "reel" || kind === "short") return "#1F8A80";
  if (kind === "blog" || kind === "document") return "#8A6F64";
  return "#FF6B45";
}
